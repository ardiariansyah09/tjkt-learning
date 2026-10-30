import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newVirtualLab,virtualAction,currentScreen} from '../assets/js/virtual-lab-model.js';
let assertions=0;
function scenario(os,{manual=false}={}){
 let state=newVirtualLab();const act=(action,payload={},expected=true)=>{const result=virtualAction(state,action,payload);assert.equal(result.ok,expected,`${os}/${action}: ${result.text}`);state=result.state;assertions++;return result;};
 act('start',{},false);act('create',{name:`Lab-${os}`,os,iso:os,ram:4,cpu:2,disk:64});
 act('settings',{iso:'none'});act('start',{},false);act('settings',{iso:os==='ubuntu'?'windows':'ubuntu'});act('start',{},false);
 act('settings',{iso:os,ram:16});act('start',{},false);act('settings',{ram:4});
 if(os==='windows'){act('settings',{tpm:false});act('start',{},false);act('settings',{tpm:true});}
 act('start');act('settings',{ram:8},false);
 let tried=false,guard=0;
 while(currentScreen(state.vms[0])!=='desktop'){
  assert(++guard<60);const screen=currentScreen(state.vms[0]);
  if(screen==='welcome'&&!tried){act('try');act('next',{},false);assert.equal(state.vms[0].installed,null);act('return-installer');tried=true;}
  if(screen==='method'){act('install-set',{method:'automated'});act('next',{},false);act('install-set',{method:'interactive'});}
  if(screen==='license'){act('next',{},false);act('install-set',{licensed:true});}
  if(screen==='disk'){
   act('install-set',{diskId:1});act('next',{},false);assert.equal(state.vms[0].installed,null);act('install-set',{diskId:0});
   if(manual){act('install-set',{layout:'manual'});act('next',{},false);act('partition',{mount:'/boot/efi',fs:'fat32',size:1});act('partition',{mount:'/',fs:'ext4',size:80},false);act('partition',{mount:'/',fs:'ext4',size:40});act('partition',{mount:'/',fs:'ext4',size:5},false);}
  }
  if(screen==='account'){act('next',{},false);act('install-set',{username:'siswa',hostname:`lab-${os}`,accountReady:true});}
  if(screen==='review'){act('next',{},false);act('install-set',{confirmed:true});}
  if(screen==='copy'){act('copy');continue;}
  if(screen==='restart'){act('restart',{},false);act('eject');act('restart');continue;}
  act('next');
 }
 const vm=state.vms[0];assert(vm.bootVerified&&vm.installed);assert.equal(vm.bootSource,'disk');assert.equal(vm.installed.hostname,`lab-${os}`);assert(!JSON.stringify(state).includes('password'));
 act('shutdown');act('snapshot');act('start');act('change-data');assert.equal(state.vms[0].installed.dataVersion,2);act('restore',{},false);act('shutdown');act('restore');act('start');assert.equal(state.vms[0].installed.dataVersion,1);
 act('shutdown');act('clone');act('start');act('select',{id:2});act('start');act('network-test',{peer:1},false);act('shutdown');act('settings',{ip:'192.168.50.20'});act('start');act('network-test',{peer:1});
 act('shutdown');act('settings',{segment:'other'});act('start');act('network-test',{peer:1},false);act('shutdown');act('settings',{segment:'kelas-x',network:'nat'});act('start');act('network-test',{peer:1},false);
 assert.equal(state.evidence.network,true);assert.equal(state.evidence.restored,true);return {os,manual,screens:guard,evidence:state.evidence};
}
const results=[scenario('ubuntu'),scenario('ubuntu',{manual:true}),scenario('windows'),scenario('ubuntu-server')];
let state=newVirtualLab();state=virtualAction(state,'create',{name:'A',ram:8}).state;state=virtualAction(state,'create',{name:'B',ram:8}).state;state=virtualAction(state,'select',{id:1}).state;state=virtualAction(state,'start').state;state=virtualAction(state,'select',{id:2}).state;assert(!virtualAction(state,'start').ok);assertions++;
const catalog=JSON.parse(fs.readFileSync('data/modules.json','utf8'));
const counts={};
for(const id of ['virtualisasi-server-dasar','instalasi-komputer-dasar']){
 const c=JSON.parse(fs.readFileSync(`data/${id}.json`,'utf8'));counts[id]=c.chapters.length;
 assert.equal(c.progressVersion,3);assert.equal(c.legacyChapters.length,8);assert.equal(c.chapters.at(-1).questions.length,c.chapters.length-1);
 assert.equal(new Set(c.chapters.map(ch=>ch.id)).size,c.chapters.length);
 for(const ch of c.chapters){assert(ch.html.length>150);assert(ch.questions.length>0);for(const q of ch.questions)assert(Number.isInteger(q.answer)&&q.options[q.answer]);}
 assert(c.chapters.some(ch=>ch.html.includes('data-virtual-lab')));
 const html=fs.readFileSync(catalog.find(m=>m.id===id).path+'index.html','utf8');assert(html.includes('virtual-lab.css'));
}
const report={result:'PASS',actionAssertions:assertions,scenarios:results,stageCounts:counts,legacy8StageProgressPreserved:true,scope:'Pure models and curriculum structure; browser report separate'};
fs.writeFileSync('docs/virtual-lab-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
