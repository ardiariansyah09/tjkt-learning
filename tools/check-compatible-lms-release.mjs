import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const before=read('docs/lms-manifest-before-curriculum-update.json'),after=read('lms/storage/app/learning-pack/manifest.json');
assert.equal(before.length,53);assert.equal(after.length,56);
let stableQuestions=0;
for(const old of before){
 const current=after.find(m=>m.id===old.id);assert(current,old.id);
 const schema=m=>({id:m.id,key:m.key,stages:m.stages.map(s=>[s.id,s.threshold])});assert.deepEqual(schema(current),schema(old),'Assessment schema changed '+old.id);
 const file=`data/${old.id}.json`;if(!fs.existsSync(file))continue;const metadata=read(file);if(!metadata.contentSource)continue;
 const previousFile=path.resolve('lms/storage/app/learning-pack/releases',old.contentVersion,'site',metadata.contentSource);
 const previous=(await import(pathToFileURL(previousFile))).default,currentCourse=(await import(pathToFileURL(path.resolve(metadata.contentSource)))).default;
 assert.deepEqual(currentCourse.chapters.map(c=>[c.id,c.questions]),previous.chapters.map(c=>[c.id,c.questions]),'Questions changed '+old.id);stableQuestions++;
}
const added=after.filter(m=>!before.some(old=>old.id===m.id));assert.deepEqual(added.map(m=>m.id).sort(),['instalasi-komputer-dasar','konfigurasi-perangkat-dasar','virtualisasi-server-dasar']);
const report={result:'PASS',previousModules:53,newModules:added.map(m=>({id:m.id,key:m.key,stages:m.stages.length})),preservedStageSchemas:53,preservedQuestionBanks:stableQuestions,newRelease:after[0].contentVersion,totalStages:after.reduce((sum,m)=>sum+m.stages.length,0),note:'Existing assessment versions are retained by content-revision mapping; server invariant checks cover snapshots and progress.'};
fs.writeFileSync('docs/compatible-lms-release-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
