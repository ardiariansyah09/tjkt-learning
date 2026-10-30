import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(root,'data/modules.json'),'utf8'));
const results=[];
for(const module of catalog){
 const file=path.join(root,'data',module.id+'.json');if(!fs.existsSync(file))continue;
 const meta=JSON.parse(fs.readFileSync(file,'utf8'));if(!meta.contentSource)continue;
 const course=(await import(pathToFileURL(path.join(root,meta.contentSource)))).default;if(!course)continue;
 const issues=[];for(const chapter of course.chapters){
  for(const q of chapter.questions||[]){if(!q.question||!Array.isArray(q.options)||!Number.isInteger(q.answer)||!q.options[q.answer])issues.push(chapter.id+': invalid question');if(new Set(q.options).size!==q.options.length)issues.push(chapter.id+': duplicate choices');}
  if(!chapter.summary||!chapter.example||!chapter.task||!chapter.misconception)issues.push(chapter.id+': missing learning support');
 }
 const bank=course.chapters.flatMap(c=>(c.questions||[]).map(q=>({...q,chapter:c.id}))),exam=bank.slice(0,10);
 results.push({id:module.id,title:course.title,objectives:course.objectives,sources:course.sources,chapters:course.chapters,issues,oldExamCoverage:[...new Set(exam.map(q=>q.chapter))],assessedChapters:course.chapters.filter(c=>c.questions?.length).map(c=>c.id)});
}
fs.writeFileSync(path.join(root,'docs/course-content-audit.json'),JSON.stringify(results,null,2));console.log('Content extracted:',results.length,'courses;',results.reduce((n,c)=>n+c.issues.length,0),'structural issues.');
