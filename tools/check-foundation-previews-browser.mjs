import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {openCDPSocket} from './cdp-socket.mjs';
const root=process.cwd(),profile=fs.mkdtempSync(path.join(os.tmpdir(),'tjkt-foundations-'));
const server=http.createServer((req,res)=>{try{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name==='/favicon.ico'){res.writeHead(204);res.end();return;}
 const file=path.resolve(root,'.'+name+(name.endsWith('/')?'index.html':''));if(!file.startsWith(root+path.sep))throw Error('Path');
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 }catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/`;
const executable=process.env.TJKT_QA_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const edge=spawn(executable,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let socket;const errors=[],pending=new Map();let serial=0;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;const timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},15000);pending.set(id,{resolve:v=>{clearTimeout(timeout);resolve(v);},reject});socket.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
try{
 let port;for(let i=0;i<100;i++){const p=path.join(profile,'DevToolsActivePort');try{if(fs.existsSync(p)){port=fs.readFileSync(p,'utf8').split('\n')[0];if(port)break;}}catch{}await pause(100);}if(!port)throw Error('Browser debugging port unavailable');
 const targets=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=await openCDPSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});
 await cdp('Runtime.enable');await cdp('Page.enable');
 const navigate=async relative=>{await cdp('Page.navigate',{url:base+relative});await evaluate('new Promise((resolve,reject)=>{let n=0;const t=()=>{if(document.readyState==="complete")return resolve(true);if(++n>100)return reject(Error("Page load"));setTimeout(t,50)};t()})');await pause(150);};
 await navigate('');
 const catalog=await evaluate('new Promise((resolve,reject)=>{let n=0;const t=()=>{if(document.querySelectorAll(".module-card").length===56)return resolve({cards:56,drafts:[...document.querySelectorAll(".module-card a")].filter(a=>a.textContent.includes("Pratinjau draft")).length,groups:document.querySelectorAll(".module-group[data-phase=E]").length});if(++n>100)return reject(Error(document.body.innerText));setTimeout(t,50)};t()})');
 assert.equal(catalog.drafts,0);assert.equal(catalog.groups,4);
 await evaluate('localStorage.setItem("tjkt:local-instructor:v1","off");localStorage.setItem("qa:preserve","existing student data")');
 const drafts=JSON.parse(fs.readFileSync('data/atp-fase-e.json','utf8')).newModules;const results=[];
 for(const draft of drafts){await navigate(`modules/dasar-jaringan/${draft.id}/`);
  await evaluate('new Promise((resolve,reject)=>{let n=0;const t=()=>{if(document.querySelectorAll("#lessonNav>button").length>=8)return resolve(true);if(++n>100)return reject(Error("Course initialization failed"));setTimeout(t,50)};t()})');
  assert(await evaluate('document.querySelectorAll("[data-foundation-draft] button,[data-virtual-lab] button").length>1'));
  const course=JSON.parse(fs.readFileSync(`data/${draft.id}.json`,'utf8'));
  assert(await evaluate('document.querySelectorAll("#lessonNav>button")[1].disabled'),'Sequential gate');
  assert(await evaluate('!document.querySelector("[data-certificate-action=print]")'),'Certificate initially locked');
  for(const chapter of course.chapters){
   const answers=chapter.questions.map(q=>q.answer);
   if(chapter.id==='evaluasi'){
    await evaluate(`(()=>{const form=document.querySelector('#evaluasi').parentElement.querySelector('form.chapter-check-form');const answers=${JSON.stringify(chapter.questions.map(q=>(q.answer+1)%q.options.length))};form.querySelectorAll('fieldset').forEach((field,i)=>field.querySelector('input[value="'+answers[i]+'"]').click());form.requestSubmit();})()`);
    assert(await evaluate('!document.querySelector("[data-certificate-action=print]")'),'Failed final must not allow certificate');
   }
   await evaluate(`(()=>{const section=document.querySelector('#${chapter.id}');const form=section.parentElement.querySelector('form.chapter-check-form');const answers=${JSON.stringify(answers)};form.querySelectorAll('fieldset').forEach((field,i)=>{field.querySelector('input[value="'+answers[i]+'"]').click();});form.requestSubmit();})()`);
   if(chapter.id!=='evaluasi')await evaluate('document.getElementById("nextChapter").click()');
  }
  assert(await evaluate('document.getElementById("progressLabel").textContent==="100%"'));
  await evaluate('window.print=()=>{window.__printed=true};document.querySelector("[name=certificateName]").value="Siswa Uji Lokal";document.querySelector(".module-certificate-panel form").requestSubmit()');
  await evaluate('new Promise((resolve,reject)=>{let n=0;const t=()=>{const p=document.querySelector("[data-certificate-action=print]");if(p&&!p.disabled)return resolve(true);if(++n>100)return reject(Error("Certificate not ready"));setTimeout(t,50)};t()})');
  await evaluate('document.querySelector("[data-certificate-action=print]").click()');await pause(300);
  assert(await evaluate('window.__printed===true'),'Print callback');
  await navigate(`modules/dasar-jaringan/${draft.id}/`);await pause(400);
  assert(await evaluate('document.getElementById("progressLabel").textContent==="100%"'),'Reload restores progress');
  assert.equal(await evaluate('localStorage.getItem("qa:preserve")'),'existing student data');
  const installers=[];
  if(draft.id!=='konfigurasi-perangkat-dasar'){
   await evaluate(fs.readFileSync('tools/virtual-lab-browser-actions.js','utf8'));
   const sessions=draft.id==='virtualisasi-server-dasar'?[{session:'vm-main',chapter:'laboratorium',manual:true}]:[{session:'os-ubuntu',chapter:'linux-desktop',manual:false},{session:'os-windows',chapter:'windows-desktop',manual:false}];
   for(const session of sessions){
    await evaluate(`document.querySelectorAll('#lessonNav>button')[${course.chapters.findIndex(c=>c.id===session.chapter)}].click()`);
    installers.push(await evaluate(`window.__testInstaller('[data-session="${session.session}"]',${JSON.stringify({manual:session.manual,name:'Guest-'+session.session})})`));
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".chapter-unit:not([hidden]) .vml-desktop h3")).color'),'rgb(255, 255, 255)','Readable desktop heading contrast');
   }
   assert(await evaluate('Object.keys(localStorage).filter(k=>k.includes(":vm-lab:")).every(k=>!localStorage.getItem(k).includes("fiktif-ujilab"))'),'No password in saved simulator');
  }
  await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Mobile overflow '+draft.id);
  const capture=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`docs/${draft.id}-simulator.png`,Buffer.from(capture.data,'base64'));
  if(installers.length){
   await evaluate('document.querySelector(".chapter-unit:not([hidden]) [data-virtual-lab] .vml-workspace").scrollIntoView({block:"start"})');
   await new Promise(r=>setTimeout(r,250));const mobile=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`docs/${draft.id}-lab-mobile.png`,Buffer.from(mobile.data,'base64'));
   await cdp('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
   await evaluate('document.querySelector(".chapter-unit:not([hidden]) [data-virtual-lab] .vml-workspace").scrollIntoView({block:"start"})');
   await new Promise(r=>setTimeout(r,250));const desktop=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`docs/${draft.id}-lab-desktop.png`,Buffer.from(desktop.data,'base64'));
   const raw=JSON.stringify({version:2,current:'evaluasi',passed:Object.fromEntries(course.legacyChapters.map(ch=>[ch.id,100])),scores:Object.fromEntries(course.legacyChapters.map(ch=>[ch.id,100]))});
   await evaluate(`localStorage.setItem(${JSON.stringify(`tjkt:${draft.id}:course:v2`)},${JSON.stringify(raw)})`);
   await navigate(`modules/dasar-jaringan/${draft.id}/`);await new Promise(r=>setTimeout(r,200));
   assert(await evaluate('document.querySelectorAll("#lessonNav>button").length===8&&document.getElementById("progressLabel").textContent==="100%"&&document.querySelector(".module-certificate-panel").dataset.eligible==="true"'),'Old eight-stage completion retained');
   assert.equal(await evaluate(`localStorage.getItem(${JSON.stringify(`tjkt:${draft.id}:course:v2`)})`),raw,'Legacy grade record unchanged');
  }
  results.push({id:draft.id,interactive:true,stagesPassed:course.chapters.length,certificatePrint:true,failedFinalBlocked:true,reloadRestored:true,mobileOverflow:false,legacyCompletionPreserved:installers.length>0,installers});
 }
 assert.equal(errors.length,0);const report={result:'PASS',catalog,drafts:results,javascriptErrors:0};fs.writeFileSync('docs/foundation-previews-browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{socket?.close();edge.kill();server.close();}
