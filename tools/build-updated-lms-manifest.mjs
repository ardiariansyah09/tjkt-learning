import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {openCDPSocket} from './cdp-socket.mjs';
const root=process.cwd(),profile=fs.mkdtempSync(path.join(os.tmpdir(),'tjkt-manifest-'));
const server=http.createServer((req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://local').pathname);if(name==='/favicon.ico'){res.writeHead(204);res.end();return;}const file=path.resolve(root,'.'+name+(name.endsWith('/')?'index.html':''));if(!file.startsWith(root+path.sep))throw Error('Path');res.setHeader('Content-Type',({'.js':'text/javascript','.json':'application/json','.css':'text/css','.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/`;
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let socket,id=0;const pending=new Map(),errors=[];const pause=ms=>new Promise(r=>setTimeout(r,ms));
const cdp=(method,params={})=>new Promise((resolve,reject)=>{const request=++id;pending.set(request,{resolve,reject});socket.send(JSON.stringify({id:request,method,params}));});
const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
try{
 let port;for(let n=0;n<100;n++){try{port=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];if(port)break;}catch{}await pause(100);}if(!port)throw Error('Browser unavailable');
 const targets=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=await openCDPSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});
 await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.setItem("tjkt:local-instructor:v1","off")'});
 const catalog=JSON.parse(fs.readFileSync('data/modules.json','utf8')),manifest=[];
 for(const module of catalog.filter(m=>m.status==='published')){
  await cdp('Page.navigate',{url:base+module.path});await pause(120);
  const snapshot=await evaluate(`(async()=>{for(let n=0;n<100;n++){if(document.querySelectorAll('.lesson-nav>button').length)break;await new Promise(r=>setTimeout(r,50));}const {completionSnapshot}=await import(${JSON.stringify(base+'assets/js/module-certificate.js')});const s=completionSnapshot();return {key:s.key,stages:s.missing.map(x=>({id:x.id,title:x.title,threshold:x.threshold}))};})()`);
  if(!snapshot.stages.length)throw Error('Missing stages '+module.id);
  manifest.push({id:module.id,title:module.title,description:module.description,phase:module.phase,grade:{X:10,XI:11,XII:12}[module.classLevel],category:module.category,path:module.path,prerequisites:module.prerequisites,key:snapshot.key,stages:snapshot.stages});
  if(manifest.length%10===0)console.log('Rendered',manifest.length,'modules');
 }
 if(errors.length)throw Error(JSON.stringify(errors));
 const target='lms/storage/app/learning-pack/manifest.json';fs.copyFileSync(target,'docs/lms-manifest-before-curriculum-update.json');fs.writeFileSync(target,JSON.stringify(manifest,null,2)+'\n');console.log('PASS manifest:',manifest.length,'modules,',manifest.reduce((n,m)=>n+m.stages.length,0),'stages');
}finally{socket?.close();browser.kill();server.close();}
