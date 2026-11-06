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
export function mountCertificate(root,gate,ids){ window.TJKTCertificateFlow?.refresh(); }
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
