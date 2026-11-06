import { parseIPv4, subnetInfo } from './ipv4-core.js';
export const DEFAULTS = Object.freeze({
  pcA:{ip:'192.168.10.10',prefix:24,gateway:'192.168.10.1',up:true},
  pcB:{ip:'192.168.20.20',prefix:24,gateway:'192.168.20.1',up:true},
  routerA:{ip:'192.168.10.1',prefix:24,up:true},
  routerB:{ip:'192.168.20.1',prefix:24,up:true},
  cables:{pcA:true,pcB:true,routerA:true,routerB:true}
});
export function initialNetwork(){return structuredClone(DEFAULTS)}
export function validHost(ip,prefix){
  if(parseIPv4(ip)===null||!Number.isInteger(prefix)||prefix<0||prefix>32)return false;
  const x=subnetInfo(ip,prefix);
  if(prefix<=30 && (ip===x.network || ip===x.broadcast))return false;
  return true;
}
export function sameSubnet(a,b,prefix){
  if(parseIPv4(a)===null||parseIPv4(b)===null||!Number.isInteger(prefix)||prefix<0||prefix>32)return false;
  return subnetInfo(a,prefix).network===subnetInfo(b,prefix).network;
}
export function checkNetwork(s){
  const problems=[];
  for(const key of ['pcA','pcB','routerA','routerB']){
    const n=s[key];
    if(!validHost(n.ip,n.prefix))problems.push(`${key}: IP/prefix tidak valid atau alamat network/broadcast.`);
    if(!n.up)problems.push(`${key}: interface nonaktif.`);
    if(!s.cables[key])problems.push(`${key}: kabel terputus.`);
  }
  if(!problems.length){
    for(const [pc,r] of [['pcA','routerA'],['pcB','routerB']]){
      if(!sameSubnet(s[pc].ip,s[r].ip,s[pc].prefix)||!sameSubnet(s[pc].ip,s[r].ip,s[r].prefix))problems.push(`${pc}: subnet tidak sesuai interface router.`);
      if(s[pc].gateway!==s[r].ip)problems.push(`${pc}: default gateway salah.`);
    }
    const addresses=['pcA','pcB','routerA','routerB'].map(k=>s[k].ip);
    if(new Set(addresses).size!==addresses.length)problems.push('Terdapat IP conflict (alamat duplikat).');
    if(sameSubnet(s.routerA.ip,s.routerB.ip,s.routerA.prefix)||sameSubnet(s.routerA.ip,s.routerB.ip,s.routerB.prefix))problems.push('Kedua interface router tidak berada pada subnet terpisah.');
  }
  return problems;
}
export function simulatePing(s,source,target){
  if(!['pcA','pcB'].includes(source))return {ok:false,reason:'Sumber tidak dikenal.'};
  const src=s[source],dst=s[target];
  if(!dst||parseIPv4(src.ip)===null||parseIPv4(dst.ip)===null)return {ok:false,reason:'Alamat IP tidak valid.'};
  if(!src.up||!s.cables[source])return {ok:false,reason:'Interface atau kabel PC sumber bermasalah.'};
  if(!dst.up||!s.cables[target])return {ok:false,reason:'Interface atau kabel tujuan bermasalah.'};
  if(source===target)return {ok:true,reason:'Loopback konfigurasi host sendiri (simulasi lokal).'};
  const localRouter=source==='pcA'?'routerA':'routerB';
  const remoteRouter=target==='pcA'?'routerA':'routerB';
  if(!validHost(src.ip,src.prefix)||!validHost(dst.ip,dst.prefix))return {ok:false,reason:'Konfigurasi alamat host tidak valid.'};
  if(src.ip===dst.ip)return {ok:false,reason:'IP conflict.'};
  if(sameSubnet(src.ip,dst.ip,src.prefix)){
    if(!sameSubnet(src.ip,dst.ip,dst.prefix))return {ok:false,reason:'Subnet mask sumber/tujuan tidak konsisten.'};
    if(source!==target && (source==='pcA'&&target==='pcB'||source==='pcB'&&target==='pcA'))return {ok:false,reason:'Kedua PC berada di segmen switch terpisah tanpa bridge langsung.'};
    return {ok:true,reason:'Tujuan satu subnet dan link aktif.'};
  }
  for(const key of [localRouter,remoteRouter]){
    if(!s[key].up||!s.cables[key]||!validHost(s[key].ip,s[key].prefix))return {ok:false,reason:`Interface router ${key} tidak tersedia.`};
  }
  if(src.gateway!==s[localRouter].ip)return {ok:false,reason:'Default gateway sumber salah.'};
  if(!sameSubnet(src.ip,s[localRouter].ip,src.prefix)||!sameSubnet(src.ip,s[localRouter].ip,s[localRouter].prefix))return {ok:false,reason:'Sumber dan gateway tidak berada dalam subnet yang sama.'};
  if(!sameSubnet(dst.ip,s[remoteRouter].ip,dst.prefix)||!sameSubnet(dst.ip,s[remoteRouter].ip,s[remoteRouter].prefix))return {ok:false,reason:'Tujuan tidak berada dalam subnet interface router.'};
  if(dst.gateway!==s[remoteRouter].ip)return {ok:false,reason:'Default gateway tujuan salah sehingga jalur balik gagal.'};
  if(sameSubnet(s.routerA.ip,s.routerB.ip,s.routerA.prefix)||sameSubnet(s.routerA.ip,s.routerB.ip,s.routerB.prefix))return {ok:false,reason:'Kedua interface router berada dalam subnet yang saling tumpang tindih.'};
  const ips=[s.pcA.ip,s.pcB.ip,s.routerA.ip,s.routerB.ip];
  if(new Set(ips).size!==ips.length)return {ok:false,reason:'IP conflict terdeteksi.'};
  return {ok:true,reason:'Paket melewati router dan balasan kembali. (Simulasi model dua subnet)'};
}
export function gradeNetwork(s){
  const checks=[
    ['PC-A: 192.168.10.10/24',s.pcA.ip==='192.168.10.10'&&s.pcA.prefix===24],
    ['PC-B: 192.168.20.20/24',s.pcB.ip==='192.168.20.20'&&s.pcB.prefix===24],
    ['Router LAN-A: 192.168.10.1/24',s.routerA.ip==='192.168.10.1'&&s.routerA.prefix===24],
    ['Router LAN-B: 192.168.20.1/24',s.routerB.ip==='192.168.20.1'&&s.routerB.prefix===24],
    ['Gateway kedua PC sesuai',s.pcA.gateway===s.routerA.ip&&s.pcB.gateway===s.routerB.ip],
    ['Seluruh interface dan kabel aktif', ['pcA','pcB','routerA','routerB'].every(k=>s[k].up&&s.cables[k])],
    ['Ping PC-A ke PC-B berhasil',simulatePing(s,'pcA','pcB').ok],
    ['Ping PC-B ke PC-A berhasil',simulatePing(s,'pcB','pcA').ok],
  ];
  return {score:checks.filter(x=>x[1]).length*12.5,checks};
}
