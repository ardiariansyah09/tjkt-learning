import { ipv4Block,allocateVLSM,validateSubnetRows,allocateIPv6,addressGameLevels,placeAddressTile } from '../assets/js/address-plan-model.js';
const assert=(v,message)=>{if(!v)throw Error(message);};
export function checkAddressModels(){
  const base=allocateVLSM('10.10.0.0/24',[{name:'Lab',hosts:61},{name:'Staf',hosts:25},{name:'Kamera',hosts:13},{name:'Server',hosts:7}]);
  assert(base.rows.map(r=>r.cidr).join()==='10.10.0.0/26,10.10.0.64/27,10.10.0.96/28,10.10.0.112/28'&&base.unallocated===128,'VLSM allocation');
  assert(ipv4Block('10.10.0.64/27').broadcast==='10.10.0.95'&&ipv4Block('10.10.0.0/26').mask==='255.255.255.192','CIDR bounds and mask');
  const bad=validateSubnetRows('10.10.0.0/24',[{name:'A',cidr:'10.10.0.0/26',hosts:61,gateway:'10.10.0.0'},{name:'B',cidr:'10.10.0.32/27',hosts:40,gateway:'10.10.0.33'}]);assert(!bad.valid&&bad.issues.length===3,'Gateway, capacity, overlap');
  const outside=validateSubnetRows('10.10.0.0/24',[{name:'A',cidr:'10.10.1.0/24',gateway:'10.10.1.1'}]);assert(!outside.valid,'Subnet outside parent');
  assert(!validateSubnetRows('10.10.0.0/24',[{name:'A',cidr:'10.10.0.0/26',gateway:''}]).valid,'Blank gateway must not count as valid');
  for(const value of ['10.10.0.1/24','10.10.0.0/31','256.0.0.0/24','010.0.0.0/8']){let rejected=false;try{ipv4Block(value);}catch{rejected=true;}assert(rejected,`Invalid CIDR ${value}`);}
  let small=false;try{allocateVLSM('10.10.0.0/26',[{name:'A',hosts:61},{name:'B',hosts:25}]);}catch{small=true;}assert(small,'Insufficient parent');
  const v6=allocateIPv6('2001:db8:1200::/48',4);assert(v6.available==='65536'&&v6.subnets[3]==='2001:db8:1200:3::/64','IPv6 /64 allocation');
  assert(allocateIPv6('2001:db8:1200:ab00::/56',256).subnets[255]==='2001:db8:1200:abff::/64','IPv6 /56 boundaries');
  let tooSmall=false;try{allocateIPv6('2001:db8:1200::/64',4);}catch{tooSmall=true;}assert(tooSmall,'Insufficient IPv6 /64');
  const solutions=[{Lab:0,Admin:4,Server:6},{Siswa:0,Guru:8,IoT:12,Kelola:14},{'Lab-baru':8,Staf:4,Layanan:6}];
  solutions.forEach((solution,i)=>{let placed={};Object.entries(solution).forEach(([id,start])=>{placed=placeAddressTile(addressGameLevels[i],placed,id,start);});assert(Object.keys(placed).length===addressGameLevels[i].tokens.length,'Address level solvability');});
  return {vectors:13,levels:3};
}
export function checkAddressGame(game){
  assert(game?.getClientRects().length,'Address game invisible');assert(!game.querySelector('input[type=radio],select'),'Quiz controls inside address game');
  const state=()=>JSON.parse(game.dataset.state),cell=n=>game.querySelector(`[data-address-cell="${n}"]`).click(),pick=id=>game.querySelector(`[data-address-token="${id}"]`).click();
  cell(1);cell(1);cell(1);assert(state().lost,'Three alignment errors cause failure');game.querySelector('[data-address-action=reset]').click();
  cell(0);pick('Admin');cell(0);assert(state().mistakes===1&&state().placements.Admin===undefined,'Overlap rejection');cell(4);game.querySelector('[data-address-action=remove]').click();assert(state().placements.Admin===undefined,'Remove block');
  const solutions=[{Lab:0,Admin:4,Server:6},{Siswa:0,Guru:8,IoT:12,Kelola:14},{'Lab-baru':8,Staf:4,Layanan:6}];
  solutions.forEach(solution=>{Object.entries(solution).forEach(([id,start])=>{pick(id);cell(start);});game.querySelector('[data-address-action=submit]').click();});
  assert(state().completed,'Three allocation levels incomplete');const saved=JSON.parse(localStorage.getItem('tjkt:perencanaan-pengalamatan-lanjut:course:v2'));assert(saved.passed.game===100,'Address game progress not saved');
  return {levels:3,score:100,alignment:true,overlap:true,inventory:true,failure:true,noQuestions:true};
}
