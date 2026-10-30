import {bindThemeToggle} from './theme.js';
import {mountChapterNavigation} from './chapter-navigation.js?v=25';
import {refreshModuleCertificate} from './module-certificate.js';
import {mountVirtualLab} from './virtual-lab.js';
import {mountActivityReports} from './atp-practice.js';
import {mountTerminalLab} from './terminal-lab.js';
import {enrichFoundationVirtualization} from './vm-visual-content.js';
import {simplifyActivities} from './activity-presentation.js';
import './foundation-draft.js';
const id=document.body.dataset.moduleId;
bindThemeToggle(document.querySelector('.theme-button'));
const response=await fetch(new URL(`../../data/${id}.json`,import.meta.url),{cache:'no-store'});
if(!response.ok)throw Error('Materi belum dapat dibaca. Muat ulang tanpa menghapus progres.');
const course=await response.json(),root=document.getElementById('lessonContent');
enrichFoundationVirtualization(course);
// Earlier eight-stage learners keep their original completion/score record.
// New learners use the expanded sequence with its own key, without invented grades.
let legacy=false;
try{const old=JSON.parse(localStorage.getItem(`tjkt:${id}:course:v2`)||'null');legacy=Boolean(course.legacyChapters&&old&&Object.keys(old.passed||{}).length); }catch{}
if(legacy){course.chapters=course.legacyChapters;document.body.dataset.progressVersion='2';}
else document.body.dataset.progressVersion=String(course.progressVersion||2);
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
root.innerHTML=`<section id="tujuan"><h2>Tujuan Pembelajaran</h2><ul>${course.objectives.map(o=>`<li>${escape(o)}</li>`).join('')}</ul><p>Acuan: ATP kelas X, TP 2.5. Pelajari konsep, uji model, lakukan praktik berizin sesuai petunjuk, lalu jelaskan bukti. Nilai LMS menilai pemahaman konsep; keterampilan perangkat nyata dinilai guru.</p></section>`+course.chapters.map(ch=>`<section id="${escape(ch.id)}"><h2>${escape(ch.title)}</h2>${ch.html}</section>`).join('');
mountChapterNavigation({...course,storageVersion:Number(document.body.dataset.progressVersion)});
// Lab markup is available only after content has been inserted.
const {mountFoundationLab}=await import('./foundation-draft.js');
for(const box of root.querySelectorAll('[data-foundation-draft]'))mountFoundationLab(box);
for(const box of root.querySelectorAll('[data-virtual-lab]'))mountVirtualLab(box,{moduleId:id,initialOS:box.dataset.os||'ubuntu',session:box.dataset.session||'main'});
mountTerminalLab(root,id);
simplifyActivities(root);
mountActivityReports(root,id);
new MutationObserver(()=>mountActivityReports(root,id)).observe(root,{childList:true,subtree:true});
if(legacy){const note=document.createElement('p');note.className='save-note';note.textContent='Progres delapan tahap sebelumnya tetap digunakan. Simulator baru tersedia dalam laboratorium; nilai dan sertifikat lama tidak dihapus.';document.querySelector('.sidebar-heading')?.append(note);}
const update=()=>refreshModuleCertificate();
new MutationObserver(update).observe(document.getElementById('lessonNav'),{childList:true});
window.addEventListener('storage',update);update();
