export const replacementProfiles={managed:{name:'Managed PoE + SFP',poe:true,trunk:true,sfp:true},basic:{name:'Basic tanpa PoE/trunk',poe:false,trunk:false,sfp:false}};
export function newMigration(){return {phase:'prepare',backup:false,restoreTest:false,staged:null,ready:false,active:'old',version:0,elapsed:0,window:null,fault:'none',probe:null,history:[]};}
export function preflightReplacement(v){
 if(!replacementProfiles[v.profile]||!Number.isInteger(v.window)||v.window<14||v.window>60)throw Error('Pilih profil dan jendela 14–60 menit.');
 const profile=replacementProfiles[v.profile],checks=[{label:'Profil fungsi/media/daya',pass:profile.poe&&profile.trunk&&profile.sfp,detail:'AP memerlukan PoE/trunk dan uplink memerlukan SFP pada kasus.'},{label:'Adaptasi konfigurasi',pass:v.translation==='adapted',detail:'Penamaan Gi lama harus dipetakan ke interface perangkat baru, bukan raw copy.'},{label:'Pemetaan port baru',pass:v.pc===1&&v.ap===2&&v.uplink===9,detail:'Dokumen kasus: siswa Ethernet1, AP PoE Ethernet2, uplink SFP9.'},{label:'VLAN yang diperlukan',pass:v.vlan20&&v.management,detail:'VLAN 10 selalu disiapkan pada dataset; VLAN 20 serta manajemen 99 juga diperlukan.'}];return {checks,passed:checks.every(c=>c.pass)};
}
function log(s,text){s.history.push(`${s.elapsed} menit · ${text}`);}
export function migrationAction(s,action,v){
 if(action==='backup'){if(s.phase!=='prepare')throw Error('Cadangkan sebelum staging/cutover; mulai ulang skenario bila perlu.');s.backup=true;s.restoreTest=false;log(s,'Cadangan keadaan lama dibuat pada dataset; belum membuktikan restore.');return;}
 if(action==='restore'){if(!s.backup||s.phase!=='prepare')throw Error('Buat cadangan pada tahap persiapan terlebih dahulu.');s.restoreTest=true;log(s,'Uji pemulihan cadangan lulus pada lingkungan terisolasi model.');return;}
 if(action==='stage'){if(s.active!=='old'||!['prepare','staged','ready'].includes(s.phase))throw Error('Staging hanya sebelum cutover.');preflightReplacement(v);s.staged=JSON.parse(JSON.stringify(v));s.ready=false;s.phase='staged';log(s,'Rancangan diterapkan pada calon pengganti terisolasi.');return;}
 if(action==='preflight'){if(!s.backup||!s.restoreTest||!s.staged)throw Error('Butuh cadangan, uji pemulihan, dan staging sebelum pemeriksaan siap migrasi.');const r=preflightReplacement(s.staged);s.ready=r.passed;s.phase=r.passed?'ready':'staged';log(s,`Pemeriksaan siap migrasi ${r.passed?'LULUS':'GAGAL'}.`);return r;}
 if(action==='cutover'){if(!s.ready||s.phase!=='ready')throw Error('Pemeriksaan siap migrasi harus lulus pada rancangan terkini.');s.window=s.staged.window;s.fault=s.staged.fault;s.active='new';s.phase='cutover';s.version++;s.elapsed=4;s.probe=null;log(s,'Cutover model selesai; perangkat lama terisolasi dan tersedia untuk pemulihan.');return;}
 if(action==='probe'){if(!['cutover','rollback'].includes(s.phase))throw Error('Uji layanan sesudah cutover atau rollback.');s.elapsed+=3;const good=s.active==='old'||s.fault==='none';s.probe={version:s.version,active:s.active,passed:good,checks:[{label:'Jalur siswa VLAN 10',pass:s.active==='old'||s.fault!=='uplink'},{label:'Jalur admin VLAN 20',pass:good},{label:'Pengelolaan VLAN 99',pass:s.active==='old'||s.fault!=='uplink'}]};log(s,`Uji layanan ${s.active==='old'?'lama':'baru'} ${good?'LULUS':'GAGAL'} pada versi ${s.version}.`);return s.probe;}
 if(action==='fix-vlan'||action==='fix-uplink'){if(s.phase!=='cutover'||!s.probe||s.probe.version!==s.version||s.probe.passed)throw Error('Kumpulkan bukti uji gagal terkini sebelum perbaikan.');if(s.elapsed+4+3+7>s.window)throw Error('Sisa waktu tidak cukup untuk perbaikan 4 + uji 3 + cadangan rollback/uji lama 7. Jalankan rollback.');s.elapsed+=4;const expected=action==='fix-vlan'?'vlan20':'uplink';if(s.fault===expected)s.fault='none';s.version++;s.probe=null;log(s,`${action==='fix-vlan'?'Allowed VLAN 20 dipulihkan':'Uplink dipasang ulang sesuai label'}; perlu uji baru.`);return;}
 if(action==='rollback'){if(s.phase!=='cutover')throw Error('Rollback dilakukan saat perangkat baru aktif dalam cutover.');if(s.elapsed+7>s.window)throw Error('Jendela tidak cukup untuk rollback dan uji; skenario memerlukan eskalasi. Mulai ulang untuk mengevaluasi rencana waktu.');s.elapsed+=4;s.active='old';s.phase='rollback';s.version++;s.probe=null;log(s,'Perangkat lama dipulihkan pada model; belum boleh dinyatakan pulih sebelum diuji.');return;}
 if(action==='accept'){if(s.phase!=='cutover'||!s.probe?.passed||s.probe.version!==s.version||s.elapsed>s.window)throw Error('Penerimaan memerlukan uji baru lulus dalam jendela pada perangkat pengganti.');s.phase='accepted';log(s,'Migrasi diterima sesuai lingkup model; retensi perangkat lama mengikuti kebijakan.');return;}
 throw Error('Tindakan tidak dikenal.');
}
export function invalidateMigrationDraft(s){if(['prepare','staged','ready'].includes(s.phase)){s.staged=null;s.ready=false;s.phase='prepare';}}
export const swapRooms=[
 {width:7,height:6,player:[3,3],old:[3,2],fresh:[2,3],rack:[3,2],store:[5,2],walls:[],budget:45},
 {width:7,height:6,player:[3,3],old:[3,2],fresh:[4,3],rack:[3,2],store:[1,2],walls:[],budget:45},
 {width:7,height:7,player:[3,4],old:[3,3],fresh:[2,4],rack:[3,3],store:[5,3],walls:[[2,2],[4,2]],budget:50}
];
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
export function newSwap(room){return {player:[...room.player],old:[...room.old],fresh:[...room.fresh],moves:0,won:false,lost:false,message:'Dorong O ke S, kemudian N ke R.'};}
export const swapDirections={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
export function moveSwap(room,state,direction){
 if(state.won||state.lost)return state;const delta=swapDirections[direction];if(!delta)return state;const next=JSON.parse(JSON.stringify(state)),to=[state.player[0]+delta[0],state.player[1]+delta[1]],blocked=p=>p[0]<=0||p[1]<=0||p[0]>=room.width-1||p[1]>=room.height-1||room.walls.some(w=>same(w,p));
 if(blocked(to))return {...state,message:'Dinding menghalangi. Cari ruang berdiri untuk mendorong.'};
 const crate=same(to,state.old)?'old':same(to,state.fresh)?'fresh':null;
 if(crate){const beyond=[to[0]+delta[0],to[1]+delta[1]],other=crate==='old'?state.fresh:state.old;if(blocked(beyond)||same(beyond,other))return {...state,message:'Tidak bisa mendorong ke dinding atau peti lain.'};if(crate==='fresh'&&same(beyond,room.rack)&&!same(state.old,room.store))return {...state,message:'Simpan O di S dahulu sebelum N masuk rak R.'};next[crate]=beyond;}
 next.player=to;next.moves++;next.won=same(next.old,room.store)&&same(next.fresh,room.rack);next.lost=!next.won&&next.moves>=room.budget;next.message=next.won?'Unit lama tersimpan dan unit pengganti mencapai rak.':next.lost?'Langkah habis; ulangi level.':crate?'Peti didorong. Periksa ruang untuk dorongan selanjutnya.':'Teknisi berpindah.';return next;
}
