/* Trusted learning package adapter. Client results are reported activity, not a verified exam. */
(()=>{
 'use strict';
 const c=window.TJKTLMS;if(!c)return;
 const disk=window.localStorage,scope=`tjkt:lms:${c.user}:${c.module}:${c.version}:`,queueKey=scope+'queue';
 let revision=c.revision,source='browser',data={...c.data},dirty=false,saving=false,blocked=false,timer,status;
 const allowed=k=>k===c.key||k.startsWith(`tjkt:${c.slug}:`)||(c.slug==='pengenalan-jaringan'&&k.startsWith('tjkt:intro-network:'))||(c.slug==='topologi-jaringan'&&k.startsWith('tjkt:topology:'));
 const previewStore={};
 try{const queued=JSON.parse(disk.getItem(queueKey)||'null');if(queued){data=queued.data;dirty=true;source=queued.source||'browser';if(queued.revision!==revision)blocked=true;}}catch{}
 const inform=t=>{if(status)status.textContent=t;};
 const backup=()=>{const blob=new Blob([JSON.stringify({format:'tjkt-learning-backup-v1',module:c.slug,version:c.version,data,source},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`cadangan-${c.slug}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
 function enqueue(){if(c.preview)return;dirty=true;try{disk.setItem(queueKey,JSON.stringify({revision,data,source}))}catch{inform('Cadangan browser penuh. Unduh cadangan sebelum menutup halaman.');}clearTimeout(timer);timer=setTimeout(sync,900);}
 async function sync(){
  if(c.preview||!dirty||saving||blocked)return;
  if(!navigator.onLine){inform('Koneksi terputus. Hasil disimpan di browser akun ini; kirim saat terhubung.');return;}
  saving=true;inform('Menyimpan hasil…');
  const outgoing=JSON.stringify(data);
  try{
   const r=await fetch(c.sync,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','Accept':'application/json','X-CSRF-TOKEN':c.csrf},body:JSON.stringify({owner:c.user,version:c.version,revision,source,data:JSON.parse(outgoing)})});
   if(!r.ok){if([401,403,419].includes(r.status)){blocked=true;inform('Sesi akun berubah atau berakhir. Unduh cadangan lalu masuk kembali sebagai pemilik hasil.');}else if(r.status===409){blocked=true;inform('Ada versi lebih baru di server. Unduh cadangan, lalu muat ulang untuk memeriksa hasil.');}else{blocked=true;inform('Hasil belum dapat diterima server. Unduh cadangan dan hubungi guru.');}return;}
   const result=await r.json();revision=result.revision;dirty=JSON.stringify(data)!==outgoing;
   if(dirty){disk.setItem(queueKey,JSON.stringify({revision,data,source}));}else{disk.removeItem(queueKey);}
   inform(result.complete?'Seluruh tahap lulus. Hasil tersimpan ke akun Anda.':'Hasil tersimpan ke akun Anda.');
  }catch{inform('Belum tersambung ke server. Hasil tetap tersimpan di browser akun ini.');}
  finally{saving=false;if(dirty&&!blocked&&navigator.onLine)timer=setTimeout(sync,5000);}
 }
 const store={
  getItem(k){k=String(k);if(k==='tjkt:local-instructor:v1')return c.preview?'on':'off';if(allowed(k))return Object.hasOwn(data,k)?data[k]:null;return Object.hasOwn(previewStore,k)?previewStore[k]:null;},
  setItem(k,v){k=String(k);v=String(v);if(allowed(k)){data[k]=v;enqueue();}else previewStore[k]=v;},
  removeItem(k){k=String(k);if(allowed(k)){delete data[k];enqueue();}else delete previewStore[k];},
  clear(){data={};enqueue();},key(i){return Object.keys(data)[i]??null},get length(){return Object.keys(data).length}
 };
 Object.defineProperty(window,'localStorage',{configurable:true,value:store});
 window.TJKTLocalInstructor=Object.freeze({isLocal:()=>false,isActive:()=>c.preview});
 document.addEventListener('DOMContentLoaded',()=>{
  const bar=document.createElement('aside');bar.style.cssText='padding:12px 20px;background:#eef6ff;color:#153657;display:flex;gap:12px;flex-wrap:wrap;align-items:center;border-bottom:1px solid #bdd7ee;font:14px system-ui';
  const back=document.createElement('a');back.href=c.back;back.textContent='← Kembali ke materi';
  status=document.createElement('span');status.setAttribute('role','status');status.textContent=c.preview?'Pratinjau guru: seluruh tahap terbuka; tidak mengirim nilai siswa.':blocked?'Data perangkat berbeda dengan server. Unduh cadangan sebelum memuat ulang.':'Hasil belajar terhubung ke akun Anda.';
  const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',fn);return b;};
  bar.append(back,status,button('Unduh cadangan',backup));
  if(!c.preview)bar.append(button('Ambil data server',()=>{if(!dirty||confirm('Unduh cadangan dahulu jika ada hasil yang belum terkirim. Ganti hasil perangkat ini dengan hasil dari server?')){disk.removeItem(queueKey);dirty=false;location.reload();}}));
  if(!c.preview){
   bar.append(button('Kirim hasil',sync));
   const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Pindahkan progres lama';
   const help=document.createElement('p');help.textContent='Pilih cadangan modul ini dari website lama. Pastikan hasil tersebut milik Anda. Data impor ditandai sebagai data lama dan tidak mengubah hasil yang sudah ada di akun ini.';
   const file=document.createElement('input');file.type='file';file.accept='.json,application/json';
   file.addEventListener('change',async()=>{try{const f=file.files[0];if(!f||f.size>800000)throw Error('Ukuran cadangan tidak sesuai.');const imported=JSON.parse(await f.text());if(imported.module!==c.slug||imported.format!=='tjkt-learning-backup-v1')throw Error('Cadangan bukan untuk modul ini.');if(Object.keys(data).length||revision>0)throw Error('Akun ini sudah mempunyai hasil modul. Hubungi guru agar data tidak tertimpa.');if(!imported.data||Array.isArray(imported.data)||typeof imported.data!=='object'||Object.entries(imported.data).some(([k,v])=>!allowed(k)||typeof v!=='string'))throw Error('Isi cadangan tidak sesuai.');if(!confirm('Saya memastikan hasil dalam cadangan ini adalah pekerjaan saya sendiri. Impor ke akun ini?'))return;data=imported.data;source='legacy-import';enqueue();await sync();if(!dirty)location.reload();}catch(e){inform(e.message);}});
   details.append(summary,help,file);bar.append(details);
  }
  document.body.prepend(bar);
  for(const a of document.querySelectorAll('a[href]')){if(a.getAttribute('href')==='../../../index.html')a.href=c.back;}
  if(dirty&&!blocked)sync();
 });
 window.addEventListener('online',sync);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')sync();});
 window.addEventListener('beforeunload',e=>{if(dirty&&!c.preview){e.preventDefault();e.returnValue='';}});
})();
