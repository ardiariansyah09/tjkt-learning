import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const atp=JSON.parse(fs.readFileSync('data/atp-fase-e.json','utf8'));
const modules=JSON.parse(fs.readFileSync('data/modules.json','utf8'));
assert.equal(atp.elements.reduce((sum,e)=>sum+e.jp,0),202);
const foundationCount=16+(atp.newModules?.length||0);
assert.equal(atp.elements.flatMap(e=>e.moduleIds).length,foundationCount);
assert.equal(new Set(atp.elements.flatMap(e=>e.moduleIds)).size,foundationCount);
for(const element of atp.elements)for(const id of element.moduleIds){
 const m=modules.find(m=>m.id===id);assert.equal(m.category,element.category);assert.equal(m.atpElement,element.id);assert.equal(m.phase,'E');
}
const expected=Object.entries({1:5,2:5,3:5,4:4}).flatMap(([i,n])=>Array.from({length:n},(_,j)=>`${i}.${j+1}`));
const covered=new Set([...Object.keys(atp.objectiveModules).flatMap(id=>atp.objectiveModules[id]),...atp.drafts.flatMap(d=>d.tp)]);
assert.deepEqual([...covered].sort(),expected.sort());
for(const draft of atp.drafts){assert.equal(draft.status,'draft');assert(fs.existsSync(draft.file));assert(!modules.some(m=>m.id===draft.id&&m.status==='published'));}
const safe={};
for(const name of ['career','k3','technology','telecom']){
 const file=`assets/js/course-${name}.js`;
 const course=(await import(pathToFileURL(path.resolve(file)))).default;
 const previous=(await import(pathToFileURL(path.resolve('lms/storage/app/learning-pack/site',file)))).default;
 assert.deepEqual(course.chapters.map(c=>[c.id,c.questions||[]]),previous.chapters.map(c=>[c.id,c.questions||[]]),'Existing question and stage definitions must remain unchanged');
 assert(course.atpReference);assert.equal(course.chapters.length,12);assert.equal(new Set(course.chapters.map(c=>c.id)).size,12);
 safe[course.moduleId]=course.chapters.map(c=>[c.id,c.questions||[]]);
 for(const chapter of course.chapters){assert(Array.isArray(chapter.sections));for(const section of chapter.sections){assert.equal(section.length,2);assert(Array.isArray(section[1]));}}
}
fs.writeFileSync('docs/atp-fase-e-validation.json',JSON.stringify({source:atp.source,totalJP:202,elements:4,existingModules:16,drafts:3,objectivesMapped:expected.length,stageAndQuestionDefinitions:safe,result:'PASS'},null,2)+'\n');
console.log(`PASS: 4 elements, 202 JP, 19 TP, ${foundationCount} Phase E modules, ${atp.drafts.length} drafts; enriched courses import successfully.`);
