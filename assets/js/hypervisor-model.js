// Browser-only state machine: no remote host, disk, credential or hypervisor APIs.
export const platforms={
 proxmox:{name:'Proxmox VE',version:'8.1',steps:['boot','license','disk','location','identity','network','review','installing','complete','console','certificate','login','manager'],wizard:['General','OS','System','Disks','CPU','Memory','Network','Confirm']},
 esxi:{name:'VMware ESXi',version:'8.0',steps:['boot','welcome','license','disk','keyboard','identity','review','installing','complete','console','dcui-login','dcui-menu','dcui-network','dcui-confirm','certificate','login','manager'],wizard:['Select creation type','Select a name and guest OS','Select storage','Customize settings','Ready to complete']}
};
export const LAB_SECRET='Lab-Only!2026'; // Public synthetic dataset. Never ask for a real password.
export function newHypervisor(platform='proxmox'){
 if(!platforms[platform])throw Error('Unknown hypervisor');
 return {schema:1,platform,step:0,installerMedia:true,installed:false,progress:0,credentialSet:false,certificateVerified:false,authenticated:false,networkTested:false,
 draft:{disk:'disk0',filesystem:'ext4',country:'Indonesia',timezone:'Asia/Jakarta',keyboard:'US',email:'operator@example.test',hostname:platform==='proxmox'?'pve.lab.test':'esxi.lab.test',nic:platform==='proxmox'?'eno1':'vmnic0',ip:platform==='proxmox'?'192.0.2.20':'192.0.2.30',prefix:24,gateway:'192.0.2.1',dns:'192.0.2.53'},network:null,
 host:{ram:16,reserve:4,cpu:8,storage:256},isos:[],vms:[],selected:null,wizard:null,view:'summary',log:[],evidence:{installed:false,bootDisk:false,management:false,createdVM:false,powerVM:false,guestInstalled:false,guestBoot:false,snapshotRestore:false}};
}
export const hypervisorScreen=s=>platforms[s.platform].steps[s.step];
export function restoreHypervisor(value,platform){
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v),bool=v=>typeof v==='boolean',string=v=>typeof v==='string'&&v.length<150;
 if(!object(value)||value.schema!==1||value.platform!==platform||!platforms[platform]||!Number.isInteger(value.step)||value.step<0||value.step>=platforms[platform].steps.length)throw Error('Invalid hypervisor session');
 if(['installerMedia','installed','credentialSet','certificateVerified','authenticated','networkTested'].some(k=>!bool(value[k]))||!Number.isInteger(value.progress)||value.progress<0||value.progress>100)throw Error('Invalid installer state');
 if(!object(value.draft)||['disk','filesystem','country','timezone','keyboard','email','hostname','nic','ip','gateway','dns'].some(k=>!string(value.draft[k]))||!Number.isInteger(value.draft.prefix))throw Error('Invalid draft');
 if(!object(value.host)||value.host.ram!==16||value.host.reserve!==4||value.host.cpu!==8||value.host.storage!==256||!object(value.evidence)||Object.values(value.evidence).some(v=>!bool(v)))throw Error('Invalid host');
 if(!Array.isArray(value.isos)||value.isos.length>2||value.isos.some(x=>!['ubuntu-24.04-desktop.iso','windows-11.iso'].includes(x))||!Array.isArray(value.log)||value.log.length>35||value.log.some(x=>!object(x)||!string(x.action)||typeof x.text!=='string'||x.text.length>1000||!bool(x.ok)))throw Error('Invalid media/log');
 if(value.network!==null&&(!object(value.network)||validateManagement(value.network)))throw Error('Invalid active network');
 if(!Array.isArray(value.vms)||value.vms.length>6||value.vms.some(v=>!object(v)||!Number.isInteger(v.id)||!string(v.name)||!['linux','windows'].includes(v.os)||!bool(v.power)||!Number.isFinite(v.ram)||!Number.isFinite(v.cpu)||!Number.isFinite(v.disk)||v.guest!==null&&(!object(v.guest)||v.guest.schema!==1||!Array.isArray(v.guest.vms)||v.guest.vms.length!==1||!object(v.guest.vms[0])||!['on','off'].includes(v.guest.vms[0].power))))throw Error('Invalid VM inventory');
 if(value.wizard!==null&&(!object(value.wizard)||!object(value.wizard.draft)||!Number.isInteger(value.wizard.step)||value.wizard.step<0||value.wizard.step>=platforms[platform].wizard.length))throw Error('Invalid wizard');
 return structuredClone(value);
}
const ipv4=v=>typeof v==='string'&&/^\d{1,3}(\.\d{1,3}){3}$/.test(v)&&v.split('.').every(x=>+x<=255);
const toInt=ip=>ip.split('.').reduce((n,v)=>(n*256+ +v)>>>0,0);
export function validateManagement(n){
 if(!n||!ipv4(n.ip)||!ipv4(n.gateway)||!ipv4(n.dns))return 'IP, gateway dan DNS harus berupa IPv4 yang valid.';
 if(!Number.isInteger(+n.prefix)||+n.prefix<16||+n.prefix>30)return 'Prefix lab mendukung /16 sampai /30.';
 const mask=(0xffffffff<<(32-+n.prefix))>>>0,ip=toInt(n.ip),gw=toInt(n.gateway),network=(ip&mask)>>>0,broadcast=(network|(~mask>>>0))>>>0;
 if(ip===network||ip===broadcast||gw===network||gw===broadcast||ip===gw)return 'Alamat host/gateway tidak boleh alamat network, broadcast, atau sama.';
 if((ip&mask)!==(gw&mask))return 'Gateway harus berada pada subnet manajemen yang sama.';
 if(!/^[a-z][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*){2,}$/i.test(n.hostname||''))return 'Gunakan hostname FQDN, misalnya pve.lab.test.';
 return null;
}
export function managementReachable(s){if(!s.installed||!s.network)return false;const n=s.network;if(validateManagement(n))return false;const mask=(0xffffffff<<(32-+n.prefix))>>>0;return (toInt(n.ip)&mask)===(toInt('192.0.2.10')&mask)&&n.nic===(s.platform==='proxmox'?'eno1':'vmnic0');}
const vmDefaults=s=>({id:100+s.vms.length,name:'kelas-linux',os:'linux',iso:'',firmware:'bios',disk:32,cpu:2,ram:4,network:s.platform==='proxmox'?'vmbr0':'VM Network',storage:s.platform==='proxmox'?'local-lvm':'datastore1',type:'new'});
function validateVM(s,d,stage){
 const all=stage==='all',p=s.platform;
 if(all||stage===(p==='proxmox'?'General':'Select a name and guest OS')){if(!Number.isInteger(+d.id)||+d.id<100||+d.id>999999)return 'VM ID harus bilangan 100–999999 pada lab.';if(!/^[a-zA-Z][a-zA-Z0-9-]{2,30}$/.test(d.name))return 'Nama VM 3–31 karakter: huruf, angka atau tanda hubung.';if(s.vms.some(v=>v.id===+d.id||v.name.toLowerCase()===d.name.toLowerCase()))return 'VM ID/nama sudah digunakan.';if(!['linux','windows'].includes(d.os))return 'Pilih keluarga guest yang tersedia.';}
 if(all||stage==='OS'||stage==='Customize settings'){if(d.iso&&!s.isos.includes(d.iso))return 'ISO belum tersedia pada storage yang dipilih.';}
 if(all||['Disks','Select storage','Customize settings'].includes(stage)){if(d.storage!==(p==='proxmox'?'local-lvm':'datastore1'))return 'Storage disk guest tidak sesuai. local/ISO bukan local-lvm pada profil Proxmox.';if(!Number.isFinite(+d.disk)||+d.disk<16||+d.disk>256)return 'Disk guest lab harus 16–256 GiB.';if(s.vms.reduce((n,v)=>n+v.disk,0)+ +d.disk>s.host.storage)return 'Kapasitas virtual yang direservasi melampaui pool lab 256 GiB.';}
 if(all||['CPU','Customize settings'].includes(stage)){if(!Number.isInteger(+d.cpu)||+d.cpu<1||+d.cpu>s.host.cpu)return 'vCPU lab harus 1–8.';}
 if(all||['Memory','Customize settings'].includes(stage)){if(!Number.isInteger(+d.ram)||+d.ram<2||+d.ram>12)return 'RAM guest lab harus 2–12 GiB; sisakan resource host.';}
 if(all||['Network','Customize settings'].includes(stage)){if(d.network!==(p==='proxmox'?'vmbr0':'VM Network'))return 'Bridge/port group tidak ditemukan pada host lab.';}
 if(all||stage==='System'){if(!['bios','uefi'].includes(d.firmware))return 'Firmware tidak dikenal.';}
 if(stage==='Select creation type'&&d.type!=='new')return 'Latihan ini membuat VM baru; register/deploy OVF belum dimodelkan.';
 if(all&&(+d.ram<4||+d.cpu<2||+d.disk<(d.os==='windows'?64:25)))return 'Profil installer guest lab memerlukan RAM 4 GiB, 2 vCPU dan disk minimal '+(d.os==='windows'?'64':'25')+' GiB. Sesuaikan resource sebelum Finish.';
 return null;
}
export function hypervisorAction(input,action,payload={}){
 const s=structuredClone(input),screen=hypervisorScreen(s),result=(ok,text)=>{s.log.push({action,ok,text});s.log=s.log.slice(-35);return {state:s,ok,text};},fail=text=>result(false,text),go=()=>{s.step++;return result(true,'Lanjut: '+hypervisorScreen(s));};
 const manager=()=>screen==='manager'&&s.authenticated&&managementReachable(s);
 if(action==='edit'){
  if(!['disk','location','identity','network','dcui-network','keyboard'].includes(screen))return fail('Pengaturan ini hanya tersedia pada layar konfigurasi yang sesuai.');
  const keys={disk:['disk','filesystem'],location:['country','timezone','keyboard'],identity:['email'],network:['hostname','nic','ip','prefix','gateway','dns'],'dcui-network':['hostname','nic','ip','prefix','gateway','dns'],keyboard:['keyboard']}[screen];
  for(const key of keys)if(Object.hasOwn(payload,key))s.draft[key]=key==='prefix'?Number(payload[key]):String(payload[key]).slice(0,100);
  if(screen==='identity'&&Object.hasOwn(payload,'validCredential'))s.credentialSet=payload.validCredential===true;
  s.networkTested=false;return result(true,'Pilihan disimpan sebagai draft; belum diterapkan ke host.');
 }
 if(action==='next'){
  if(!['boot','welcome','license','disk','location','keyboard','identity','network'].includes(screen))return fail('Gunakan tindakan khusus pada layar ini.');
  if(screen==='license'&&payload.accepted!==true)return fail('Tinjau persetujuan lisensi pada latihan sebelum melanjutkan.');
  if(screen==='disk'&&s.draft.disk!=='disk0')return fail('Disk 1 berisi DATA siswa yang dilindungi. Pilih Disk 0 kosong untuk instalasi lab.');
  if(screen==='disk'&&s.platform==='proxmox'&&!['ext4','xfs'].includes(s.draft.filesystem))return fail('Profil ini mendukung ext4/xfs satu disk. ZFS/RAID memerlukan skenario lain.');
  if(screen==='location'&&(!s.draft.country||!['Asia/Jakarta','Asia/Makassar','Asia/Jayapura'].includes(s.draft.timezone)))return fail('Pilih lokasi dan zona waktu latihan.');
  if(screen==='identity'&&(!s.credentialSet||s.platform==='proxmox'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.draft.email)))return fail('Sandi dataset harus cocok pada kedua kolom; email operator harus valid untuk Proxmox.');
  if(screen==='network'){const error=validateManagement(s.draft);if(error)return fail(error);if(s.reconfiguring){s.network=structuredClone(s.draft);s.reconfiguring=false;s.step=platforms.proxmox.steps.indexOf('console');s.certificateVerified=false;s.authenticated=false;return result(true,'Konfigurasi manajemen dipulihkan melalui konsol model. Uji akses ulang.');}}
  return go();
 }
 if(action==='back'){
  if(s.step===0||['installing','complete','console','manager','dcui-menu','dcui-confirm'].includes(screen))return fail('Layar ini tidak memiliki Back.');
  s.step--;return result(true,'Kembali satu layar.');
 }
 if(action==='install'){
  if(screen!=='review')return fail('Tinjau ringkasan instalasi terlebih dahulu.');
  if(payload.confirmed!==true||s.draft.disk!=='disk0')return fail('Konfirmasi target Disk 0 virtual sebelum menginstal.');
  if(!s.credentialSet)return fail('Identitas administrator belum disiapkan.');
  if(s.platform==='proxmox'){const error=validateManagement(s.draft);if(error)return fail(error);}
  return go();
 }
 if(action==='copy'){
  if(screen!=='installing')return fail('Tidak ada instalasi berjalan.');
  s.progress=Math.min(100,s.progress+25);if(s.progress===100){s.installed=true;s.evidence.installed=true;if(s.platform==='proxmox')s.network=structuredClone(s.draft);s.step++;}
  return result(true,`Instalasi model ${s.progress}%. Tidak ada disk komputer pengguna yang diakses.`);
 }
 if(action==='eject'){
  if(!s.installed||!['complete','console'].includes(screen))return fail('Lepas media setelah instalasi selesai.');
  s.installerMedia=false;return result(true,'Media installer virtual dilepas.');
 }
 if(action==='reboot'){
  if(!['complete','console'].includes(screen)||!s.installed)return fail('Selesaikan instalasi dahulu.');
  if(s.installerMedia)return fail('Media installer masih terpasang. Lepas media untuk membuktikan boot dari disk.');
  s.step=platforms[s.platform].steps.indexOf('console');s.evidence.bootDisk=true;s.authenticated=false;return result(true,'Host boot dari Disk 0. Layanan manajemen mengikuti konfigurasi host.');
 }
 if(action==='dcui'){
  if(screen!=='console'||s.platform!=='esxi')return fail('F2 hanya tersedia pada konsol ESXi.');return go();
 }
 if(action==='edit-management'){
  if(screen!=='console'||s.platform!=='proxmox'||!s.installed)return fail('Pemulihan hanya melalui konsol Proxmox terpasang.');s.reconfiguring=true;s.step=platforms.proxmox.steps.indexOf('network');return result(true,'Editor pemulihan jaringan konsol model; pada Proxmox asli gunakan konfigurasi jaringan sesuai SOP, bukan installer ulang.');
 }
 if(action==='dcui-login'){
  if(screen!=='dcui-login'||payload.valid!==true)return fail('Login root dataset tidak cocok.');return go();
 }
 if(action==='dcui-network'){
  if(screen!=='dcui-menu')return fail('Pilih Configure Management Network dari menu DCUI.');return go();
 }
 if(action==='dcui-save'){
  if(screen!=='dcui-network')return fail('Buka konfigurasi jaringan DCUI.');const error=validateManagement(s.draft);if(error)return fail(error);return go();
 }
 if(action==='dcui-apply'){
  if(screen!=='dcui-confirm'||payload.confirmed!==true)return fail('Konfirmasi restart management network.');s.network=structuredClone(s.draft);s.step=platforms.esxi.steps.indexOf('console');s.authenticated=false;s.networkTested=false;return result(true,'Jaringan manajemen diterapkan; sesi web lama harus diuji kembali.');
 }
 if(action==='test-management'){
  if(!['console','manager'].includes(screen))return fail('Host harus boot dari disk terlebih dahulu.');s.networkTested=managementReachable(s);return result(s.networkTested,s.networkTested?'Client operator 192.0.2.10 dapat mencapai alamat manajemen pada dataset.':'Tidak ada jalur manajemen dari client 192.0.2.10. Periksa IP/subnet dan NIC melalui konsol.');
 }
 if(action==='open-web'){
  if(screen!=='console'||!s.evidence.bootDisk)return fail('Boot host dari disk terlebih dahulu.');
  if(!managementReachable(s))return fail('Halaman manajemen tidak dapat dijangkau. Konfigurasikan jaringan host melalui konsol.');
  s.step=platforms[s.platform].steps.indexOf('certificate');return result(true,'Browser operator membuka alamat manajemen model; tinjau identitas certificate.');
 }
 if(action==='certificate'){
  if(screen!=='certificate'||payload.verified!==true)return fail('Cocokkan fingerprint dataset melalui konsol host terlebih dahulu.');s.certificateVerified=true;return go();
 }
 if(action==='login'){
  if(screen!=='login'||payload.valid!==true||!s.certificateVerified||!managementReachable(s))return fail('Login tidak berhasil. Periksa akun, realm dan koneksi pada profil latihan.');s.authenticated=true;s.evidence.management=true;return go();
 }
 if(action==='logout'){
  if(screen!=='manager')return fail('Belum ada sesi web.');s.authenticated=false;s.step=platforms[s.platform].steps.indexOf('login');s.wizard=null;return result(true,'Sesi web model diakhiri.');
 }
 if(!manager())return fail('Masuk ke antarmuka manajemen terlebih dahulu.');
 if(action==='view'){if(!['summary','storage','network','vms','console','hardware','snapshots'].includes(payload.view))return fail('Menu belum didukung.');s.view=payload.view;return result(true,'Menu: '+s.view);}
 if(action==='upload-iso'){
  if(!['ubuntu-24.04-desktop.iso','windows-11.iso'].includes(payload.iso))return fail('Pilih ISO dataset yang tersedia; tidak ada upload file perangkat.');if(!s.isos.includes(payload.iso))s.isos.push(payload.iso);return result(true,'ISO dataset tersedia pada storage: '+payload.iso);
 }
 if(action==='new-vm'){if(s.wizard)return fail('Selesaikan atau batalkan wizard aktif.');if(s.vms.length>=6)return fail('Lab membatasi enam VM per host. Mulai sesi lain untuk eksperimen tambahan.');s.wizard={step:0,draft:vmDefaults(s)};return result(true,'Wizard Create VM dibuka.');}
 if(action==='cancel-vm'){s.wizard=null;return result(true,'Wizard dibatalkan. Belum ada VM dibuat.');}
 if(action==='vm-edit'){
  if(!s.wizard)return fail('Buka wizard VM dahulu.');const allowed=['id','name','os','iso','firmware','disk','cpu','ram','network','storage','type'];for(const key of allowed)if(Object.hasOwn(payload,key))s.wizard.draft[key]=['id','disk','cpu','ram'].includes(key)?Number(payload[key]):String(payload[key]).slice(0,80);return result(true,'Draft VM diperbarui; belum membuat image.');
 }
 if(action==='vm-next'){
  if(!s.wizard)return fail('Wizard belum dibuka.');const stage=platforms[s.platform].wizard[s.wizard.step],error=validateVM(s,s.wizard.draft,stage);if(error)return fail(error);if(s.wizard.step===platforms[s.platform].wizard.length-1)return fail('Gunakan Finish untuk membuat VM.');s.wizard.step++;return result(true,'Lanjut: '+platforms[s.platform].wizard[s.wizard.step]);
 }
 if(action==='vm-back'){if(!s.wizard||s.wizard.step===0)return fail('Tidak ada langkah sebelumnya.');s.wizard.step--;return result(true,'Kembali ke langkah VM sebelumnya.');}
 if(action==='vm-finish'){
  if(!s.wizard||s.wizard.step!==platforms[s.platform].wizard.length-1)return fail('Tinjau ringkasan wizard dahulu.');const error=validateVM(s,s.wizard.draft,'all');if(error)return fail(error);const d=s.wizard.draft,v={...d,id:+d.id,ram:+d.ram,cpu:+d.cpu,disk:+d.disk,power:false,guest:null,snapshot:null};s.vms.push(v);s.selected=v.id;s.wizard=null;s.view='vms';s.evidence.createdVM=true;return result(true,'VM dibuat dengan disk kosong. Instalasi hypervisor bukan instalasi OS guest.');
 }
 if(action==='select-vm'){if(!s.vms.some(v=>v.id===+payload.id))return fail('VM tidak ditemukan.');s.selected=+payload.id;s.view='summary';return result(true,'VM dipilih.');}
 const vm=s.vms.find(v=>v.id===s.selected);if(!vm)return fail('Pilih VM terlebih dahulu.');
 if(action==='start'){
  if(vm.power)return fail('VM sudah berjalan.');const ram=s.vms.filter(v=>v.power).reduce((n,v)=>n+v.ram,0);if(ram+vm.ram>s.host.ram-s.host.reserve)return fail('Memori guest aktif melebihi anggaran 12 GiB setelah cadangan host.');if(vm.iso&&!s.isos.includes(vm.iso))return fail('ISO pada CD/DVD tidak ditemukan.');vm.power=true;s.evidence.powerVM=true;s.view='console';return result(true,vm.iso?'Guest boot ke media installer yang dipilih.':'Guest power ON; '+(vm.guest?'boot dari disk.':'No bootable device — disk kosong dan tidak ada ISO.'));
 }
 if(action==='shutdown'){vm.power=false;return result(true,'Guest dihentikan pada model; disk tetap tersimpan.');}
 if(action==='attach-iso'){
  if(vm.power)return fail('Matikan guest sebelum mengganti media pada profil latihan ini.');if(payload.iso!==''&&!s.isos.includes(payload.iso))return fail('ISO belum tersedia.');vm.iso=payload.iso;return result(true,vm.iso?'CD/DVD terhubung ke ISO dataset.':'Media CD/DVD dilepas.');
 }
 if(action==='snapshot'){
  if(vm.power||!vm.guest)return fail('Snapshot latihan memerlukan guest terpasang dan OFF.');vm.snapshot={guest:structuredClone(vm.guest),iso:vm.iso};return result(true,'Snapshot offline dibuat pada storage host model; bukan backup terpisah.');
 }
 if(action==='restore'){
  if(vm.power||!vm.snapshot)return fail('Matikan VM dan pastikan snapshot tersedia.');vm.guest=structuredClone(vm.snapshot.guest);vm.iso=vm.snapshot.iso;s.evidence.snapshotRestore=true;return result(true,'Snapshot dipulihkan. Boot dan periksa guest kembali.');
 }
 return fail('Tindakan tidak didukung pada profil ini.');
}
export function applyGuestState(input,vmId,guest){
 const s=structuredClone(input),vm=s.vms.find(v=>v.id===vmId);if(!vm||!vm.power||!guest||guest.schema!==1||!Array.isArray(guest.vms)||guest.vms.length!==1)return {state:s,ok:false,text:'Konsol tidak cocok dengan VM aktif.'};
 const machine=guest.vms[0];if(machine.os!==(vm.os==='windows'?'windows':'ubuntu')||machine.ram!==vm.ram||machine.cpu!==vm.cpu||machine.disk!==vm.disk)return {state:s,ok:false,text:'Resource/OS konsol berbeda dari VM host.'};vm.guest=structuredClone(guest);vm.iso=machine.iso==='none'?'':vm.os==='windows'?'windows-11.iso':'ubuntu-24.04-desktop.iso';vm.power=machine.power==='on';if(machine.installed)s.evidence.guestInstalled=true;if(machine.bootVerified)s.evidence.guestBoot=true;return {state:s,ok:true,text:'State konsol guest tersimpan pada VM host model.'};
}
