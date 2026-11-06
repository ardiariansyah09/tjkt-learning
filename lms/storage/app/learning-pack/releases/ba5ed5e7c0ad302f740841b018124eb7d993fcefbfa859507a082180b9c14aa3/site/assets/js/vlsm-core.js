import { parseIPv4, formatIPv4, subnetInfo } from './ipv4-core.js';
export const CASE = Object.freeze({base:'192.168.10.0',prefix:24,rooms:[{id:'lab',name:'Lab TJKT',hosts:60},{id:'admin',name:'Administrasi',hosts:28},{id:'library',name:'Perpustakaan',hosts:12},{id:'cctv',name:'CCTV',hosts:6}]});
export function requiredPrefix(hosts) {
  if(!Number.isInteger(hosts)||hosts<1||hosts>4294967294)return null;
  for(let p=30;p>=0;p--) if((2**(32-p))-2>=hosts)return p;
  return null;
}
export function planVLSM(base,basePrefix,rooms){
  const parent=subnetInfo(base,basePrefix);
  if(!parent || parent.network!==base)return null;
  const end=parseIPv4(parent.broadcast);
  let cursor=parseIPv4(base);
  const rows=[];
  for(const room of rooms){
    const prefix=requiredPrefix(room.hosts);
    if(prefix===null)return null;
    const size=2**(32-prefix);
    cursor=Math.ceil(cursor/size)*size;
    if(cursor+size-1>end)return null;
    const info=subnetInfo(formatIPv4(cursor),prefix);
    rows.push({...room,prefix,network:info.network,broadcast:info.broadcast,first:info.first,last:info.last,usable:info.usable,size});
    cursor+=size;
  }
  return rows;
}
export function gradeVLSM(answers,rooms=CASE.rooms){
  const sorted=[...rooms].sort((a,b)=>b.hosts-a.hosts);
  const expected=planVLSM(CASE.base,CASE.prefix,sorted);
  let score=0;
  const feedback=[];
  const blocks=[];
  for(const room of rooms){
    const a=answers[room.id]||{};
    const p=Number(a.prefix);
    const info=/^\d{1,2}$/.test(String(a.prefix??''))?subnetInfo(String(a.network||''),p):null;
    const need=requiredPrefix(room.hosts);
    const prefixOK=p===need;
    const networkOK=!!info && info.network===String(a.network).trim() && info.usable>=room.hosts;
    if(prefixOK)score+=10;
    if(networkOK && prefixOK)score+=10;
    feedback.push({id:room.id,name:room.name,prefixOK,networkOK,need,expected:expected?.find(r=>r.id===room.id)});
    if(info)blocks.push({id:room.id,start:parseIPv4(info.network),end:parseIPv4(info.broadcast),aligned:info.network===String(a.network).trim()});
  }
  const parent=subnetInfo(CASE.base,CASE.prefix);
  const pStart=parseIPv4(parent.network),pEnd=parseIPv4(parent.broadcast);
  const valid=blocks.length===rooms.length && blocks.every(b=>b.aligned&&b.start>=pStart&&b.end<=pEnd) && blocks.every((b,i)=>blocks.every((c,j)=>i===j||b.end<c.start||c.end<b.start));
  if(valid)score+=20;
  return {score,valid,feedback,expected};
}
