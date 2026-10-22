import { checkInstallationGame } from './installation-checks.js';
import { checkFiberGame } from './fiber-checks.js';
import { checkVoIPGame } from './voip-checks.js';
import { checkMaintenanceGame } from './maintenance-checks.js';
// Browser-only regression checks; runs in an isolated QA profile.
import { studioPacks } from '../assets/js/studio-data.js';
import { parseIPv6, subnetIPv4, capacity, reachable } from '../assets/js/studio-core.js';
import { solveActionGame,checkActionCore } from './action-game-checks.js';
import { checkRequirementsGame } from './requirements-checks.js';
import { checkLayoutGame } from './layout-checks.js';
import { checkAddressGame } from './address-plan-checks.js';
import { checkCablingGame } from './cabling-checks.js';
import { checkWLANGame } from './wlan-checks.js';
import { checkTopicModels,checkTopicStage } from './topic-checks.js';
export { checkTopicStage };

function assert(condition,message){if(!condition)throw new Error(message);}
const wait=()=>new Promise(resolve=>setTimeout(resolve,120));

export function checkStudioCore(){
  const vectors=[['::','0000:0000:0000:0000:0000:0000:0000:0000','::'],['::1','0000:0000:0000:0000:0000:0000:0000:0001','::1'],['2001:0DB8:0000:0001:0000:0000:0000:0010','2001:0db8:0000:0001:0000:0000:0000:0010','2001:db8:0:1::10'],['2001:0:0:1:0:0:1:1','2001:0000:0000:0001:0000:0000:0001:0001','2001::1:0:0:1:1'],['2001:db8:0:1:2:3:4:5','2001:0db8:0000:0001:0002:0003:0004:0005','2001:db8:0:1:2:3:4:5']];
  vectors.forEach(([input,expanded,canonical])=>{const actual=parseIPv6(input);assert(actual.expanded===expanded&&actual.canonical===canonical,`IPv6 representation: ${input}`);});
  ['2001::1::2','1:2:3:4:5:6:7','1:2:3:4:5:6:7:8:9','gggg::1','2001:::1','1:2:3:4:5:6:7:8::','fe80::1/129'].forEach(input=>{let rejected=false;try{parseIPv6(input);}catch{rejected=true;}assert(rejected,`Invalid IPv6 accepted: ${input}`);});
  assert(parseIPv6('fe80::1').scope==='Link-local unicast','Link-local scope');
  assert(parseIPv6('ff02::1').scope==='Multicast','Multicast scope');
  assert(parseIPv6('fd12::1').scope==='Unique local (ULA)','ULA scope');
  const subnet=subnetIPv4('192.168.10.70',26);assert(subnet.network==='192.168.10.64'&&subnet.broadcast==='192.168.10.127'&&subnet.hosts===62,'IPv4 subnet');
  const ports=capacity(24,2,1,20,48);assert(ports.current===27&&ports.spare===6&&ports.required===33&&ports.remaining===15,'Capacity rounding');
  assert(!capacity(24,2,1,0,24).enough,'Capacity shortage');
  assert(!reachable([[0,1],[1,2],[1,3]],0,2,1),'Star failure');
  assert(reachable([[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],0,2,1),'Mesh alternate');
  return {representationVectors:vectors.length,invalidVectors:7,scopeVectors:3,otherModels:4};
}

export async function checkStudioUI(){
  assert(!document.getElementById('learning-studio'),'Global studio is no longer part of lesson layout');
  assert(!document.querySelector('[data-studio-panel],.studio-shortcut'),'Forced studio panels remain');
  const root=document.querySelector('.lesson-content');
  root.querySelectorAll('[data-topic-activity]').forEach(activity=>assert(activity.closest('#laboratorium'),'Experiment belongs in laboratory chapter'));
  root.querySelectorAll('.topic-journal').forEach(journal=>assert(journal.closest('#refleksi'),'Journal belongs in reflection chapter'));
  assert(![...document.querySelectorAll('.action-game')].some(game=>game.getClientRects().length),'Game should not appear on orientation');
  return {globalStudioRemoved:true,contextualActivities:true,models:checkTopicModels()};
}
export async function checkGameStage(){
  const id=document.body.dataset.moduleId,content=document.querySelector('.lesson-content');
  const index=[...document.querySelectorAll('.lesson-nav > button')].findIndex(button=>button.classList.contains('active'));
  const legacy=['pengenalan-jaringan','topologi-jaringan','perangkat-jaringan','ipv4-subnetting'].includes(id);
  const expected=(legacy&&index===7)||Boolean(content.querySelector('.chapter-unit[data-chapter="game"]:not([hidden])'));
  if(!expected)return null;
  if(id==='kebutuhan-teknis-jaringan')return checkRequirementsGame(content.querySelector('.requirements-game'));
  if(id==='desain-topologi-arsitektur')return checkLayoutGame(content.querySelector('.layout-game'));
  if(id==='perencanaan-pengalamatan-lanjut')return checkAddressGame(content.querySelector('.address-game'));
  if(id==='instalasi-kabel')return checkCablingGame(content.querySelector('.cabling-game'));
  if(id==='pemeliharaan-kabel-nirkabel')return checkMaintenanceGame(content.querySelector('.maintenance-game'));
  if(id==='pemasangan-perangkat-jaringan')return checkInstallationGame(content.querySelector('.installation-game'));
  if(id==='fiber-optik')return checkFiberGame(content.querySelector('.fiber-game'));
  if(id==='voip')return checkVoIPGame(content.querySelector('.voip-game'));
  if(id==='wireless-lan')return checkWLANGame(content.querySelector('.wlan-game'));
  const game=[...content.querySelectorAll('.action-game')].find(node=>node.getClientRects().length);
  assert(game,`Actual action game missing in ${id}`);
  assert(![...content.querySelectorAll('input[type=radio],.chapter-check')].some(node=>node.getClientRects().length),'Quiz visible inside game stage');
  const twoD=solveActionGame(game);
  const view=game.querySelector('[data-game-view="3d"]');
  if(!view)return {twoD};
  const before=game.dataset.state;view.click();
  assert(before===game.dataset.state,'Changing view reset game progress');
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  assert(game.dataset.mode==='3d'&&game.querySelector('.action-camera').getClientRects().length,'3D camera only inside game');
  game.querySelector('[data-game-action=next]').click();
  const threeD=solveActionGame(game);
  return {twoD,threeD,view3d:true,progressPreserved:true};
}
