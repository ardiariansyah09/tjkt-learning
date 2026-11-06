export const platforms={linux:{name:'Ubuntu Server (model)',package:'apache2',service:'apache2',install:'sudo apt install apache2',start:'sudo systemctl start apache2',enable:'sudo systemctl enable apache2'},windows:{name:'Windows Server (model)',package:'Web-Server',service:'W3SVC',install:'Install-WindowsFeature Web-Server',start:'Start-Service W3SVC',enable:'Set-Service W3SVC -StartupType Automatic'}};
export function newOS(os='linux'){return {os,installed:false,media:false,disk:'empty',mounted:false,persistent:false,network:false,index:false,package:false,active:false,enabled:false,version:1,pending:false,backup:null,events:[],verified:false,bootReady:false};}
export function osAction(old,action,value){const s=structuredClone(old);let ok=true,message='';const fail=t=>{ok=false;message=t;};s.verified=false;if(action!=='test')s.bootReady=false;
 switch(action){
 case 'media':s.media=true;message='Media resmi latihan terpasang pada VM kosong model.';break;
 case 'install':if(!s.media)fail('Lampirkan media terlebih dahulu.');else {s.installed=true;message='OS dipasang pada disk sistem VM kosong model. Disk data terpisah belum disiapkan.';}break;
 case 'format':if(!s.installed)fail('OS belum siap.');else if(s.disk!=='empty')fail('Disk data sudah berisi filesystem; format ulang ditolak untuk menjaga data.');else {s.disk='formatted';message='Disk DATA kosong model dipartisi dan diformat; disk sistem tidak disentuh.';}break;
 case 'mount':if(s.disk!=='formatted')fail('Siapkan filesystem disk data kosong dahulu.');else {s.mounted=true;message='Volume data tersedia sekarang. Persistensi boot belum dikonfigurasi.';}break;
 case 'persist':if(!s.mounted)fail('Mount/akses volume dahulu.');else {s.persistent=true;message='Persistensi volume model dicatat; verifikasi sesudah boot tetap diperlukan.';}break;
 case 'network':if(!s.installed)fail('OS belum siap.');else {s.network=value==='valid';s.index=false;message=s.network?'IP/prefix, gateway dan DNS model sesuai rancangan.':'Konfigurasi DNS model salah; indeks repository tidak dapat diperbarui.';}break;
 case 'index':if(!s.network)fail('Repository model tidak terjangkau; periksa jaringan dan resolver.');else {s.index=true;message=s.os==='linux'?'Indeks paket diperbarui; paket terpasang belum berubah.':'Sumber role/media latihan tersedia; ini bukan apt update di Windows.';}break;
 case 'package':if(!s.index)fail('Periksa sumber paket/role dahulu.');else {s.package=true;message=`${platforms[s.os].package} tersedia. Model sengaja belum menjalankan layanan otomatis; perilaku installer nyata dapat berbeda.`;}break;
 case 'start':if(!s.package)fail('Paket/role belum tersedia.');else {s.active=true;message='Layanan aktif saat ini; startup belum tentu otomatis.';}break;
 case 'enable':if(!s.package)fail('Paket/role belum tersedia.');else {s.enabled=true;message='Startup otomatis diatur; tidak otomatis mengubah status aktif model.';}break;
 case 'backup':if(!s.installed)fail('OS belum terpasang.');else {s.backup={version:s.version};message='Cadangan konfigurasi versi berjalan model dibuat di luar VM. Bukan backup OS/data lengkap.';}break;
 case 'update':if(!s.index||!s.backup)fail('Periksa sumber pembaruan dan buat cadangan konfigurasi dahulu.');else {s.pending=true;message='Paket pembaruan model dipasang; versi berjalan tetap sampai reboot. Semua pembaruan di skenario ini memerlukan reboot, bukan aturan semua patch.';}break;
 case 'reboot':if(!s.installed)fail('OS belum siap.');else {s.active=s.package&&s.enabled;s.mounted=s.disk==='formatted'&&s.persistent;if(s.pending){s.version++;s.pending=false;}s.bootReady=true;message='Boot selesai. Periksa volume, layanan, dan versi yang benar-benar berjalan.';}break;
 case 'test':s.verified=!!(s.installed&&s.mounted&&s.network&&s.active);ok=s.verified;message=ok?`Transaksi klien model berhasil; volume tersedia; versi berjalan ${s.version}. Uji boot terpisah diperlukan untuk persistensi.`:'Transaksi gagal: periksa OS, volume data, jaringan, paket dan status layanan.';break;
 default:fail('Operasi tidak dikenal.');}
 s.events.push({action,ok,message});return {state:s,result:{ok,message,action,...s}};
}
export const rolloutLevels=[{name:'Dua server, satu teknisi',budget:28,patch:false},{name:'Pembaruan dan jendela reboot',budget:32,patch:true},{name:'Rekonstruksi volume setelah boot',budget:26,patch:true}];
export function newRollout(level=0){return {level,turn:0,servers:['linux','windows'].map(os=>{const v=newOS(os);if(level===2){v.installed=true;v.media=true;v.disk='formatted';}return v;}),tickets:[false,false],won:false,lost:false,message:'Siapkan dua server dan serahkan bukti setelah boot.'};}
export function rolloutAction(old,id,action,value){const s=structuredClone(old),cfg=rolloutLevels[s.level];if(s.won||s.lost)return s;if(![0,1].includes(id))return s;s.turn++;s.tickets[id]=false;
 if(action==='deliver'){const v=s.servers[id],pass=v.verified&&v.bootReady&&v.persistent&&v.enabled&&(!cfg.patch||(v.version>=2&&!v.pending));s.tickets[id]=!!pass;s.message=pass?'Bukti diterima untuk server ini.':'Bukti belum lengkap: uji berhasil setelah boot, volume persisten, startup otomatis dan versi target diperlukan.';}
 else {const r=osAction(s.servers[id],action,value);s.servers[id]=r.state;s.message=r.result.message;}
 s.won=s.tickets.every(Boolean);s.lost=!s.won&&s.turn>=cfg.budget;if(s.lost)s.message='Anggaran tindakan habis. Ulangi level dan rencanakan urutan dependensi.';return s;
}
