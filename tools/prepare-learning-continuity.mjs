import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
if(read('data/atp-fase-e.json').newModules?.length)throw Error('Foundation modules already completed. Do not restore draft catalog entries.');
for(const name of ['virtualization','os-admin']){
 const p=`assets/js/course-${name}.js`;let s=fs.readFileSync(p,'utf8');
 if(!s.includes("from './curriculum-continuity.js'")){s="import { enrichContinuity } from './curriculum-continuity.js';\n"+s;s=s.replace('export default course;','export default enrichContinuity(course);');fs.writeFileSync(p,s);}
}
const modules=read('data/modules.json');
const title='Mesin Virtual Lanjutan: Proxmox VE dan VMware ESXi';
const advanced=modules.find(m=>m.id==='virtualisasi-server');advanced.title=title;advanced.description='Lanjutan VM kelas X: hypervisor server, jaringan manajemen, storage, template, backup dan pemulihan pada Proxmox VE/VMware ESXi.';
const meta=read('data/virtualisasi-server.json');meta.title=title;fs.writeFileSync('data/virtualisasi-server.json',JSON.stringify(meta,null,2)+'\n');
const html=advanced.path+'index.html';fs.writeFileSync(html,fs.readFileSync(html,'utf8').replaceAll('Virtualisasi Server Dasar',title));
const drafts=read('data/atp-fase-e.json').drafts;
for(const draft of drafts){
 const prerequisites={
  'virtualisasi-server-dasar':['k3-budaya-kerja','perangkat-jaringan'],
  'instalasi-komputer-dasar':['virtualisasi-server-dasar'],
  'konfigurasi-perangkat-dasar':['instalasi-komputer-dasar','ipv4-subnetting','protokol-layanan']
 }[draft.id];
 if(draft.id==='virtualisasi-server-dasar')draft.title='Dasar Mesin Virtual: VirtualBox dan VMware Workstation';
 const entry={id:draft.id,title:draft.title,description:'Draft pembelajaran ATP kelas X; dapat dipratinjau, belum menjadi modul bernilai atau bersertifikat.',category:'Kecakapan Kerja Dasar (Basic Job Skills), K3LH, dan Budaya Kerja',classLevel:'X',phase:'E',status:'draft',path:`modules/dasar-jaringan/${draft.id}/`,groupOrder:2,order:{'virtualisasi-server-dasar':2,'instalasi-komputer-dasar':3,'konfigurasi-perangkat-dasar':4}[draft.id],atpElement:2,prerequisites};
 const current=modules.find(m=>m.id===draft.id);if(current)Object.assign(current,entry);else modules.push(entry);
}
// Draft foundations must not lock students out of existing published courses.
// Their recommended prerequisites are recorded separately until publication.
advanced.recommendedPrerequisites=['virtualisasi-server-dasar','instalasi-komputer-dasar'];
const f=read('data/atp-fase-f.json');
if(!f.sources.some(s=>s.file==='ATP Fase F MP Keamanan Siber.docx'))f.sources.push({classLevel:'XI–XII',file:'ATP Fase F MP Keamanan Siber.docx',subject:'Mata Pelajaran Pilihan Keamanan Siber',totalJP:180});
f.electiveCybersecurity={classLevels:['XI','XII'],totalJP:180,source:'modul/ATP Fase F MP Keamanan Siber.docx',topics:['Potensi ancaman dan serangan','Sistem keamanan jaringan','Host hardening','Server DMZ','Uji keamanan jaringan, host dan server'],moduleIds:['keamanan-jaringan','autentikasi-kriptografi','ids-hardening','ids-respons-insiden','server-dmz','pengujian-keamanan'],notes:'Peta pemanfaatan modul bersama untuk mata pelajaran pilihan; bukan tambahan otomatis 180 JP pada ATP konsentrasi atau duplikasi nilai. Urutan kelas mengikuti rencana mengajar sekolah.'};
fs.writeFileSync('data/atp-fase-f.json',JSON.stringify(f,null,2)+'\n');
fs.writeFileSync('data/atp-fase-e.json',JSON.stringify({...read('data/atp-fase-e.json'),drafts},null,2)+'\n');
fs.writeFileSync('data/modules.json',JSON.stringify(modules,null,2)+'\n');
console.log('Continuity prepared: 53 published modules preserved, 3 draft previews, elective ATP mapped.');
