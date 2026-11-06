// Small deterministic teaching network; no OS commands or packets are executed.
export const basicPlan = {ip:'192.168.10.10',prefix:24,gateway:'192.168.10.1',dns:'192.168.20.20'};
export function newBasicPractice(){return {config:{ip:'192.168.10.10',prefix:24,gateway:'192.168.10.1',dns:'192.168.20.99'},cable:false,vm:false,mode:'nat',revision:0,saved:null,evidence:null,baseline:false,failure:false,recovered:false,bootVerified:false,incident:null,logs:[]};}
const clone = value => JSON.parse(JSON.stringify(value));
function address(value){if(!/^\d{1,3}(\.\d{1,3}){3}$/.test(value))return null;const p=value.split('.').map(Number);return p.every(n=>n<=255)?p.reduce((v,n)=>v*256+n,0):null;}
const subnet=(a,p)=>Math.floor(a/2**(32-p));
export function basicProbe(s,target){
  const ip=address(s.config.ip),prefix=Number(s.config.prefix),dst=address(target);
  if(dst===null)return {ok:false,observed:false,text:'Tujuan tidak valid.'};
  if(!['192.168.10.1','192.168.20.20'].includes(target))return {ok:false,observed:false,text:'Target di luar dataset lab. Tidak ada paket yang dikirim.'};
  if(ip===null||!Number.isInteger(prefix)||prefix<16||prefix>30)return {ok:false,text:'Konfigurasi alamat/prefix PC tidak valid; periksa ip addr.'};
  const last=ip%2**(32-prefix);
  if(last===0||last===2**(32-prefix)-1||s.config.ip==='192.168.10.1')return {ok:false,text:'IP PC memakai network, broadcast, atau alamat gateway yang sudah dipakai.'};
  if(!s.cable)return {ok:false,text:'Link PC–switch DOWN. Periksa kabel pada denah sebelum mengubah DNS.'};
  if(Math.floor(ip/256)!==Math.floor(address('192.168.10.1')/256))return {ok:false,text:'PC berada di luar segmen LAN-A 192.168.10.0/24 pada denah.'};
  if(target==='192.168.10.1')return {ok:true,text:'Balasan gateway LAN-A diterima (model); ini belum membuktikan server atau DNS sehat.'};
  if(subnet(ip,prefix)===subnet(dst,prefix))return {ok:false,text:'PC menganggap server berada pada link lokal. ARP model tidak menemukan server di LAN-A; periksa prefix, bukan DNS.'};
  if(s.config.gateway!=='192.168.10.1')return {ok:false,text:'Next-hop/default gateway tidak sesuai router LAN-A. Periksa ip route.'};
  if(!s.vm)return {ok:false,text:'Gateway terjangkau, tetapi VM server mati. Periksa daya VM.'};
  if(s.mode!=='internal')return {ok:false,text:'NIC VM berada pada jaringan NAT terpisah; tidak terhubung ke LAN-B pada denah. Pilih Jaringan Internal LAN-B.'};
  return {ok:true,text:'Balasan server 192.168.20.20 diterima melalui router dan jalur balik model.'};
}
function resolveName(s){if(s.config.dns!=='192.168.20.20')return {ok:false,text:'Resolver PC tidak menunjuk DNS lab 192.168.20.20. Ping IP dapat berhasil meskipun nama gagal.'};const r=basicProbe(s,'192.168.20.20');return r.ok?{ok:true,text:'DNS model: portal.lab.test → 192.168.20.20.'}:r;}
export function basicAcceptance(s){const checks=[['Alamat sesuai rencana',Object.entries(basicPlan).every(([k,v])=>String(s.config[k])===String(v))],['Gateway lokal',basicProbe(s,'192.168.10.1').ok],['Jalur ke server',basicProbe(s,'192.168.20.20').ok],['Resolusi nama',resolveName(s).ok],['HTTP portal',resolveName(s).ok&&basicProbe(s,'192.168.20.20').ok]];return {revision:s.revision,ok:checks.every(([,ok])=>ok),checks};}
export function basicAction(state,action,value){
  const s=clone(state);let text='',result=null;
  const changed=()=>{s.revision++;s.evidence=null;s.bootVerified=false;};
  if(action==='configure'){s.config={ip:String(value.ip).trim(),prefix:Number(value.prefix),gateway:String(value.gateway).trim(),dns:String(value.dns).trim()};changed();text='Draft diterapkan ke PC model. Hasil uji lama tidak lagi menjadi bukti keadaan sekarang; jalankan uji baru.';}
  else if(action==='cable'){s.cable=!s.cable;changed();text=s.cable?'Kabel PC–switch tersambung.':'Kabel PC–switch dilepas.';}
  else if(action==='vm'){s.vm=!s.vm;changed();text=s.vm?'VM dinyalakan. Periksa mode NIC sebelum menyimpulkan jalur siap.':'VM dimatikan.';}
  else if(action==='mode'){s.mode=value==='internal'?'internal':'nat';changed();text='Mode NIC VM berubah; lakukan uji ulang.';}
  else if(action==='save'){if(!s.evidence?.ok||s.evidence.revision!==s.revision||!basicAcceptance(s).ok)text='Belum disimpan: jalankan Uji penerimaan pada versi sekarang dan pastikan semua kriteria sehat dahulu.';else{s.saved=clone(s.config);s.baseline=true;text='Konfigurasi PC sehat disimpan sebagai baseline dan konfigurasi boot model. Kabel serta daya VM bukan bagian cadangan konfigurasi PC.';}}
  else if(action==='fault'){
    if(!s.baseline||!basicAcceptance(s).ok)text='Bangun dan simpan baseline sehat sebelum menyisipkan gangguan.';
    else{s.incident=['dns','cable','vm-mode'].includes(value)?value:'dns';s.failure=false;s.recovered=false;
      if(s.incident==='dns')s.config.dns='192.168.20.99';if(s.incident==='cable')s.cable=false;if(s.incident==='vm-mode')s.mode='nat';changed();text='Gangguan '+s.incident+' disisipkan. Ambil bukti gagal dengan perintah pemeriksaan atau uji penerimaan, lalu perbaiki penyebabnya.';}
  }
  else if(action==='restore'){if(!s.saved)text='Belum ada baseline tersimpan.';else{s.config=clone(s.saved);changed();text='Konfigurasi PC dipulihkan. Tindakan ini tidak menyambungkan kabel atau mengubah mode/daya VM.';}}
  else if(action==='reboot'){if(!s.saved)text='Simpan konfigurasi sehat dahulu; belum ada konfigurasi boot model.';else{s.config=clone(s.saved);changed();const r=basicAcceptance(s);s.evidence=r;s.bootVerified=r.ok&&s.recovered;text=r.ok?'PC model selesai restart dengan konfigurasi tersimpan; layanan diuji ulang.':'PC model selesai restart, tetapi layanan masih gagal. Periksa lingkungan jaringan/VM.';}}
  else if(action==='test'){result=basicAcceptance(s);s.evidence=result;if(!result.ok&&s.incident)s.failure=true;if(result.ok&&s.failure)s.recovered=true;text=result.ok?'Seluruh kriteria penerimaan lulus untuk versi '+s.revision+'.':'Belum lulus: '+result.checks.filter(([,ok])=>!ok).map(([label])=>label).join(', ')+'.';}
  else if(action==='command'){
    const cmd=String(value).trim().replace(/\s+/g,' ');
    if(cmd==='help')text='Perintah model: pwd, ls, cat rencana.txt, ip addr, ip route, ping 192.168.10.1, ping 192.168.20.20, nslookup portal.lab.test, curl http://portal.lab.test. Tidak ada shell/Internet nyata.';
    else if(cmd==='pwd')text='/lab';
    else if(cmd==='ls')text='rencana.txt\nhasil-uji (catatan tersedia pada panel laporan)';
    else if(cmd==='cat rencana.txt')text='PC: 192.168.10.10/24; gateway 192.168.10.1; DNS 192.168.20.20. Router model sudah mempunyai LAN-A .10.1/24, LAN-B .20.1/24 dan rute balik. VM server .20.20/24, gateway .20.1, DNS+HTTP aktif saat VM menyala dan terhubung LAN-B. Tidak ada uplink Internet.';
    else if(cmd==='ip addr')text=`PC eth0: ${s.config.ip}/${s.config.prefix}; link ${s.cable?'UP':'DOWN'} (model).`;
    else if(cmd==='ip route')text=`Jaringan on-link mengikuti ${s.config.ip}/${s.config.prefix}; default via ${s.config.gateway}.`;
    else if(cmd.startsWith('ping '))result=basicProbe(s,cmd.slice(5));
    else if(cmd==='nslookup portal.lab.test')result=resolveName(s);
    else if(cmd==='curl http://portal.lab.test'){result=resolveName(s);if(result.ok)result={ok:true,text:'HTTP/1.1 200 OK — Portal lab tersedia (respons dataset, bukan server nyata).'};}
    else text='Perintah tidak didukung oleh model. Ketik help; teks tidak pernah dieksekusi sebagai kode.';
    if(result){text=result.text;if(!result.ok&&result.observed!==false&&s.incident)s.failure=true;}
    text='$ '+cmd+'\n'+text;
  }
  s.logs.push({revision:s.revision,action,text});s.logs=s.logs.slice(-30);return s;
}
