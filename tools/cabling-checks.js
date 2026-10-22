import { wiringCodes,checkWiremap,cableLengths,putConductor } from '../assets/js/cabling-model.js';
const assert=(v,message)=>{if(!v)throw Error(message);};
export function checkCablingModels(){
  assert(checkWiremap(wiringCodes.B,wiringCodes.B).straight,'B/B straight');assert(checkWiremap(wiringCodes.A,wiringCodes.A).straight,'A/A straight');
  const cross=checkWiremap(wiringCodes.A,wiringCodes.B);assert(!cross.straight&&!cross.splitPair&&cross.map.join()==='2,5,0,3,4,1,6,7','A/B crossed pairs');
  const split=['wo','wg','o','b','wb','g','wbr','br'],r=checkWiremap(split,split);assert(r.identity&&r.splitPair&&!r.straight,'Split pair despite continuity');
  assert(checkWiremap(wiringCodes.B,wiringCodes.B,{fault:'open'}).map[2]===null,'Open A3');assert(checkWiremap(wiringCodes.B,wiringCodes.B,{fault:'short'}).short&&!checkWiremap(wiringCodes.B,wiringCodes.B,{fault:'short'}).straight,'Short B4-B5');
  const moved=putConductor(wiringCodes.B,1,'wo');assert(moved[0]===null&&moved[1]==='wo','Moving conductor leaves old pin empty');
  const length=cableLengths(78,3,4);assert(length.channel===85&&length.permanentWithin&&length.channelWithin,'Link length baseline');assert(!cableLengths(95,3,4).permanentWithin&&!cableLengths(95,3,4).channelWithin,'Both length limits');
  return {vectors:9};
}
export function checkCablingGame(game){
  assert(game?.getClientRects().length,'Cabling game invisible');assert(!game.querySelector('input[type=radio],select'),'Quiz in cabling game');
  const state=()=>JSON.parse(game.dataset.state),send=()=>game.querySelector('[data-cabling-action=submit]').click();send();send();send();assert(state().lost,'Failure after three rejected shipments');game.querySelector('[data-cabling-action=reset]').click();
  for(const code of ['B','A','B']){wiringCodes[code].forEach((id,pin)=>{game.querySelector(`[data-conductor=${id}]`).click();game.querySelector(`[data-pin="${pin}"]`).click();});assert(state().wires.every((id,i)=>id===wiringCodes[code][i]),'Assembly wiring');send();}
  assert(state().completed,'Three cabling jobs incomplete');const saved=JSON.parse(localStorage.getItem('tjkt:instalasi-kabel:course:v2'));assert(saved.passed.game===100,'Assembly completion not saved');
  return {jobs:3,score:100,assembly:true,conductorMovement:true,failure:true,reset:true,noQuestions:true};
}
