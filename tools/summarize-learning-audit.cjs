const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/modules.json'),'utf8'));
const courses=JSON.parse(fs.readFileSync(path.join(root,'docs/course-content-audit.json'),'utf8'));
const reportFile=path.join(root,'docs/lms-review/audit-all-learning.json');
const report=fs.existsSync(reportFile)?JSON.parse(fs.readFileSync(reportFile,'utf8')):{modules:[]};
const rows=catalog.map(m=>{
 const course=courses.find(c=>c.id===m.id),run=report.modules.find(c=>c.id===m.id);
 return {id:m.id,title:m.title,phase:m.phase,classLevel:m.classLevel,prerequisites:m.prerequisites,sourceCount:course?.sources?.length??null,contentStructure:course?'objectives/examples/transfer/misconceptions/questions checked':'rendered legacy lesson review',structuralIssues:course?.issues??[],sequentialStages:run?.stages.length??0,simulationChecks:run?run.stages.filter(s=>s.simulation?.type||s.simulation?.nativeActivities||s.simulation?.scoped).length:0,instructionsChecked:!!run,certificatePrinted:run?.certificate?.print??false,databaseRestored:run?.databaseRestored??false,studentUsability:'requires classroom observation; not established by automated audit'};
});
fs.writeFileSync(path.join(root,'docs/audit-53-modul.json'),JSON.stringify(rows,null,2));
const lines=['# Matriks audit 53 modul','','Status diperbarui dari laporan audit. Tanda lulus menunjukkan pemeriksaan sistem, bukan validasi pemahaman siswa.','','| Modul | Kelas | Tahap diuji dari awal | Petunjuk/aktivitas | Cetak sertifikat | Pulih dari database |','|---|---|---:|---|---|---|',...rows.map(m=>`| ${m.title} | ${m.classLevel} | ${m.sequentialStages||'menunggu'} | ${m.instructionsChecked?'diperiksa':'menunggu'} | ${m.certificatePrinted?'lulus':'menunggu'} | ${m.databaseRestored?'lulus':'menunggu'} |`)];
fs.writeFileSync(path.join(root,'docs/audit-53-modul.md'),lines.join('\n')+'\n');console.log('Audit matrix:',rows.filter(r=>r.certificatePrinted).length,'/',rows.length,'complete.');
