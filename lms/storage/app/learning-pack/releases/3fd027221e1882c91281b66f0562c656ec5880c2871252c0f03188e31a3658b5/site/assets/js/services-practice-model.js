import {newServices,servicesAction} from './services-model.js';
const step=(label,action,check)=>({label,action,check});
const healthy=s=>s.config.dhcp&&s.config.relay===s.config.remote&&s.config.resolver==='correct'&&s.config.record==='192.168.10.10'&&s.config.dns&&s.config.ssh&&s.config.firewall&&s.config.key==='trusted'&&s.config.credential&&s.config.authorized;
const acceptance=[step('Renew lease A setelah seluruh konfigurasi diperbaiki','renew',(s,r)=>r.ok&&r.client==='A'&&healthy(s)&&s.leases.A?.resolver==='correct'),step('Query DNS dari A: hasil harus 192.168.10.10','dns',(s,r)=>r.ok&&r.client==='A'&&r.address==='192.168.10.10'&&healthy(s)),step('Uji operasi remote A: identitas, autentikasi dan izin harus lolos','ssh',(s,r)=>r.ok&&r.client==='A'&&healthy(s))];
export const servicesCases={
 relay:{title:'Ruang baru tidak memperoleh alamat',story:'Klien A berada di segmen berbeda dari server DHCP. Broadcast permintaan awal tidak mencapai server. Jangan memperbaiki DNS sebelum klien mendapat alamat.',goal:'Buktikan kebutuhan relay, terapkan perubahan minimum, kemudian buktikan lease, nama dan akses remote.',steps:[step('Pilih A dan Minta lease baru: rekam kegagalan broadcast tanpa relay','lease',(s,r)=>r.client==='A'&&!r.ok&&s.config.remote&&!s.config.relay&&r.message.includes('Broadcast')),step('Ubah hanya Relay tersedia menjadi Ya, lalu Minta lease baru A','lease',(s,r)=>r.ok&&r.client==='A'&&s.config.remote&&s.config.relay),...acceptance]},
 ack:{title:'Server sudah diperbaiki, klien masih salah DNS',story:'A sudah menerima lease dengan DNS .9 yang salah. Mengubah opsi di server saja tidak menulis ulang lease aktif pada klien.',goal:'Bedakan konfigurasi server dengan nilai efektif pada lease klien; perbarui lease dan uji hasil.',steps:[step('Query DNS dari A: rekam kegagalan karena resolver dalam lease salah','dns',(s,r)=>r.client==='A'&&!r.ok&&s.leases.A?.resolver==='wrong'&&s.config.resolver==='wrong'),step('Ubah DNS dalam ACK menjadi .2 benar, lalu Query DNS lagi tanpa renew; buktikan masih gagal','dns',(s,r)=>r.client==='A'&&!r.ok&&s.config.resolver==='correct'&&s.leases.A?.resolver==='wrong'),...acceptance]},
 cache:{title:'Nama lama dan fingerprint belum dipercaya',story:'Record otoritatif menunjuk .10, tetapi cache klien masih .20. Identitas SSH juga belum diverifikasi. Ini dua pemeriksaan berbeda; membersihkan cache tidak membuktikan host aman.',goal:'Telusuri cache, buktikan penolakan host key, lalu cocokkan identitas melalui kanal tepercaya model dan uji ulang.',steps:[step('Query DNS A: catat jawaban cache lama 192.168.10.20','dns',(s,r)=>r.client==='A'&&r.ok&&r.address==='192.168.10.20'&&s.config.record==='192.168.10.10'),step('Uji remote A: buktikan alamat cache salah tidak mencapai server yang dimaksud','ssh',(s,r)=>r.client==='A'&&!r.ok&&r.address==='192.168.10.20'),step('Bersihkan cache klien, lalu Query DNS A sampai alamat menjadi .10','dns',(s,r)=>r.client==='A'&&r.ok&&r.address==='192.168.10.10'),step('Uji remote dengan identitas host Berubah/belum dipercaya; catat penolakan sebelum login','ssh',(s,r)=>r.client==='A'&&!r.ok&&s.config.key==='changed'&&r.message.includes('Host key')),...acceptance]}
};
export function servicesCaseState(id){let s=newServices();if(id==='relay'){s.config.remote=true;s.config.relay=false;}else if(id==='ack'){s.config.resolver='wrong';s=servicesAction(s,'lease','A').state;}else if(id==='cache'){s=servicesAction(s,'lease','A').state;s.cache={address:'192.168.10.20',expires:60};s.config.key='changed';}else throw Error('Kasus praktik tidak dikenal');return s;}
export function newServicesRun(id){if(!servicesCases[id])throw Error('Kasus praktik tidak dikenal');return {id,index:0,revision:0,complete:false,proofs:[],events:[],message:'Ikuti langkah pertama. Gunakan kontrol simulator di atas; bukti diambil dari operasi yang benar-benar dijalankan.'};}
export function observeServicesRun(old,state,result,kind){
 const run=structuredClone(old),cfg=servicesCases[run.id],finalStart=cfg.steps.length-3;
 if(kind==='reset'){run.index=0;run.complete=false;run.proofs=[];run.blocked=true;run.message='Lab diulang. Tekan Mulai kasus terpilih untuk memuat kembali kondisi kasus sebelum melanjutkan.';return run;}
 if(run.blocked){run.message='Kasus belum dimuat ulang setelah reset lab. Tekan Mulai kasus terpilih.';return run;}
 if(kind==='change'||kind==='reset'||['tick','release','flush'].includes(result?.action)){
  run.revision++;run.complete=false;
  if(run.index>=finalStart){run.index=finalStart;run.proofs=run.proofs.filter(p=>p.step<finalStart);}
  run.message=kind==='reset'?'Lab diulang. Pilih Mulai kasus agar kondisi awal dan bukti kasus kembali cocok.':'Keadaan berubah. Bukti diagnosis tetap sebagai riwayat; ulangi tiga uji penerimaan setelah perubahan terakhir.';
 }
 if(result){
  const snapshot={revision:run.revision,step:run.index,time:state.time,action:result.action,client:result.client,ok:result.ok,message:result.message,trace:[...result.trace],config:structuredClone(state.config),leases:structuredClone(state.leases),cache:structuredClone(state.cache)};
  run.events.push(snapshot);run.events=run.events.slice(-40);
  const expected=cfg.steps[run.index];
  if(expected&&expected.action===result.action&&expected.check(state,result)){
   run.proofs.push(snapshot);run.index++;run.complete=run.index===cfg.steps.length;
   run.message=run.complete?'Seluruh langkah dan tiga uji penerimaan lulus. Jelaskan bukti serta batas model, lalu simpan/ekspor laporan.':'Bukti langkah '+run.index+' tercatat. Berikutnya: '+cfg.steps[run.index].label;
  }else if(!run.complete)run.message='Belum memenuhi langkah '+(run.index+1)+': '+cfg.steps[run.index].label+'. Hasil operasi tetap tersimpan pada jejak.';
 }
 return run;
}
