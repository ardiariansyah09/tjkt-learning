import fs from 'node:fs';
if(fs.existsSync('data/atp-fase-e.json')&&JSON.parse(fs.readFileSync('data/atp-fase-e.json','utf8')).newModules?.length)throw Error('Completed curriculum exists. Initial alignment must not overwrite it.');
const groups=[
 ['Wawasan Dunia Kerja Bidang Teknik Jaringan Komputer dan Telekomunikasi',28,['profesi-kewirausahaan-tjkt','proses-bisnis-tjkt','wawasan-tjkt']],
 ['Kecakapan Kerja Dasar (Basic Job Skills), K3LH, dan Budaya Kerja',24,['k3-budaya-kerja']],
 ['Media dan Jaringan Telekomunikasi',132,['pengenalan-jaringan','perangkat-jaringan','topologi-jaringan','perencanaan-jaringan','media-transmisi','osi-tcpip','ipv4-subnetting','ipv6-dasar','protokol-layanan','sistem-telekomunikasi-dasar','troubleshooting']],
 ['Penggunaan Alat Ukur',18,['alat-ukur-tjkt']]
];
const catalog=JSON.parse(fs.readFileSync('data/modules.json','utf8'));
for(const [i,[category,jp,ids]] of groups.entries())for(const [j,id] of ids.entries()){
 const m=catalog.find(m=>m.id===id); if(!m||m.phase!=='E')throw Error(id);
 Object.assign(m,{category,groupOrder:i+1,order:j+1,atpElement:i+1});
 // Career is first in the ATP and its content is self-contained.
 if(id==='profesi-kewirausahaan-tjkt')m.prerequisites=m.prerequisites.filter(p=>p!=='proses-bisnis-tjkt');
}
fs.writeFileSync('data/modules.json',JSON.stringify(catalog,null,2)+'\n');
for(const name of ['career','k3','technology','telecom']){
 const path=`assets/js/course-${name}.js`;let text=fs.readFileSync(path,'utf8');
 if(text.includes("from './atp-fase-e-enrichment.js'"))continue;
 text="import { enrichPhaseE } from './atp-fase-e-enrichment.js';\n"+text;
 if(name==='k3')text=text.replace('export default {','export default enrichPhaseE({').replace(/};\s*$/,'});\n');
 else text=text.replace('export default buildPhaseECourse({','export default enrichPhaseE(buildPhaseECourse({').replace(/\}\);\s*$/,'}));\n');
 fs.writeFileSync(path,text);
}
const refs={
 'profesi-kewirausahaan-tjkt':['1.1','1.2','1.3'], 'proses-bisnis-tjkt':['1.4'], 'wawasan-tjkt':['1.5'],
 'k3-budaya-kerja':['2.1','2.2','2.3','2.4'], 'ipv4-subnetting':['3.1'], 'ipv6-dasar':['3.1'],
 'osi-tcpip':['3.2'], 'protokol-layanan':['3.2','3.3'], 'sistem-telekomunikasi-dasar':['3.3','3.4','3.5'],
 'alat-ukur-tjkt':['4.1','4.2','4.3','4.4']
};
const drafts=[
 {id:'instalasi-komputer-dasar',title:'Instalasi dan Konfigurasi Dasar Sistem Komputer',tp:['2.5'],status:'draft',file:'docs/draft-fase-e/instalasi-komputer-dasar.md'},
 {id:'konfigurasi-perangkat-dasar',title:'Konfigurasi Dasar Router dan Switch',tp:['2.5'],status:'draft',file:'docs/draft-fase-e/konfigurasi-perangkat-dasar.md'},
 {id:'virtualisasi-server-dasar',title:'Dasar Mesin Virtual: VirtualBox dan VMware Workstation',tp:['2.5'],status:'draft',file:'docs/draft-fase-e/virtualisasi-server-dasar.md'}
];
fs.writeFileSync('data/atp-fase-e.json',JSON.stringify({school:'SMK Wikrama Bogor',schoolYear:'2026-2027',phase:'E',classLevel:'X',source:{file:'modul/ATP-TJKT X - NEW 27.xlsx',sheet:'ATP',rows:'18–22'},totalJP:202,elements:groups.map(([category,jp,moduleIds],i)=>({id:i+1,category,jp,moduleIds})),objectiveModules:refs,drafts,notes:['JP merupakan alokasi elemen ATP, bukan durasi otomatis LMS.','Draft belum dipublikasikan dan belum menghasilkan sertifikat.','Pengenalan, perencanaan dan troubleshooting adalah materi pendukung penerapan, bukan TP tambahan.']},null,2)+'\n');
console.log('Aligned 16 existing Phase E modules; 3 separate curriculum drafts.');
