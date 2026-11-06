// All equipment profiles and prices are fictional teaching data, not purchasing advice.
export const equipmentProfiles=[
  {id:'A',ports:24,poe:0,cost:1200000,label:'Switch A'},
  {id:'B',ports:48,poe:60,cost:2800000,label:'Switch B'},
  {id:'C',ports:48,poe:120,cost:3600000,label:'Switch C'},
  {id:'D',ports:24,poe:180,cost:3000000,label:'Switch D'}
];
export function analyzeRequirements(v){
  const present=v.pcs+v.printers+v.aps+v.cameras+v.uplinks;
  const spare=Math.ceil(present*v.growth/100),ports=present+spare;
  const poe=(v.aps*v.apWatts+v.cameras*v.cameraWatts)*(1+v.growth/100);
  const traffic=(v.pcs*v.pcMbps+v.wifiClients*v.wifiMbps)*v.concurrent/100;
  const wan=traffic*(1+v.wanReserve/100);
  return {present,spare,ports,poe,traffic,wan};
}
export function compareEquipment(profile,need,budget){
  return {ports:profile.ports>=need.ports,poe:profile.poe>=need.poe,budget:profile.cost<=budget,
    passes:profile.ports>=need.ports&&profile.poe>=need.poe&&profile.cost<=budget};
}
export const procurementContracts=[
  {name:'Lab dan kamera',ports:39,poe:74.4,budget:4000000},
  {name:'Ruang layanan PoE',ports:20,poe:96,budget:3200000},
  {name:'Perluasan kapasitas jaringan',ports:70,poe:144,budget:6000000}
];
export function evaluateCart(cart,contract){
  const total=cart.reduce((sum,id)=>{const p=equipmentProfiles.find(item=>item.id===id);if(!p)throw Error('Profil tidak dikenal');return {ports:sum.ports+p.ports,poe:sum.poe+p.poe,cost:sum.cost+p.cost};},{ports:0,poe:0,cost:0});
  // Each inter-switch link consumes one port at either end; tree with n switches has n-1 links.
  const interSwitchPorts=Math.max(0,cart.length-1)*2;
  const available={...total,ports:total.ports-interSwitchPorts};
  return {totalPorts:total.ports,totalPoe:total.poe,cost:total.cost,usablePorts:available.ports,interSwitchPorts,...compareEquipment(available,contract,contract.budget)};
}
