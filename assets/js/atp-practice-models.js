export function newATPPractice(type){
 const configs={
  telecom:{mode:'cell',position:20,handover:true,cellB:true,congested:false,extraLoss:2,blocked:false,gateway:true,queueMs:0},
  handoff:{slack:10,vertical:6,mapVersion:2,htsVersion:1,portsMatch:true,approved:false},
  ruijie:{channelA:1,channelB:1,width:20,power:'medium',vlan:20,uplinkVlan:20,authorized:true,managementBlocked:true},
  bird:{sameArea:true,advertised:true,kernel:false,filter:true,forwardA:true,forwardB:true,firewall:true,returnPath:true},
  radius:{registered:true,secret:true,credential:true,attribute:true,nasMapping:false,freshSession:true,policy:4,previousPolicy:8,capacity:10,offered:12,accounting:true},
  smartolt:{scenario:'normal',age:0,receiverMin:-27,receiverMax:-8}
 };
 if(!configs[type])throw Error('Unknown ATP practice '+type);
 return {version:1,type,config:structuredClone(configs[type]),active:null,saved:null,history:[]};
}
const result=(ok,steps,detail)=>({ok,steps,detail});
export function evaluateATP(type,c){
 if(type==='telecom'){
  if(c.mode==='cell'){
   const cell=c.handover&&c.position>50?'B':'A',within=cell==='A'?c.position<=65:c.position>=35;
   const radio=within&&(cell!=='B'||c.cellB),capacity=radio&&!c.congested;
   return result(capacity,[`Posisi ${c.position} · sel ${cell}`,radio?'Akses radio model tersedia':'Akses radio/sel tujuan tidak tersedia',radio&&c.congested?'Beban sel melampaui kapasitas skenario; layanan target belum terpenuhi':'Kebutuhan layanan model terpenuhi bila akses tersedia'],{cell,radio,capacity,boundary:'Jarak dan titik handover adalah aturan skenario, bukan model RF/standar handover.'});
  }
  if(c.mode==='microwave'){
   const rx=10+15+15-100-c.extraLoss,margin=rx-(-75),ok=margin>=0&&!c.blocked;
   return result(ok,[`Daya terima = ${rx} dBm; sensitivitas −75 dBm; margin ${margin} dB`,c.blocked?'Lintasan belum disetujui/terhalang: jangan mengesahkan dari margin saja':'Lintasan model dinyatakan tersedia',ok?'Memenuhi ambang model; verifikasi lapangan tetap perlu':'Belum memenuhi kriteria model'],{rx,margin,boundary:'Tidak menghitung Fresnel, cuaca, availability atau izin frekuensi nyata.'});
  }
  const oneWay=72000/300000*1000+c.queueMs,ok=!c.blocked&&c.gateway;
  return result(ok,[c.blocked?'Terminal terhalang: akses gagal':'Terminal memiliki jalur model',c.gateway?'Gateway aktif':'Gateway mati: beberapa terminal dapat terdampak bersama',`Delay satu arah ${oneWay} ms; RTT simetris ${2*oneWay} ms bila jalur tersedia`],{oneWay,rtt:2*oneWay,boundary:'Panjang lintasan contoh; antrean input satu arah. Jitter, TCP dan orbit dinamis tidak dihitung.'});
 }
 if(type==='handoff'){
  const route=30+40+20,total=Math.round((route*(1+c.slack/100)+c.vertical)*100)/100,ok=c.mapVersion===c.htsVersion&&c.portsMatch&&c.approved;
  return result(ok,[`Panjang peta ${route} m + cadangan ${c.slack}% + vertikal/terminasi ${c.vertical} m = ${total} m`,`Revisi peta ${c.mapVersion}; lembar HTS ${c.htsVersion}`,!c.portsMatch?'Konflik ID port/core belum selesai': 'ID link/port/core cocok',ok?'Lembar siap ditinjau/diserahkan sesuai kontrak latihan':'Tahan penyerahan: selesaikan revisi, port dan persetujuan'],{route,total,handoff:{format:'kontrak-latihan-netral-v1',htsDefinition:'diisi guru sesuai dokumen sekolah',linkId:'L-01',from:'ODP-LAB-01:core1',to:'ONT-LAB-01:port1',mapRevision:c.mapVersion,targetRevision:c.htsVersion,routeM:route,totalM:total,approved:c.approved,portsMatch:c.portsMatch},boundary:'Bukan integrasi atau format resmi HTS. Peta belum membuktikan survey/izin/anggaran optik.'});
 }
 if(type==='ruijie'){
  const vlan=c.vlan===c.uplinkVlan,radio=c.channelA!==c.channelB&&c.width===20;
  const access=c.authorized&&vlan,ok=access&&radio&&c.managementBlocked;
  return result(ok,[`Kanal ${c.channelA}/${c.channelB}, lebar ${c.width} MHz: ${radio?'pemisahan sesuai skenario':'kontensi/overlap skenario perlu ditinjau'}`,`Daya ${c.power}: tidak membuktikan uplink/throughput lebih baik`,c.authorized?'Autentikasi model berhasil':'Akses klien ditolak sesuai identitas',vlan?'VLAN SSID/uplink cocok':'VLAN SSID dan uplink tidak cocok',c.managementBlocked?'Tamu ditolak mengakses manajemen':'Manajemen terbuka ke tamu: kriteria gagal'],{access,radio,vlan,boundary:'Skema dua AP 2,4 GHz; tidak menghitung RF, regulatory domain, roaming atau menjalankan firmware Ruijie.'});
 }
 if(type==='bird'){
  const neighbor=c.sameArea,daemon=neighbor&&c.advertised,kernel=daemon&&c.kernel&&c.filter,forward=kernel&&c.forwardA&&c.forwardB&&c.firewall,ok=forward&&c.returnPath;
  return result(ok,[neighbor?'Neighbor: Full model':'Neighbor: Down — periksa area/transit',daemon?'BIRD: prefix 192.168.20.0/24 tersedia':'BIRD: prefix remote belum tersedia',kernel?'Kernel FIB: route remote tersedia':'Kernel FIB: route remote belum diekspor/diterima filter',forward?'Forwarding kedua router dan firewall lab tersedia':'Forwarding/rute kernel/kebijakan belum memenuhi',ok?'PC-A ↔ server: transaksi model berhasil':'PC-A ↔ server: belum berhasil; periksa juga jalur balik'],{neighbor,daemon,kernel,forward,boundary:'State model BIRD 2.x; bukan parser konfigurasi, daemon, kernel atau paket nyata.'});
 }
 if(type==='radius'){
  const validResponse=c.registered&&c.secret,accept=validResponse&&c.credential;
  const policyApplied=accept&&c.attribute&&c.nasMapping,effectiveLimit=policyApplied?(c.freshSession?c.policy:c.previousPolicy):null;
  const throughput=accept?Math.min(c.offered,c.capacity,effectiveLimit??Infinity):0;
  const ok=accept&&policyApplied&&c.freshSession;
  return result(ok,[!validResponse?'Tidak ada balasan yang valid: periksa client/NAS dan secret':accept?'RADIUS: Access-Accept':'RADIUS: Access-Reject',accept?(c.attribute?`Atribut profil ${c.policy}M/${c.policy}M dikirim`:'Balasan tanpa atribut rate-limit'):'Belum ada sesi diterima',policyApplied?`Sesi efektif ${effectiveLimit} Mbit/s${!c.freshSession?' — masih profil sesi lama':''}`:'NAS belum menerapkan profil',`Offered ${c.offered}, uplink ${c.capacity}, hasil model ${throughput} Mbit/s`,c.accounting&&accept?'Accounting sesi model tersedia':'Accounting belum tersedia'],{validResponse,accept,policyApplied,effectiveLimit,throughput,boundary:'Model satu sesi simetris tanpa burst/overhead. Bukan pengukuran bandwidth atau server RADIUS nyata.'});
 }
 if(type==='smartolt'){
  const rows=['A','B','C'].map(name=>({olt:'OLT-01',pon:'PON-1',onu:'ONU-'+name,observedAgeSeconds:c.age,online:true,rxDbm:-19,event:'online'}));
  if(c.scenario==='power')Object.assign(rows[0],{online:false,rxDbm:null,event:'dying-gasp'});
  if(c.scenario==='los')Object.assign(rows[0],{online:false,rxDbm:null,event:'LOS'});
  if(c.scenario==='pon')rows.forEach(r=>Object.assign(r,{online:false,rxDbm:null,event:'LOS'}));
  if(c.scenario==='weak')rows[0].rxDbm=-29;
  const stale=c.age>60,offline=rows.filter(r=>!r.online).length,low=rows.filter(r=>r.rxDbm!==null&&(r.rxDbm<c.receiverMin||r.rxDbm>c.receiverMax)).length;
  const ok=!stale&&!offline&&!low;
  return result(ok,[stale?'Data basi: pembacaan baru diperlukan sebelum keputusan':'Dataset segar dalam ambang skenario 60 detik',`${offline} dari 3 ONU offline pada PON-1`,offline===3?'Dugaan komponen bersama; belum bukti lokasi putus':offline===1?'Gangguan tunggal; bandingkan event dan sumber daya ONU':'Baca nilai daya dan layanan pelanggan',low?'Ada daya di luar rentang receiver contoh':'Pembacaan daya tersedia berada dalam rentang contoh; null tidak dinilai 0'],{rows,stale,offline,low,boundary:'Dataset ternormalisasi sintetis, bukan payload API/kueri SmartOLT. Diagnosis adalah hipotesis; perlu verifikasi baru.'});
 }
 throw Error('Unknown evaluator '+type);
}
export function atpPracticeAction(input,action){
 const s=structuredClone(input);let output;
 if(action==='apply'){s.active=structuredClone(s.config);output={ok:true,steps:['Konfigurasi diterapkan pada model, belum disimpan untuk boot.'],detail:{}};}
 else if(action==='save'){if(!s.active)output={ok:false,steps:['Apply konfigurasi terlebih dahulu.'],detail:{}};else{s.saved=structuredClone(s.active);output={ok:true,steps:['Konfigurasi aktif disimpan ke boot model.'],detail:{}};}}
 else if(action==='restart'){s.active=s.saved?structuredClone(s.saved):null;output={ok:Boolean(s.active),steps:[s.active?'Konfigurasi tersimpan dimuat. Jalankan Uji ulang.':'Belum ada konfigurasi boot tersimpan; Apply lalu Save.'],detail:{}};}
 else{output=evaluateATP(s.type,s.type==='ruijie'?(s.active||s.config):s.config);if(s.type==='ruijie'&&!s.active)output={ok:false,steps:['Apply konfigurasi sebelum menguji keadaan AP aktif.'],detail:{}};}
 s.history.push({action,draft:structuredClone(s.config),applied:s.type==='ruijie'?structuredClone(s.active):structuredClone(s.config),result:output});s.history=s.history.slice(-8);return {state:s,result:output};
}
