// Tahap 9: seluruh fitur offline/local, tanpa backend atau layanan pihak ketiga.
const KEY='tjkt:ipv4-subnetting:sequential:v2';
const MODULE_NAME='IP Address & Subnetting';
const STAGE8_PREFIX='tjkt:stage8:';
const LEARNER_KEY='tjkt:certificate:name';
const idScore=(gate,id)=>Number(gate.passed?.[id]||0);
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const passed=(gate,id)=>idScore(gate,id)>=(['games','posttest'].includes(id)?80:75);
function dateID(){return new Intl.DateTimeFormat('id-ID',{dateStyle:'long'}).format(new Date());}
export function mountLearnerDashboard(root,gate,ids,lessons,goTo){
 if(!root)return;
 root.replaceChildren();
 const total=ids.filter(id=>passed(gate,id)).length,percentage=Math.round(total/ids.length*100);
 const heading=element('h3','','📊 Ringkasan Belajar'),desc=element('p','stage9-muted',`${total} dari ${ids.length} tahap tuntas (${percentage}%).`);
 const next=ids.find(id=>!passed(gate,id));
 const btn=element('button','stage9-next',next?`▶ Lanjut: ${lessons[ids.indexOf(next)].title}`:'✓ Semua tahap tuntas');
 btn.disabled=!next;
 if(next)btn.onclick=()=>goTo(next);
 const note=element('small','stage9-muted','Data hanya disimpan di browser ini, bukan dikirim ke guru.');
 root.append(heading,desc,btn,note);
}
export function mountCertificate(root,gate,ids){
 const panel=element('section','stage9-certificate');
 const title=element('h3','','🏅 Sertifikat Penyelesaian Modul');panel.append(title);
 if(!ids.every(id=>passed(gate,id))){
   panel.append(element('p','stage9-muted','Sertifikat terbuka setelah seluruh materi lulus, termasuk Posttest minimal 80.'));
   root.append(panel);return;
 }
 panel.append(element('p','','Selamat! Semua tahap pembelajaran telah diselesaikan. Isi nama untuk membuat sertifikat pribadi.'));
 const label=element('label','stage9-name-label','Nama pada sertifikat');
 const input=element('input','stage9-name-input');input.type='text';input.maxLength=70;input.autocomplete='name';input.placeholder='Masukkan nama lengkap';
 try{input.value=localStorage.getItem(LEARNER_KEY)||'';}catch{}
 label.append(input);
 const btn=element('button','primary-action','Buat Sertifikat');
 const warning=element('p','stage9-muted');warning.setAttribute('role','status');
 btn.onclick=()=>{
  const name=input.value.trim().replace(/\s+/g,' ');
  if(name.length<3){warning.textContent='Nama minimal 3 karakter.';return;}
  try{localStorage.setItem(LEARNER_KEY,name);}catch{}
  const cert=document.getElementById('stage9PrintableCertificate');
  if(cert)cert.remove();
  const paper=element('section','stage9-printable');paper.id='stage9PrintableCertificate';
  window.TJKTCertificate.render(paper,{name,module:MODULE_NAME,score:idScore(gate,'posttest')});
  document.body.append(paper);
  const print=element('button','primary-action','Cetak / Simpan PDF');
  print.onclick=()=>window.print();
  const preview=panel.querySelector('.stage9-preview');if(preview)preview.remove();
  const actions=element('div','stage9-preview');actions.append(element('p','','Sertifikat siap. Gunakan tombol di bawah untuk mencetak atau menyimpan sebagai PDF.'),print);panel.append(actions);
  warning.textContent='Sertifikat berhasil disiapkan.';
 };
 panel.append(label,btn,warning);root.append(panel);
}
export function setupResetProgress(button){
 if(!button)return;
 button.onclick=()=>{
  const first=window.confirm('Reset semua progres belajar, nilai latihan, games, posttest, dan konfigurasi lab yang tersimpan pada browser ini? Tindakan ini tidak dapat dibatalkan.');
  if(!first)return;
  const typed=window.prompt('Untuk mengonfirmasi, ketik RESET (huruf kapital):');
  if(typed!=='RESET')return;
  try{
   const keys=[];
   for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k&&(k.startsWith('tjkt:ipv4-subnetting:')||k.startsWith(STAGE8_PREFIX)||k.startsWith('tjkt-ipv4-')||k.startsWith('tjkt-vlsm-')||k.startsWith('tjkt-network-')||k===LEARNER_KEY))keys.push(k);
   }
   for(const key of keys)localStorage.removeItem(key);
   // Jangan hapus preferensi tema, atau data aplikasi lain.
   window.location.reload();
  }catch{window.alert('Reset gagal. Penyimpanan browser mungkin tidak tersedia.');}
 };
}
