export const conductors=[
  {id:'wo',name:'Putih–oranye',pair:'orange',color:'#ea580c',striped:true},{id:'o',name:'Oranye',pair:'orange',color:'#ea580c'},
  {id:'wg',name:'Putih–hijau',pair:'green',color:'#15803d',striped:true},{id:'g',name:'Hijau',pair:'green',color:'#15803d'},
  {id:'wb',name:'Putih–biru',pair:'blue',color:'#2563eb',striped:true},{id:'b',name:'Biru',pair:'blue',color:'#2563eb'},
  {id:'wbr',name:'Putih–cokelat',pair:'brown',color:'#92400e',striped:true},{id:'br',name:'Cokelat',pair:'brown',color:'#92400e'}
];
export const wiringCodes={A:['wg','g','wo','b','wb','o','wbr','br'],B:['wo','o','wg','b','wb','g','wbr','br']};
export function wiringCode(wires){return Object.entries(wiringCodes).find(([,values])=>values.every((v,i)=>v===wires[i]))?.[0]||null;}
export function checkWiremap(a,b,{fault='none'}={}){
  if(a.length!==8||b.length!==8)throw Error('Model memakai delapan pin di setiap ujung.');
  if(!['none','open','short'].includes(fault))throw Error('Skenario gangguan tidak dikenal.');
  const validIds=new Set(conductors.map(w=>w.id));for(const endpoint of [a,b])if(endpoint.some(id=>id!==null&&!validIds.has(id)))throw Error('Konduktor tidak dikenal.');
  const complete=[a,b].every(endpoint=>endpoint.every(Boolean)&&new Set(endpoint).size===8);
  const map=a.map((id,i)=>!id||(fault==='open'&&i===2)?null:b.indexOf(id)<0?null:b.indexOf(id));
  const splitPair=[a,b].some(endpoint=>[[0,1],[2,5],[3,4],[6,7]].some(([p,q])=>endpoint[p]&&endpoint[q]&&conductors.find(w=>w.id===endpoint[p]).pair!==conductors.find(w=>w.id===endpoint[q]).pair));
  const codeA=wiringCode(a),codeB=wiringCode(b),identity=map.every((pin,i)=>pin===i),short=fault==='short',open=map.some(pin=>pin===null);
  return {map,complete,identity,splitPair,codeA,codeB,short,open,straight:complete&&identity&&!splitPair&&!short&&!open&&codeA!==null&&codeA===codeB};
}
export function cableLengths(permanent,patchA,patchB){
  if([permanent,patchA,patchB].some(n=>!Number.isFinite(n)||n<0))throw Error('Panjang harus angka tidak negatif.');
  return {permanent,channel:permanent+patchA+patchB,permanentWithin:permanent<=90,channelWithin:permanent+patchA+patchB<=100};
}
export function putConductor(wires,pin,id){
  if(!Number.isInteger(pin)||pin<0||pin>7||!conductors.some(w=>w.id===id))throw Error('Pin atau konduktor tidak valid.');
  const copy=wires.map(value=>value===id?null:value);copy[pin]=id;return copy;
}
export const cablingOrders=[
  {name:'Patch cord straight-through T568B',code:'B',fixed:[...wiringCodes.B],initial:Array(8).fill(null)},
  {name:'Patch cord straight-through T568A',code:'A',fixed:[...wiringCodes.A],initial:Array(8).fill(null)},
  {name:'Perbaiki split pair pada T568B',code:'B',fixed:[...wiringCodes.B],initial:['wo','wg','o','b','wb','g','wbr','br']}
];
