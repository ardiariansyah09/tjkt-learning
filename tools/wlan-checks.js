import { analyzeWLAN,channelLevels,channelConflicts } from '../assets/js/wlan-model.js';
const assert=(v,message)=>{if(!v)throw Error(message);};
export function checkWLANModels(){
  const input={siteA:'west',siteB:'east',channelA:1,channelB:1,powerA:14,powerB:14,noise:-92,wallLoss:8,threshold:-67,snr:25,capacity:40,rate:2,concurrent:50,clients:[18,12,18],walls:false,neighbors:true};
  const base=analyzeWLAN(input);assert(base.criteriaMet&&base.shared&&!base.loadFits&&base.domains[0].demand===48&&base.zones[1].snr===28,'Coverage versus shared load');
  const separate=analyzeWLAN({...input,channelB:6});assert(!separate.shared&&separate.loadFits&&separate.domains[0].demand===30&&separate.domains[1].demand===18,'Channel domains');
  const walls=analyzeWLAN({...input,walls:true});assert(walls.zones[1].rssi===-72&&!walls.criteriaMet,'Additional wall loss');
  const raised=analyzeWLAN({...input,walls:true,powerA:20,powerB:20});assert(raised.zones[1].rssi===-66&&raised.criteriaMet,'Downlink power delta');
  assert(analyzeWLAN({...input,noise:-80}).zones[1].snr===16,'Noise versus SNR');assert(!analyzeWLAN({...input,channelB:6,concurrent:100}).loadFits,'Peak load');
  const solutions=[[1,6,11],[1,6,11,1],[6,1,11,6,1]];solutions.forEach((channels,i)=>assert(!channelConflicts(channelLevels[i],channels).length,'Channel level solvability'));return {vectors:6,levels:3};
}
export function checkWLANGame(game){
  assert(game?.getClientRects().length,'Channel game invisible');assert(!game.querySelector('input[type=radio],select'),'Quiz inside channel game');
  const state=()=>JSON.parse(game.dataset.state),send=()=>game.querySelector('[data-wlan-action=submit]').click();send();send();send();assert(state().lost,'Channel game failure');game.querySelector('[data-wlan-action=reset]').click();
  const solutions=[[1,6,11],[1,6,11,1],[6,1,11,6,1]];solutions.forEach((channels,level)=>{
    if(level===2){game.querySelector('[data-channel-token="11"]').click();game.querySelector('[data-wlan-node="0"]').click();assert(state().channels[0]===6,'Locked radio should stay fixed');}
    channels.forEach((channel,i)=>{game.querySelector(`[data-channel-token="${channel}"]`).click();game.querySelector(`[data-wlan-node="${i}"]`).click();});assert(state().conflicts===0,'Channel conflict resolution');send();});
  assert(state().completed,'Three channel plans incomplete');const saved=JSON.parse(localStorage.getItem('tjkt:wireless-lan:course:v2'));assert(saved.passed.game===100,'Channel game progress');
  return {levels:3,score:100,channelPlacement:true,lockedRadio:true,failure:true,reset:true,noQuestions:true};
}
