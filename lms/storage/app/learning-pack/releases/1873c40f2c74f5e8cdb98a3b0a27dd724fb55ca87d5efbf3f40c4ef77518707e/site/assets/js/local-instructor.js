/* Local preview only. Never grants grades, completion, or certificates. */
(()=>{
 'use strict';
 const key='tjkt:local-instructor:v1';
 const isLocal=()=>['localhost','127.0.0.1','[::1]','::1'].includes(location.hostname)&&['http:','https:'].includes(location.protocol);
 const isActive=()=>{if(!isLocal())return false;try{return localStorage.getItem(key)!=='off';}catch{return true;}};
 window.TJKTLocalInstructor=Object.freeze({isLocal,isActive});
 function mount(){
  if(!isLocal()||document.querySelector('.local-instructor-tools'))return;
  const header=document.querySelector('.module-topbar');if(!header)return;
  const panel=document.createElement('aside'),text=document.createElement('p'),toggle=document.createElement('button');
  panel.className='local-instructor-tools';panel.setAttribute('aria-label','Pengaturan instruktur lokal');
  text.textContent=isActive()?'Mode instruktur lokal: semua tahap dapat dibuka. Nilai dan sertifikat tetap mengikuti hasil belajar.':'Mode siswa lokal: tahap dibuka berurutan sesuai kelulusan.';
  toggle.type='button';toggle.className='secondary-action';toggle.textContent=isActive()?'Gunakan mode siswa':'Aktifkan mode instruktur';
  toggle.addEventListener('click',()=>{try{localStorage.setItem(key,isActive()?'off':'on');location.reload();}catch{text.textContent='Preferensi tidak dapat disimpan. Izinkan penyimpanan browser untuk mengganti mode.';}});
  panel.append(text,toggle);header.after(panel);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
