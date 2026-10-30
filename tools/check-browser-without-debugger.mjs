import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {spawn} from 'node:child_process';
const root=process.cwd(),server=http.createServer((req,res)=>{
 try{
  const name=new URL(req.url,'http://localhost').pathname;
  if(name==='/__audit__/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><head><meta charset="utf-8"><title>Audit running</title></head><body><pre id="result">RUNNING</pre><iframe style="width:1200px;height:900px"></iframe><script src="/tools/browser-foundation-harness.js"></script></body></html>');return;}
  if(name==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const file=path.resolve(root,'.'+decodeURIComponent(name)+(name.endsWith('/')?'index.html':''));if(!file.startsWith(root+path.sep))throw Error('Path');
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'tjkt-dump-'));
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-timer-throttling','--disable-renderer-backgrounding','--dump-dom','--virtual-time-budget=60000',`--user-data-dir=${profile}`,`http://127.0.0.1:${server.address().port}/__audit__/`],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',stderr='';browser.stdout.on('data',d=>output+=d);browser.stderr.on('data',d=>stderr+=d);
const timer=setTimeout(()=>browser.kill(),60000);
try{
 const code=await new Promise(resolve=>browser.on('exit',resolve));
 const report=output.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1]?.replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>');
 if(!report||report==='RUNNING'){console.log(JSON.stringify({result:'BLOCKED',code,domBytes:output.length,reason:'Browser did not return completed audit DOM',diagnostic:stderr.slice(-600)}));process.exitCode=1;}
 else{fs.writeFileSync('docs/foundation-browser-audit.json',report+'\n');console.log(report);if(JSON.parse(report).result!=='PASS')process.exitCode=1;}
}finally{clearTimeout(timer);browser.kill();server.close();}
