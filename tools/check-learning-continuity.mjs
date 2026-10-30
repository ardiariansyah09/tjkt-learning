import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {newFoundationLab,runFoundationAction as run} from '../assets/js/foundation-draft-model.js';
const catalog=JSON.parse(fs.readFileSync('data/modules.json','utf8')),byId=new Map(catalog.map(m=>[m.id,m]));
if(JSON.parse(fs.readFileSync('data/atp-fase-e.json','utf8')).newModules?.length){await import('./check-completed-foundations.mjs');process.exit(0);}
assert.equal(catalog.length,56);assert.equal(catalog.filter(m=>m.status==='published').length,53);assert.equal(catalog.filter(m=>m.status==='draft').length,3);
const visit=(id,stack=[])=>{assert(byId.has(id),id);assert(!stack.includes(id),'Prerequisite cycle '+[...stack,id].join(' → '));for(const p of byId.get(id).prerequisites||[])visit(p,[...stack,id]);};catalog.forEach(m=>visit(m.id));
for(const m of catalog.filter(m=>m.status==='published'))for(const p of m.prerequisites||[])assert.equal(byId.get(p).status,'published','Draft cannot newly block published module');
const paths=JSON.parse(fs.readFileSync('data/learning-paths.json','utf8'));for(const p of paths.paths)for(const id of p.moduleIds)assert.equal(byId.get(id).classLevel,p.classLevel);
for(const name of ['virtualization','os-admin']){
 const source=`assets/js/course-${name}.js`;
 const course=(await import(pathToFileURL(path.resolve(source)))).default;
 const previous=(await import(pathToFileURL(path.resolve('lms/storage/app/learning-pack/site',source)))).default;
 assert.deepEqual(course.chapters.map(c=>[c.id,c.questions]),previous.chapters.map(c=>[c.id,c.questions]));
 assert(course.chapters.some(c=>c.sections.some(s=>s[0].includes(name==='virtualization'?'hypervisor server':'Instalasi Linux server'))));
}
let s=newFoundationLab('vm');assert(run(s,'check').ok);s.ram=16;assert(!run(s,'check').ok);s.ram=4;s.media=false;assert(!run(s,'check').ok);s.media=true;s.isolated=false;assert(!run(s,'check').ok);
s=newFoundationLab('os');s.target='host';let result=run(s,'install');assert(!result.ok);assert(!result.state.installed);s.target='empty';s=run(s,'install').state;assert(!run(s,'boot').ok);s=run(s,'eject').state;assert(run(s,'boot').ok);s=newFoundationLab('os');s.iso=false;assert(!run(s,'boot').ok);
s=newFoundationLab('router');assert(run(s,'test').ok);s.gateway='192.168.20.1';assert(!run(s,'test').ok);s=run(s,'reboot').state;assert.equal(s.gateway,'');s.gateway='192.168.10.1';s=run(s,'save').state;s=run(s,'reboot').state;assert(run(s,'test').ok);
for(const m of catalog.filter(m=>m.status==='draft')){const text=fs.readFileSync(m.path+'index.html','utf8');assert(text.includes('data-foundation-draft'));assert(!text.includes('localStorage'));assert(text.includes('belum memberi nilai')||text.includes('Belum memberi nilai'));}
const elective=JSON.parse(fs.readFileSync('data/atp-fase-f.json','utf8')).electiveCybersecurity;assert.equal(elective.totalJP,180);assert.equal(elective.topics.length,5);for(const id of elective.moduleIds)assert(byId.has(id));
fs.writeFileSync('docs/learning-continuity-validation.json',JSON.stringify({result:'PASS',catalog:56,published:53,drafts:3,preservedStageAndQuestionDefinitions:true,acyclicPrerequisites:true,noPublishedModuleBlockedByDraft:true,labModels:'normal and failure paths passed',electiveTopics:5},null,2)+'\n');
console.log('PASS: 56 catalog entries, 53 unchanged publication states, 3 draft previews, safe prerequisites, 2 stable existing course definitions, conceptual lab success/failure and elective mapping.');
