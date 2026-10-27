import {checkTopicGameUI,checkTopicGamesModels} from './topic-game-checks.js';
import { checkFinalGame } from './final-module-checks.js';
import { remainingModules } from '../assets/js/final-game-models.js';
import { checkMonitoringGame } from './monitoring-checks.js';
import { checkVPNGame } from './vpn-checks.js';
import { checkHostingGame } from './hosting-checks.js';
import { checkWebDBGame } from './web-db-checks.js';
import { checkFileShareGame } from './file-share-checks.js';
import { checkFTPGame } from './ftp-checks.js';
import { checkServicesGame } from './services-checks.js';
import { checkAccessGame } from './access-checks.js';
import { checkOSAdminGame } from './os-admin-checks.js';
import { checkVirtualizationGame } from './virtualization-checks.js';
import { checkServerBasicsGame } from './server-basics-checks.js';
import { checkDualWANGame } from './dual-wan-checks.js';
import { checkQoSGame } from './qos-checks.js';
import { checkProxyGame } from './proxy-checks.js';
import { checkNATGame } from './nat-checks.js';
import { checkDynamicRoutingGame } from './dynamic-routing-checks.js';
import { checkStaticRoutingGame } from './static-routing-checks.js';
import { checkReplacementGame } from './replacement-checks.js';
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

export function checkStudioCore(){checkTopicGamesModels();
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
  if(remainingModules[id])return checkFinalGame(content.querySelector('.final-game'));
  if(id==='monitoring-jaringan')return checkMonitoringGame(content.querySelector('.monitor-game'));
  if(id==='vpn-server')return checkVPNGame(content.querySelector('.vpn-game'));
  if(id==='panel-layanan-hosting')return checkHostingGame(content.querySelector('.hosting-game'));
  if(id==='hosting-server')return checkWebDBGame(content.querySelector('.webdb-game'));
  if(id==='file-server')return checkFileShareGame(content.querySelector('.file-share-game'));
  if(id==='ftp-server')return checkFTPGame(content.querySelector('.ftp-game'));
  if(id==='layanan-server')return checkServicesGame(content.querySelector('.services-game'));
  if(id==='manajemen-pengguna-server')return checkAccessGame(content.querySelector('.access-game'));
  if(id==='administrasi-linux-windows')return checkOSAdminGame(content.querySelector('.os-admin-game'));
  if(id==='virtualisasi-server')return checkVirtualizationGame(content.querySelector('.virtualization-game'));
  if(id==='dasar-administrasi-server')return checkServerBasicsGame(content.querySelector('.server-game'));
  if(id==='load-balancing')return checkDualWANGame(content.querySelector('.wan-game'));
  if(id==='bandwidth-qos')return checkQoSGame(content.querySelector('.qos-game'));
  if(id==='proxy-load-balancing')return checkProxyGame(content.querySelector('.proxy-game'));
  if(id==='nat-wan')return checkNATGame(content.querySelector('.nat-game'));
  if(id==='routing-dinamis')return checkDynamicRoutingGame(content.querySelector('.dynamic-routing-game'));
  if(id==='routing-ipv4')return checkStaticRoutingGame(content.querySelector('.static-routing-game'));
  if(id==='penggantian-perangkat-jaringan')return checkReplacementGame(content.querySelector('.replacement-game'));
  if(id==='pemasangan-perangkat-jaringan')return checkInstallationGame(content.querySelector('.installation-game'));
  if(id==='fiber-optik')return checkFiberGame(content.querySelector('.fiber-game'));
  if(id==='voip')return checkVoIPGame(content.querySelector('.voip-game'));
  if(id==='wireless-lan')return checkWLANGame(content.querySelector('.wlan-game'));
  for(let attempt=0;attempt<50&&!content.querySelector('.topic-2d-game')?.getClientRects().length;attempt++)await wait();
  return checkTopicGameUI(content.querySelector('.topic-2d-game'));
}
