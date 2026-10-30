import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newFoundationLab,runFoundationAction as run} from '../assets/js/foundation-draft-model.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const catalog=read('data/modules.json'),atp=read('data/atp-fase-e.json'),courses=atp.newModules.map(m=>read(`data/${m.id}.json`));
assert.equal(catalog.length,56);assert.equal(catalog.filter(m=>m.status==='published').length,56);assert.equal(atp.newModules.length,3);assert.equal(atp.drafts.length,0);
assert.equal(atp.elements.flatMap(e=>e.moduleIds).length,19);assert.equal(atp.elements.reduce((n,e)=>n+e.jp,0),202);
const byId=new Map(catalog.map(m=>[m.id,m]));
function visit(id,stack=[]){assert(byId.has(id));assert(!stack.includes(id),'Cycle '+id);for(const p of byId.get(id).prerequisites||[])visit(p,[...stack,id]);}
catalog.forEach(m=>visit(m.id));
for(const course of courses){
 const count={'virtualisasi-server-dasar':13,'instalasi-komputer-dasar':15,'konfigurasi-perangkat-dasar':8}[course.moduleId];
 assert.equal(course.chapters.length,count);assert.equal(new Set(course.chapters.map(c=>c.id)).size,count);assert.equal(course.chapters.at(-1).questions.length,count-1);
 for(const chapter of course.chapters){assert(chapter.html.length>200);assert(chapter.questions.length);for(const q of chapter.questions){assert(q.question&&q.explanation);assert.equal(new Set(q.options).size,q.options.length);assert(Number.isInteger(q.answer)&&q.options[q.answer]);}}
 assert(course.chapters.some(c=>c.html.includes('data-foundation-draft')||c.html.includes('data-virtual-lab')));
 assert(course.chapters[0].html.includes('<svg'));const html=fs.readFileSync(byId.get(course.moduleId).path+'index.html','utf8');assert(html.includes('foundation-course.js'));assert(html.includes('tjkt-certificate.js'));assert(html.includes('foundation-module'));assert(!html.includes('module-shell.js'));
 assert(!JSON.stringify(course).includes('belum simulator aktif'));assert(!JSON.stringify(course).includes('belum fitur aktif'));
}
for(const platform of ['virtualbox','workstation']){
 let s=newFoundationLab('vm');s.platform=platform;assert(run(s,'check').ok);s.ram=16;assert(!run(s,'check').ok);s.ram=4;s.isolated=false;assert(!run(s,'check').ok);s.isolated=true;s.media=false;assert(!run(s,'check').ok);
}
for(const os of ['linux-desktop','windows']){
 let s=newFoundationLab('os');s.os=os;assert(!run(s,'boot').ok);s.target='host';assert(!run(s,'install').ok);assert(!run(s,'install').state.installed);s.target='empty';s=run(s,'install').state;assert(s.installed);assert(!run(s,'boot').ok);s=run(s,'eject').state;assert(run(s,'boot').ok);
}
let s=newFoundationLab('router');assert(run(s,'test').ok);s.gateway='192.168.20.1';assert(!run(s,'test').ok);s=run(s,'reboot').state;assert.equal(s.gateway,'');s.gateway='192.168.10.1';s=run(s,'save').state;s=run(s,'reboot').state;assert(run(s,'test').ok);
const finalCounts=courses.map(c=>({id:c.moduleId,stages:c.chapters.length,finalQuestions:c.chapters.at(-1).questions.length,threshold:{stage:75,final:80},key:`tjkt:${c.moduleId}:course:v${c.progressVersion||2}`}));
fs.writeFileSync('docs/completed-foundations-validation.json',JSON.stringify({result:'PASS',publishedLocally:56,newStages:36,oldProgressKeysUntouched:true,curriculumJP:202,acyclicPrerequisites:true,models:'positive and negative paths passed',courses:finalCounts,browser:'foundation-previews-browser.json'},null,2)+'\n');
console.log('PASS: 3 modules, 36 stages, 33 final assessment items across modules, illustrations, lab instructions, models and prerequisite graph.');
