const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'../lms');
const r=p=>fs.readFileSync(path.join(root,p),'utf8'),w=(p,s)=>fs.writeFileSync(path.join(root,p),s);
for(const p of ['resources/views/learning/student/index.blade.php','resources/views/learning/manage/index.blade.php']){
 let s=r(p).replaceAll('{{ $module->code }}',"{{ $module->package_slug?'Modul interaktif':$module->code }}");w(p,s);
}
let s=r('resources/views/assessment/student/progress.blade.php');
s=s.replace('Persentase penyelesaian berbeda dari nilai kuis. Bacaan selesai melalui checkpoint, bukan sekadar membuka halaman.','Lihat tahap yang sudah lulus dan nilai evaluasi. Membuka halaman saja belum dihitung sebagai kelulusan.');
s=s.replace('Penyelesaian {{ $row?->completion_percent??0 }}%</span>',`Penyelesaian {{ $row?->completion_percent??0 }}%</span><span class="d-block small">{{ $module->package_slug?'Evaluasi akhir':'Rata-rata kuis terbaik' }}: {{ ($module->package_slug?$row?->final_score:$row?->quiz_score)??'Belum ada nilai' }}</span>`);
s=s.replace('<th>Rata-rata kuis terbaik</th>','<th>Evaluasi akhir / kuis</th>').replace("{{ $row->quiz_score??'Belum lengkap' }}","{{ ($row->module?->package_slug?$row->final_score:$row->quiz_score)??'Belum ada nilai' }}");
s=s.replace("'module.completed'=>'Modul selesai'","'module.completed'=>'Modul selesai','package.synced'=>'Hasil belajar diperbarui'").replace('colspan="5"','colspan="6"');
w('resources/views/assessment/student/progress.blade.php',s);
let report=r('resources/views/assessment/reports/index.blade.php');report=report.replace("{{ $row->practice_score??'Belum lengkap' }}","{{ $row->package_slug?'—':($row->practice_score??'Belum ada nilai') }}");w('resources/views/assessment/reports/index.blade.php',report);
console.log('Result labels and evidence display updated.');
