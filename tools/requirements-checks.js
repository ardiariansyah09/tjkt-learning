import { analyzeRequirements,equipmentProfiles,compareEquipment,evaluateCart,procurementContracts } from '../assets/js/requirements-model.js';
const assert=(value,message)=>{if(!value)throw Error(message);};
export function checkRequirementsModels(){
  const input={pcs:24,printers:1,aps:2,cameras:4,uplinks:1,growth:20,apWatts:15,cameraWatts:8,wifiClients:30,pcMbps:4,wifiMbps:2,concurrent:50,wanReserve:25};
  const base=analyzeRequirements(input);
  assert(base.ports===39&&Math.abs(base.poe-74.4)<1e-9&&base.wan===97.5,'Requirements baseline');
  assert(equipmentProfiles.filter(p=>compareEquipment(p,base,4000000).passes).map(p=>p.id).join()==='C','Candidate filter');
  const cameras=analyzeRequirements({...input,cameras:8});assert(cameras.ports===44&&Math.abs(cameras.poe-112.8)<1e-9,'Camera growth');
  assert(analyzeRequirements({...input,concurrent:100}).wan===195,'Peak concurrency');
  assert(!evaluateCart(['D','A','A'],procurementContracts[2]).passes,'Inter-switch ports cannot be ignored');
  [['C'],['D'],['B','D']].forEach((cart,i)=>assert(evaluateCart(cart,procurementContracts[i]).passes,`Contract ${i+1} solvability`));
  return {vectors:8,contracts:3};
}
export function checkRequirementsGame(game){
  assert(game&&game.getClientRects().length,'Procurement game not visible');
  assert(!game.querySelector('input[type=radio],select'),'Quiz controls inside game');
  const state=()=>JSON.parse(game.dataset.state),take=id=>game.querySelector(`[data-take=${id}]`).click(),send=()=>game.querySelector('[data-procurement=send]').click();
  send();assert(state().lives===2,'Failed shipment did not consume chance');
  send();send();assert(state().lost&&game.querySelector('[data-procurement=send]').disabled,'Failure state');
  game.querySelector('[data-procurement=reset]').click();
  take('A');game.querySelector('[data-remove-item="0"]').click();assert(!state().cart.length,'Unload item');
  take('C');send();assert(state().level===1,'First contract');
  take('D');send();assert(state().level===2,'Second contract');
  take('B');take('D');assert(state().usablePorts===70,'Port use between switches');send();
  assert(state().completed,'Third contract');
  const progress=JSON.parse(localStorage.getItem('tjkt:kebutuhan-teknis-jaringan:course:v2'));
  assert(progress.passed.game===100,'Game completion not connected to course');
  return {contracts:3,score:100,noQuestions:true,inventory:true,failure:true,reset:true};
}
