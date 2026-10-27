import {mountActionGame} from './action-game.js?v=3';
import {questions} from './question-bank.js';
const PREFIX='tjkt:ipv4-subnetting:stage8:';
function el(tag,cls='',text=''){const x=document.createElement(tag);if(cls)x.className=cls;if(text)x.textContent=text;return x;}
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function load(key,fallback){try{return JSON.parse(localStorage.getItem(PREFIX+key))||fallback;}catch{return fallback;}}
function save(key,value){try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true;}catch{return false;}}
function dispatch(lessonId,score){window.dispatchEvent(new CustomEvent('tjkt:assessment',{detail:{lessonId,score,answeredAll:true}}));}
function record(key,score,details){const prev=load(key,{attempts:0,best:0});const item={attempts:(prev.attempts||0)+1,best:Math.max(prev.best||0,score),last:score,updatedAt:new Date().toISOString(),details};save(key,item);return item;}
export function mountGames(root){ mountActionGame(root,{moduleId:'ipv4-subnetting',mode:'2d',onComplete(score){record('games',score,{game:'Lahan Subnet',levels:3});dispatch('games',score);}}); }
export function mountPosttest(root){
 const panel=el('section','stage8-panel'),heading=el('h3','','Evaluasi Akhir • 10 Soal'),body=el('div');panel.append(heading,body);root.append(panel);
 function start(){const deck=shuffle(questions).slice(0,10).map(q=>({...q,choices:shuffle(q.a.map((label,i)=>({label,original:i})))}));body.replaceChildren();const form=el('form','stage8-posttest');
 deck.forEach((q,i)=>{const field=el('fieldset','stage8-question');field.append(el('legend','',`${i+1}. ${q.q}`));q.choices.forEach((choice,j)=>{const label=el('label','stage8-option'),radio=el('input');radio.type='radio';radio.name=`q${i}`;radio.value=String(j);label.append(radio,document.createTextNode(' '+choice.label));field.append(label);});form.append(field);});
 const btn=el('button','primary-action','Kumpulkan Posttest');btn.type='submit';const notice=el('p','stage8-notice');notice.setAttribute('role','status');form.append(btn,notice);body.append(form);
 form.addEventListener('submit',e=>{e.preventDefault();const picked=deck.map((q,i)=>form.querySelector(`input[name="q${i}"]:checked`));if(picked.some(x=>!x)){notice.textContent=`Semua soal wajib dijawab. Masih ada ${picked.filter(x=>!x).length} soal kosong.`;return;}
 const results=deck.map((q,i)=>{const chosen=q.choices[Number(picked[i].value)];return {id:q.id,question:q.q,chosen:chosen.label,correct:q.a[q.correct],ok:chosen.original===q.correct,why:q.why};});const score=results.filter(x=>x.ok).length*10;const rec=record('posttest',score,results);body.replaceChildren(el('h3','',`Nilai posttest: ${score}/100`),el('p','',`Nilai terbaik: ${rec.best} • Percobaan: ${rec.attempts} • ${score>=80?'LULUS':'BELUM LULUS'}`));
 const list=el('ol','stage8-review');results.forEach(r=>{const item=el('li','',`${r.ok?'✓':'✗'} ${r.question}`);item.append(el('p','',`Jawaban Anda: ${r.chosen} | Kunci: ${r.correct}`),el('p','',r.why));list.append(item);});body.append(list);const again=el('button','primary-action','Ulangi Posttest (Soal Acak)');again.onclick=start;body.append(again);if(score>=80)queueMicrotask(()=>dispatch('posttest',score));
 });}
 start();
}
export function mountReport(root,gate,ids,lessons){const panel=el('section','stage8-panel'),h=el('h3','','Rekap Hasil Belajar');panel.append(h);const table=el('table','stage8-table'),thead=el('thead'),tr=el('tr');['Materi','Nilai terbaik','Status'].forEach(x=>tr.append(el('th','',x)));thead.append(tr);table.append(thead);const tbody=el('tbody');ids.forEach((id,i)=>{const row=el('tr'),value=gate.passed[id],passed=Number.isFinite(value)&&value>=75;row.append(el('td','',lessons[i].title),el('td','',passed?String(value):'—'),el('td','',passed?'Lulus':'Belum lulus'));tbody.append(row);});table.append(tbody);panel.append(table);
 const hint=el('p','stage8-notice','Nilai latihan sebelumnya hanya tersedia setelah lulus. Data hanya berada di browser/perangkat ini.');panel.append(hint);
 const exportBtn=el('button','secondary-action','Unduh Rekap CSV');exportBtn.type='button';exportBtn.addEventListener('click',()=>{const lines=[['Materi','Nilai Terbaik','Status'],...ids.map((id,i)=>[lessons[i].title,gate.passed[id]??'',gate.passed[id]>=75?'Lulus':'Belum lulus'])];const csv='\uFEFF'+lines.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='rekap-tjkt-ipv4-subnetting.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});panel.append(exportBtn);root.append(panel);}
