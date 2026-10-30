// Conceptual lab only. No OS, hypervisor, disk or network is accessed.
export function newFoundationLab(topic){return {topic,platform:'virtualbox',ram:4,hostRam:16,reserve:4,media:true,isolated:true,target:'empty',os:'linux-desktop',gateway:'192.168.10.1',savedGateway:null,installed:false,iso:true,booted:false,log:[]};}
export function runFoundationAction(input,action){
 const s=structuredClone(input);let ok=false,text='Tindakan tidak tersedia.';
 if(s.topic==='vm'){
  if(action==='check'){
   ok=Number.isFinite(Number(s.ram))&&Number(s.ram)>=1&&Number(s.ram)<=s.hostRam-s.reserve&&s.isolated&&s.media;
   text=ok?`Rencana ${s.platform==='virtualbox'?'VirtualBox':'VMware Workstation'} memenuhi batas model. Media siap dan jaringan lab terisolasi; OS guest belum diinstal.`:!s.media?'Pasang ISO yang disetujui sebelum memulai installer.':!s.isolated?'Jaringan harus terisolasi sesuai skenario; akses LAN belum diizinkan.':'RAM guest harus positif dan tidak melebihi sisa RAM host setelah cadangan.';
  }
 }else if(s.topic==='os'){
  if(action==='install'){
   ok=s.media&&s.iso&&s.target==='empty';
   if(ok){s.installed=true;s.booted=false;text=`Instalasi ${s.os==='windows'?'Windows desktop':'Linux desktop'} selesai dalam MODEL. Selanjutnya lepaskan ISO dan uji boot dari disk. Ini bukan installer OS nyata.`;}
   else text=s.target!=='empty'?'Dihentikan: target berisi data host. Pilih disk virtual kosong yang disetujui; model tidak menghapus data.':'ISO belum terpasang; installer tidak dapat dimulai.';
  }else if(action==='eject'){s.iso=false;ok=true;text='ISO model dilepas. Jalankan Uji boot untuk membuktikan OS berada pada disk.';}
  else if(action==='boot'){ok=s.installed&&!s.iso;s.booted=ok;text=ok?'Boot model dari disk berhasil. Pada praktik nyata lanjutkan pemeriksaan akun, driver, jaringan dan pembaruan.':s.iso?'ISO masih terpasang: belum membuktikan boot dari disk tanpa ISO.':'Disk belum mempunyai OS hasil instalasi; kembali ke tahap persiapan.';}
 }else if(s.topic==='router'){
  if(action==='test'){ok=s.gateway==='192.168.10.1';text=ok?'A–B satu subnet: berhasil. A–server subnet lain: berhasil dalam model jalur dua arah. Aplikasi nyata belum diuji.':'A–B satu subnet: berhasil. A–server subnet lain: gagal; gateway A tidak sesuai rencana. Uji satu LAN tidak membuktikan gateway benar.';}
  else if(action==='save'){s.savedGateway=s.gateway;ok=true;text='Konfigurasi gateway model disimpan. Uji hasil sesudah mulai ulang.';}
  else if(action==='reboot'){s.gateway=s.savedGateway??'';ok=s.gateway==='192.168.10.1';text=s.savedGateway===null?'Setelah boot, konfigurasi yang belum disimpan hilang. Terapkan gateway dan simpan terlebih dahulu.':'Konfigurasi tersimpan dimuat. Tekan Uji jalur untuk memeriksa kembali hasil.';}
 }
 s.log.push({action,ok,text});s.log=s.log.slice(-12);return {state:s,ok,text};
}
