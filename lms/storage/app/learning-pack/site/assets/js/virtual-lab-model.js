import {newTerminal,runTerminal} from './terminal-lab-model.js';
export const installerProfiles={
 'ubuntu-server':{title:'Ubuntu Server 22.04 LTS — Subiquity',ram:2,cpu:2,disk:25,steps:['language','keyboard','network','proxy','mirror','disk','account','ssh','featured','review','copy','restart','desktop']},
 ubuntu:{title:'Ubuntu Desktop 24.04 LTS',ram:4,cpu:2,disk:25,steps:['language','accessibility','keyboard','network','welcome','method','applications','drivers','disk','account','timezone','review','copy','restart','desktop']},
 windows:{title:'Windows 11 — latihan instalasi bersih',ram:4,cpu:2,disk:64,steps:['language','keyboard','setup','product','edition','license','disk','review','copy','restart','region','network','account','privacy','desktop']}
};
export const defaultVM=()=>({name:'Lab-Desktop',os:'ubuntu',ram:4,cpu:2,disk:64,efi:true,tpm:true,secureBoot:true,network:'internal',segment:'kelas-x',ip:'192.168.50.10',iso:'ubuntu'});
export function newVirtualLab(){return {schema:1,platform:'virtualbox',host:{ram:16,reserve:4,cpu:8,storage:256},nextId:1,selected:null,vms:[],log:[],evidence:{created:false,installed:false,diskBoot:false,network:false,restored:false}};}
export function emptyInstaller(os){return {os,step:0,proxy:'',mirror:'http://archive.ubuntu.com/ubuntu',installSSH:true,language:'English',keyboard:'English (US)',internet:false,tryMode:false,method:'interactive',apps:'default',drivers:false,diskId:0,layout:'auto',rootSize:40,partitions:[],username:'siswa',hostname:'lab-desktop',accountReady:false,timezone:'Asia/Jakarta',edition:'Pro',licensed:false,product:'later',privacy:false,confirmed:false,percent:0};}
export function currentScreen(vm){const i=vm?.installer;return i?installerProfiles[i.os].steps[i.step]:null;}
export function vmChecks(lab,vm){
 const p=installerProfiles[vm.os],others=lab.vms.filter(v=>v.id!==vm.id&&v.power==='on').reduce((n,v)=>n+v.ram,0);
 return [{ok:vm.ram>=p.ram,text:`RAM guest minimal ${p.ram} GiB pada profil latihan`},{ok:vm.ram+others<=lab.host.ram-lab.host.reserve,text:'RAM aktif menyisakan cadangan host 4 GiB'},{ok:vm.cpu>=p.cpu&&vm.cpu<=lab.host.cpu,text:`vCPU ${p.cpu}–${lab.host.cpu} pada kebijakan lab`},{ok:vm.disk>=p.disk,text:`Disk target minimal ${p.disk} GiB pada profil latihan`},{ok:vm.efi,text:'UEFI tersedia untuk profil latihan'},{ok:vm.os!=='windows'||(vm.tpm&&vm.secureBoot),text:'Profil Windows: TPM 2.0 virtual dan Secure Boot disiapkan'},{ok:vm.network!=='bridged',text:'Jaringan terisolasi/host-only/NAT; bridged belum diizinkan pada skenario ini'}];
}
function validateInstaller(vm,i,screen){
 if(screen==='method'&&i.method!=='interactive')return 'Latihan ini memakai Interactive installation. Otomatisasi belum tersedia pada model.';
 if(screen==='license'&&!i.licensed)return 'Tandai bahwa lisensi sudah ditinjau pada skenario latihan. Ini tidak mengaktifkan lisensi produk.';
 if(screen==='disk'){
  if(i.diskId!==0)return 'Disk 1 berisi data latihan yang harus dipertahankan. Pilih Disk 0 kosong; model menolak penghapusan target terlindungi.';
  if(i.layout==='manual'){
   const root=i.partitions.find(p=>p.mount==='/'&&p.fs==='ext4'),esp=i.partitions.find(p=>p.mount==='/boot/efi'&&p.fs==='fat32');
   if(i.os==='windows')return 'Gunakan ruang kosong pada Disk 0 untuk tata letak otomatis Windows pada profil ini.';
   if(!root||root.size<25||!esp||esp.size<0.5)return 'Partisi manual memerlukan EFI FAT32 /boot/efi minimal 0,5 GiB dan root ext4 / minimal 25 GiB dalam model.';
   if(i.partitions.reduce((n,p)=>n+p.size,0)>vm.disk)return 'Total partisi melampaui kapasitas Disk 0.';
  }
 }
 if(screen==='account'&&(!/^[a-z][a-z0-9-]{2,19}$/.test(i.username)||!/^[a-z][a-z0-9-]{2,30}$/.test(i.hostname)||!i.accountReady))return 'Gunakan nama akun/host latihan yang valid serta konfirmasi dua sandi latihan cocok (minimal 8 karakter). Sandi tidak disimpan.';
 if(screen==='review'&&!i.confirmed)return 'Tinjau target Disk 0 dan ringkasan, lalu konfirmasi perubahan disk virtual latihan.';
 return null;
}
export function virtualAction(input,action,payload={}){
 const s=structuredClone(input);let vm=s.vms.find(v=>v.id===s.selected),ok=true,text='';
 const fail=message=>{ok=false;text=message;};
 if(action==='platform'){if(!['virtualbox','workstation'].includes(payload.platform))fail('Platform tidak dikenal.');else{s.platform=payload.platform;text='Tampilan pengelola berubah; VM dan hasil latihan tetap sama.';}}
 else if(action==='create'){
  const cfg={...defaultVM(),...payload};
  if(!cfg.name.trim()||s.vms.some(v=>v.name===cfg.name.trim()))fail('Nama VM harus diisi dan unik.');
  else if(!installerProfiles[cfg.os])fail('Pilih profil OS yang tersedia.');
  else if(![cfg.ram,cfg.cpu,cfg.disk].every(n=>Number.isFinite(n)&&n>0))fail('RAM, vCPU dan disk harus angka positif.');
  else if(s.vms.length>=4)fail('Lab membatasi empat VM agar jejak percobaan tetap mudah ditinjau.');
  else if(s.vms.reduce((n,v)=>n+v.disk,0)+cfg.disk>s.host.storage)fail('Reservasi disk melampaui pool host model 256 GiB.');
  else{vm={...cfg,name:cfg.name.trim(),id:s.nextId++,power:'off',installed:null,installer:null,snapshot:null,bootSource:null,bootVerified:false};s.vms.push(vm);s.selected=vm.id;s.evidence.created=true;text=`${vm.name} dibuat dengan disk kosong. Pilih VM lalu Settings untuk memeriksa media dan hardware.`;}
 }else if(action==='select'){if(!s.vms.some(v=>v.id===payload.id))fail('VM tidak ditemukan.');else{s.selected=payload.id;text='VM dipilih. Periksa keadaan sebelum menjalankan tindakan.';}}
 else if(!vm)fail('Buat atau pilih VM terlebih dahulu.');
 else if(action==='settings'){
  if(vm.power!=='off')fail('Matikan guest melalui Shut down sebelum mengubah hardware/jaringan pada model ini.');
  else{
   const allowed=['ram','cpu','efi','tpm','secureBoot','network','segment','ip','iso'];
   if(['ram','cpu'].some(k=>k in payload&&(!Number.isFinite(payload[k])||payload[k]<=0)))fail('RAM/vCPU harus angka positif.');
   else if('iso'in payload&&!['ubuntu','ubuntu-server','windows','none'].includes(payload.iso))fail('Media tidak dikenal.');
   else if('network'in payload&&!['internal','hostonly','nat','bridged'].includes(payload.network))fail('Mode jaringan tidak dikenal.');
   else{for(const k of allowed)if(k in payload)vm[k]=payload[k];text='Settings diterapkan pada VM OFF. Konfigurasi guest dan hasil boot perlu diuji kembali.';vm.bootVerified=false;}
  }
 }else if(action==='start'){
  if(vm.power==='on')fail('VM sudah berjalan. Gunakan konsol di bawah.');
  else{const checks=vmChecks(s,vm);if(checks.some(c=>!c.ok))fail(checks.filter(c=>!c.ok).map(c=>c.text).join('; '));
   else if(vm.iso!=='none'&&vm.iso!==vm.os)fail('ISO tidak cocok dengan profil OS VM. Ganti media saat VM OFF.');
   else if(vm.iso==='none'&&!vm.installed)fail('No bootable medium: disk kosong dan ISO tidak terpasang. Matikan VM, pasang ISO dan mulai lagi.');
   else{vm.power='on';vm.bootVerified=false;if(vm.iso!=='none'){vm.installer=emptyInstaller(vm.os);vm.bootSource='iso';text='Boot dari ISO. Ikuti installer di konsol; disk belum diubah.';}else{vm.installer=null;vm.bootSource='disk';vm.bootVerified=true;s.evidence.diskBoot=true;text='Guest boot dari disk tanpa ISO. Buka desktop dan jalankan pemeriksaan.';}}
  }
 }else if(action==='shutdown'){vm.power='off';text='Guest dihentikan secara tertib pada model. Disk hasil instalasi tetap ada.';}
 else if(action==='eject'){if(vm.power!=='off'&&currentScreen(vm)!=='restart')fail('Lepas ISO saat VM OFF atau ketika installer meminta restart.');else{vm.iso='none';text='ISO dilepas. Mulai/restart guest untuk membuktikan boot disk.';}}
 else if(action==='install-set'){
  if(!vm.installer||vm.power!=='on')fail('Mulai VM dari ISO untuk membuka installer.');
  else{const allowed=['timeFormat','proxy','mirror','installSSH','language','keyboard','internet','method','apps','drivers','diskId','layout','username','hostname','accountReady','timezone','edition','licensed','product','privacy','confirmed'];for(const k of allowed)if(k in payload)vm.installer[k]=payload[k];text='Pilihan installer diperbarui.';}
 }else if(action==='partition'){
  const i=vm.installer;
  if(!i||currentScreen(vm)!=='disk'||!['ubuntu','ubuntu-server'].includes(i.os)||i.layout!=='manual')fail('Buka Manual partitioning Ubuntu terlebih dahulu.');
  else if(i.diskId!==0)fail('Disk 1 terlindungi. Pilih Disk 0 untuk membuat partisi latihan.');
  else if(!Number.isFinite(payload.size)||payload.size<=0||i.partitions.reduce((n,p)=>n+p.size,0)+payload.size>vm.disk)fail('Ukuran partisi tidak valid atau melampaui ruang kosong.');
  else if(!['/','/boot/efi','/home'].includes(payload.mount)||!['ext4','fat32'].includes(payload.fs)||i.partitions.some(p=>p.mount===payload.mount))fail('Pilih mount point unik dan filesystem yang tersedia.');
  else{i.partitions.push({mount:payload.mount,fs:payload.fs,size:payload.size});text='Partisi ditambahkan pada disk virtual model; belum ada perubahan perangkat nyata.';}
 }else if(action==='clear-partitions'){if(vm.installer&&currentScreen(vm)==='disk'){vm.installer.partitions=[];text='Rencana partisi Disk 0 dibersihkan.';}else fail('Buka langkah disk dahulu.');}
 else if(action==='try'){if(vm.installer?.os==='ubuntu'&&currentScreen(vm)==='welcome'){vm.installer.tryMode=true;text='Live session Ubuntu dari ISO. Disk belum berisi OS. Klik Install Ubuntu untuk kembali ke installer.';}else fail('Try Ubuntu tersedia pada layar pemilihan Ubuntu.');}
 else if(action==='return-installer'){if(vm.installer){vm.installer.tryMode=false;text='Kembali ke installer. Pilih Next untuk melanjutkan.';}else fail('Installer belum tersedia.');}
 else if(action==='back'){
  const screen=currentScreen(vm);if(!vm.installer||['copy','restart','desktop'].includes(screen))fail('Tahap ini tidak dapat dibatalkan dengan Back.');
  else{vm.installer.step=Math.max(0,vm.installer.step-1);vm.installer.confirmed=false;text='Kembali satu layar; tinjau kembali keputusan sebelum instalasi.';}
 }else if(action==='next'){
  const i=vm.installer,screen=currentScreen(vm);
  if(!i||vm.power!=='on')fail('Installer belum berjalan.');
  else if(i.tryMode)fail('Anda berada di sesi live; kembali melalui Install Ubuntu.');
  else if(['copy','restart','desktop'].includes(screen))fail('Gunakan tindakan khusus pada layar ini.');
  else{const error=validateInstaller(vm,i,screen);if(error)fail(error);else{if(screen==='account'&&vm.installed){vm.installed.username=i.username;vm.installed.hostname=i.hostname;}i.step++;text=`Lanjut: ${currentScreen(vm)}. Periksa petunjuk di atas konsol.`;}}
 }else if(action==='copy'){
  if(currentScreen(vm)!=='copy')fail('Tinjau dan konfirmasi ringkasan instalasi terlebih dahulu.');
  else{vm.installer.percent=Math.min(100,vm.installer.percent+25);if(vm.installer.percent===100){vm.installed={os:vm.os,username:vm.installer.username,hostname:vm.installer.hostname,partitions:vm.installer.layout==='manual'?structuredClone(vm.installer.partitions):vm.os==='windows'?[{mount:'EFI',fs:'fat32',size:0.1},{mount:'MSR',fs:'reserved',size:0.016},{mount:'C:',fs:'ntfs',size:vm.disk-0.9},{mount:'Recovery',fs:'recovery',size:0.784}]:[{mount:'/boot/efi',fs:'fat32',size:1},{mount:'/',fs:'ext4',size:vm.disk-1}],dataVersion:1,sshEnabled:vm.installer.installSSH};s.evidence.installed=true;vm.installer.step++;text='Penyalinan model selesai. Lepas ISO, lalu Restart untuk menguji boot disk.';}else text=`Menyalin berkas model ${vm.installer.percent}%. Ini tahap representasi, bukan berkas OS yang diunduh.`;}
 }else if(action==='restart'){
  if(!vm.installed)fail('Guest belum mempunyai instalasi disk.');
  else if(vm.iso!=='none')fail('ISO masih terpasang. Lepas media agar tidak masuk installer lagi.');
  else{vm.power='on';vm.bootSource='disk';vm.bootVerified=true;s.evidence.diskBoot=true;if(vm.installer&&currentScreen(vm)==='restart')vm.installer.step++;text='Boot disk berhasil. Selesaikan pengaturan awal jika diminta lalu periksa desktop.';}
 }else if(action==='snapshot'){
  if(!vm.installed||vm.power!=='off')fail('Snapshot lab dibuat saat guest terpasang dan OFF untuk konsistensi sederhana.');
  else{vm.snapshot={installed:structuredClone(vm.installed),ip:vm.ip,network:vm.network,segment:vm.segment};text='Snapshot offline dibuat pada host model yang sama; ini bukan backup off-host.';}
 }else if(action==='change-data'){if(!vm.installed||vm.power!=='on'||!vm.bootVerified)fail('Boot guest dari disk terlebih dahulu.');else{vm.installed.dataVersion++;text=`Berkas proyek model diubah ke versi ${vm.installed.dataVersion}. Snapshot lama tidak otomatis berubah.`;}}
 else if(action==='restore'){
  if(vm.power!=='off'||!vm.snapshot)fail('Matikan guest dan buat snapshot terlebih dahulu.');
  else{Object.assign(vm,structuredClone(vm.snapshot));vm.bootVerified=false;s.evidence.restored=true;text='Snapshot dipulihkan. Mulai VM dan periksa versi berkas; snapshot masih bergantung host yang sama.';}
 }else if(action==='clone'){
  if(vm.power!=='off'||!vm.installed)fail('Clone lab memerlukan guest terpasang dan OFF.');
  else if(s.vms.length>=4||s.vms.reduce((n,v)=>n+v.disk,0)+vm.disk>s.host.storage)fail('Tidak cukup slot atau kapasitas pool untuk clone.');
  else{const clone=structuredClone(vm);clone.id=s.nextId++;clone.name=`${vm.name}-clone-${clone.id}`;clone.snapshot=null;clone.installer=null;clone.bootVerified=false;s.vms.push(clone);text='Clone dibuat dengan IP/hostname tersalin. Ubah identitas clone sebelum menguji jaringan yang sama.';}
 }else if(action==='network-test'){
  const peer=s.vms.find(v=>v.id===payload.peer);
  const ready=v=>v&&v.power==='on'&&v.installed&&v.bootVerified;
  const ipParts=ip=>{const p=String(ip).split('.');return p.length===4&&p.every(x=>/^\d+$/.test(x)&&Number(x)<=255)?p.map(Number):null;};
  const a=ipParts(vm.ip),b=ipParts(peer?.ip);
  if(!ready(vm)||!ready(peer))fail('Kedua guest harus terpasang, ON dan boot dari disk.');
  else if(!a||!b||[0,255].includes(a[3])||[0,255].includes(b[3]))fail('Alamat host model /24 tidak valid.');
  else if(vm.ip===peer.ip)fail('Konflik IP: clone menyalin alamat guest. Ubah alamat salah satu guest.');
  else if(vm.network==='nat'||peer.network==='nat')fail('NAT biasa per VM pada profil ini tidak membuat segmen peer bersama. Gunakan internal/host-only dengan segmen sama.');
  else if(vm.network!==peer.network||vm.segment!==peer.segment)fail('Guest berada pada link virtual berbeda. Cocokkan mode dan nama segmen.');
  else if(a.slice(0,3).join('.')!==b.slice(0,3).join('.'))fail('Alamat berbeda subnet /24; model ini belum mempunyai router.');
  else{s.evidence.network=true;text=`Uji ICMP model ${vm.ip} → ${peer.ip}: reply. Ini membuktikan jalur model, belum layanan aplikasi atau keamanan nyata.`;}
 }else if(action==='guest-command'){
  const profile=payload.profile||(vm.os==='windows'?'cmd':'linux');
  if(!vm.installed||vm.power!=='on'||!vm.bootVerified)fail('Boot guest dari disk sebelum membuka terminal.');
  else if(!['linux','cmd','powershell'].includes(profile)||(vm.os==='windows'?profile==='linux':profile!=='linux'))fail('Shell tidak sesuai OS guest.');
  else if(typeof payload.command!=='string'||payload.command.length>1000)fail('Command latihan tidak valid.');
  else{vm.installed.shells??={};vm.installed.consoleLogs??={};const shell=vm.installed.shells[profile]||newTerminal(profile);if(!vm.installed.shells[profile]){shell.user=vm.installed.username;shell.machine=vm.installed.hostname;const old=shell.cwd;shell.cwd=profile==='linux'?'/home/'+vm.installed.username:'C:\\Users\\'+vm.installed.username;for(const key of Object.keys(shell.files)){if(key.startsWith(old+'/')||key.startsWith(old+'\\')){shell.files[shell.cwd+key.slice(old.length)]=shell.files[key];delete shell.files[key];}}if(vm.os==='ubuntu-server')shell.services.ssh.active=vm.installed.sshEnabled!==false;}const output=runTerminal(shell,payload.command);vm.installed.shells[profile]=output.state;const entries=vm.installed.consoleLogs[profile]||[];vm.installed.consoleLogs[profile]=[...entries,`> ${payload.command}`,output.output||'(tidak ada keluaran)'].slice(-30);text=`Command diproses pada terminal ${profile} model. Exit status ${output.code}.`;}
 }else fail('Tindakan tidak dikenal.');
 s.log.push({action,ok,text});s.log=s.log.slice(-40);return {state:s,ok,text};
}
