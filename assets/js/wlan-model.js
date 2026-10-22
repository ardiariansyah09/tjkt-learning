export const wlanSites={
  west:{label:'Barat',x:3,rssi:[-48,-64,-82]},center:{label:'Tengah',x:12,rssi:[-65,-50,-65]},east:{label:'Timur',x:21,rssi:[-82,-64,-48]}
};
export function analyzeWLAN(v){
  if(![v.powerA,v.powerB,v.noise,v.wallLoss,v.threshold,v.snr,v.capacity,v.rate,v.concurrent,...v.clients].every(Number.isFinite))throw Error('Parameter radio dan beban harus berupa angka.');
  if(!wlanSites[v.siteA]||!wlanSites[v.siteB]||![1,6,11].includes(v.channelA)||![1,6,11].includes(v.channelB))throw Error('Pilih posisi dan kanal model yang tersedia.');
  if(v.capacity<=0||v.rate<0||v.concurrent<0||v.concurrent>100||v.wallLoss<0||v.clients.length!==3||v.clients.some(n=>!Number.isInteger(n)||n<0))throw Error('Periksa kapasitas, konkuren, dan jumlah klien.');
  const aps=[{id:'AP-A',site:v.siteA,power:v.powerA,channel:v.channelA},{id:'AP-B',site:v.siteB,power:v.powerB,channel:v.channelB}];
  const zones=[3,12,21].map((x,i)=>{
    const readings=aps.map(ap=>{const site=wlanSites[ap.site],crossings=[8,16].filter(w=>Math.min(x,site.x)<w&&Math.max(x,site.x)>w).length;return site.rssi[i]+ap.power-14-(v.walls?crossings*v.wallLoss:0);});
    const best=readings[1]>readings[0]?1:0,rssi=readings[best],snr=rssi-v.noise;
    return {name:['Barat','Tengah','Timur'][i],readings,ap:aps[best].id,rssi,snr,passes:rssi>=v.threshold&&snr>=v.snr,clients:v.clients[i],demand:v.clients[i]*v.rate*v.concurrent/100};
  });
  const shared=v.neighbors&&v.channelA===v.channelB;
  const domains=shared?[{name:`Kanal ${v.channelA} bersama`,demand:zones.reduce((n,z)=>n+z.demand,0)}]:aps.map(ap=>({name:`${ap.id} · kanal ${ap.channel}`,demand:zones.filter(z=>z.ap===ap.id).reduce((n,z)=>n+z.demand,0)}));
  domains.forEach(d=>{d.utilization=d.demand/v.capacity*100;d.over=d.demand>v.capacity;});
  return {aps,zones,shared,domains,criteriaMet:zones.every(z=>z.passes),loadFits:domains.every(d=>!d.over)};
}
export const channelLevels=[
  {name:'Tiga AP saling mendengar',nodes:['A','B','C'],edges:[[0,1],[1,2],[0,2]],initial:[1,1,1],fixed:{}},
  {name:'Ruang dan koridor',nodes:['A','B','C','D'],edges:[[0,1],[1,2],[0,2],[2,3]],initial:[1,1,1,1],fixed:{}},
  {name:'AP tetangga sudah ditetapkan',nodes:['A','B','C','D','E'],edges:[[0,1],[0,2],[1,2],[1,3],[2,4],[3,4]],initial:[6,6,6,6,6],fixed:{0:6}}
];
export function channelConflicts(level,channels){return level.edges.filter(([a,b])=>channels[a]===channels[b]);}
