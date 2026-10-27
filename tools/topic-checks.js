import { checkFinalModels,checkFinalLab } from './final-module-checks.js';


import { checkMonitoringModels,checkMonitoringLab } from './monitoring-checks.js';
import { checkContextualModels,checkContextualStage,checkLoginDefenseModels } from './contextual-checks.js';
import { checkVPNModels,checkVPNLab } from './vpn-checks.js';
import { checkHostingModels,checkHostingLab } from './hosting-checks.js';
import { checkWebDBModels,checkWebDBLab } from './web-db-checks.js';
import { checkFileShareModels,checkFileShareLab } from './file-share-checks.js';
import { checkFTPModels,checkFTPLab } from './ftp-checks.js';
import { checkServicesModels,checkServicesLab } from './services-checks.js';
import { checkAccessModels,checkAccessLab } from './access-checks.js';
import { checkOSAdminModels,checkOSAdminLab } from './os-admin-checks.js';
import { checkVirtualizationModels,checkVirtualizationLab } from './virtualization-checks.js';
import { checkServerBasicsModels,checkServerBasicsLab } from './server-basics-checks.js';
import { checkDualWANModels,checkDualWANLab } from './dual-wan-checks.js';
import { checkQoSModels,checkQoSLab } from './qos-checks.js';
import { checkProxyModels,checkProxyLab } from './proxy-checks.js';
import { checkNATModels,checkNATLab } from './nat-checks.js';
import { checkDynamicRoutingModels,checkDynamicRoutingLab } from './dynamic-routing-checks.js';
import { checkStaticRoutingModels,checkStaticRoutingLab } from './static-routing-checks.js';
import { checkReplacementModels,checkReplacementLab } from './replacement-checks.js';
import { checkInstallationModels,checkInstallationLab } from './installation-checks.js';
import { checkFiberModels,checkFiberLab } from './fiber-checks.js';
import { checkActivityInstructions } from './instruction-checks.js';
import { checkVoIPModels,checkVoIPLab } from './voip-checks.js';
import { checkMaintenanceModels,checkMaintenanceLab } from './maintenance-checks.js';
import { topicActivityTypes } from '../assets/js/topic-activities.js';
import { ticketLoad,sensorData,venture,propagation,opticalPower } from '../assets/js/topic-models.js';
import { checkRequirementsModels } from './requirements-checks.js';
import { checkLayoutModels } from './layout-checks.js';
import { checkAddressModels } from './address-plan-checks.js';
import { checkCablingModels } from './cabling-checks.js';
import { checkWLANModels } from './wlan-checks.js';
const assert=(condition,message)=>{if(!condition)throw Error(message);};
export function checkTopicModels(){
  assert(ticketLoad(16,45,2,300).remaining===-120,'Ticket overload');
  assert(sensorData(40,1000,60,25).sent===14400000,'IoT reduction');
  assert(venture(600000,90000,150000,8).profit===-120000,'Venture loss');
  assert(venture(600000,90000,140000,8).breakEven===12,'Break-even rounding');
  assert(venture(600000,90000,90000,8).breakEven===null,'Zero contribution');
  assert(propagation(72000,300000).rtt===480,'Satellite propagation');
  assert(opticalPower(-3,8,-18,-1).margin===7,'Optical margin');
  assert(opticalPower(-3,16,-18,-1).state==='low','Low optical power');
  assert(opticalPower(5,0,-18,-1).state==='overload','Optical overload');
  let rejected=false;try{opticalPower(-3,8,0,-1);}catch{rejected=true;}assert(rejected,'Invalid receiver limits');
  return {contextual:checkContextualModels(),loginDefense:checkLoginDefenseModels(),vectors:10,requirements:checkRequirementsModels(),layout:checkLayoutModels(),addressPlan:checkAddressModels(),cabling:checkCablingModels(),wlan:checkWLANModels(),maintenance:checkMaintenanceModels(),voip:checkVoIPModels(),fiber:checkFiberModels(),installation:checkInstallationModels(),replacement:checkReplacementModels(),staticRouting:checkStaticRoutingModels(),dynamicRouting:checkDynamicRoutingModels(),nat:checkNATModels(),proxy:checkProxyModels(),qos:checkQoSModels(),dualWAN:checkDualWANModels(),serverBasics:checkServerBasicsModels(),virtualization:checkVirtualizationModels(),osAdmin:checkOSAdminModels(),access:checkAccessModels(),services:checkServicesModels(),ftp:checkFTPModels(),fileShare:checkFileShareModels(),webDB:checkWebDBModels(),hosting:checkHostingModels(),vpn:checkVPNModels(),monitoring:checkMonitoringModels(),remaining:checkFinalModels()};
}
export async function checkTopicStage(){
  if(document.querySelector('.basic-practice,.services-practice,.services-practice-hint'))throw Error('Removed guided practice still visible');
  checkActivityInstructions();
  checkContextualStage();
  const id=document.body.dataset.moduleId,type=topicActivityTypes[id];
  assert(!document.getElementById('learning-studio'),'Global studio should be removed');
  assert(!document.querySelector('[data-studio-panel]'),'Forced studio panels should be removed');
  const visibleGames=[...document.querySelectorAll('.topic-2d-game,.action-game,.requirements-game,.layout-game,.address-game,.cabling-game,.wlan-game,.maintenance-game,.voip-game,.fiber-game,.installation-game,.replacement-game,.static-routing-game,.dynamic-routing-game,.nat-game,.proxy-game,.qos-game,.wan-game,.server-game,.virtualization-game,.os-admin-game,.access-game,.services-game,.ftp-game,.file-share-game,.webdb-game,.hosting-game,.vpn-game,.monitor-game,.final-game')].filter(node=>node.getClientRects().length);
  const active=document.querySelector('.chapter-unit:not([hidden])');
  if(active&&active.dataset.chapter!=='game')assert(!visibleGames.length,'Game visible outside its chapter');
  const visible=[...document.querySelectorAll('[data-topic-activity]')].filter(node=>node.getClientRects().length);
  if(!type)return {globalStudioAbsent:true,nativeActivities:true};
  if(active?.dataset.chapter!=='laboratorium'){
    assert(!visible.length,'Topic experiment visible on unrelated chapter');
    if(active?.dataset.chapter==='refleksi'){
      const journal=active.querySelector('.studio-journal');assert(journal,'Journal missing in reflection');
      journal.querySelectorAll('textarea').forEach(input=>input.value=`Bukti ${id}: prediksi, hasil, batas, tindak lanjut.`);journal.requestSubmit();
      const saved=JSON.parse(localStorage.getItem(`tjkt:${id}:studio:v1`));assert(saved.journal.evidence.includes(id),'Journal did not persist');
    }
    return {scoped:true};
  }
  assert(visible.length===1&&visible[0].dataset.topicActivity===type,'Wrong topic activity');
  const root=visible[0],form=root.querySelector('.topic-form');
  assert(!root.querySelector('canvas,.action-game'),'Generic 3D room or game inside experiment');
  const state=()=>JSON.parse(root.dataset.result);
  function set(name,value){const input=form.elements[name];input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));}
  if(type.startsWith('final-'))await checkFinalLab(root,type.slice(6));
  switch(type){
    case 'monitoring': checkMonitoringLab(root);break;
    case 'vpn': checkVPNLab(root);break;
    case 'hosting': checkHostingLab(root);break;
    case 'web-db': checkWebDBLab(root);break;
    case 'file-share': checkFileShareLab(root);break;
    case 'ftp': checkFTPLab(root);break;
    case 'services': checkServicesLab(root);break;
    case 'access': checkAccessLab(root);break;
    case 'os-admin': checkOSAdminLab(root);break;
    case 'virtualization': checkVirtualizationLab(root);break;
    case 'server-basics': checkServerBasicsLab(root);break;
    case 'dual-wan': checkDualWANLab(root);break;
    case 'qos': checkQoSLab(root);break;
    case 'proxy': checkProxyLab(root);break;
    case 'nat': checkNATLab(root);break;
    case 'dynamic-routing': checkDynamicRoutingLab(root);break;
    case 'static-routing': checkStaticRoutingLab(root);break;
    case 'replacement': checkReplacementLab(root);break;
    case 'installation': checkInstallationLab(root);break;
    case 'fiber': checkFiberLab(root);break;
    case 'voip': checkVoIPLab(root);break;
    case 'maintenance': checkMaintenanceLab(root);break;
    case 'wlan': {
      assert(state().shared&&!state().loadFits&&state().criteriaMet,'Default WLAN dimensions');
      set('channelB',6);assert(!state().shared&&state().loadFits,'Separate channels');
      form.elements.walls.checked=true;form.elements.walls.dispatchEvent(new Event('change',{bubbles:true}));assert(state().zones[1].rssi===-72&&!state().criteriaMet,'Wall effect');
      set('powerA',20);set('powerB',20);assert(state().zones[1].rssi===-66&&state().criteriaMet,'Downlink model');
      set('noise',-80);assert(!state().criteriaMet,'Noise criterion');set('noise',-92);set('concurrent',100);assert(!state().loadFits,'Peak WLAN load');break;
    }
    case 'cabling': {
      const stripe=getComputedStyle(root.querySelector('[data-conductor=wo]'));
      assert(stripe.borderLeftWidth==='7px'&&stripe.borderLeftColor==='rgb(234, 88, 12)'&&stripe.borderLeftStyle==='dashed','Conductor colors and striped wire markers');
      assert(state().straight&&state().lengths.channel===85,'Cabling baseline');
      root.querySelector('[data-fill-end=A][data-fill-code=A]').click();assert(state()===null,'Wiring change invalidates result');root.querySelector('[data-cable-lab=test]').click();assert(!state().straight&&!state().splitPair,'Crossed code');
      root.querySelector('[data-cable-example=split]').click();root.querySelector('[data-cable-lab=test]').click();assert(state().identity&&state().splitPair&&!state().straight,'Split pair versus continuity');
      root.querySelector('[data-fill-end=A][data-fill-code=B]').click();root.querySelector('[data-fill-end=B][data-fill-code=B]').click();
      form.elements.fault.value='open';form.elements.fault.dispatchEvent(new Event('change',{bubbles:true}));root.querySelector('[data-cable-lab=test]').click();assert(state().open&&state().map[2]===null,'Open cable');
      form.elements.fault.value='short';root.querySelector('[data-cable-lab=test]').click();assert(state().short&&!state().straight,'Short cable');
      form.elements.fault.value='none';set('permanent',95);root.querySelector('[data-cable-lab=test]').click();assert(!state().lengths.permanentWithin&&!state().lengths.channelWithin,'Length review');
      set('permanent',78);root.querySelector('[data-cable-lab=test]').click();assert(state().straight,'Restored good model');break;
    }
    case 'address-plan': {
      assert(state().allocation.rows[0].cidr==='10.10.0.0/26'&&state().allocation.unallocated===128,'Default VLSM');
      const subnet=root.querySelector('[data-subnet-row="1"]'),gateway=root.querySelector('[data-gateway-row="1"]');
      subnet.value='10.10.0.0/27';subnet.dispatchEvent(new Event('input',{bubbles:true}));assert(state().validation.issues.some(t=>t.includes('tumpang tindih')),'Manual overlap');
      subnet.value='10.10.0.64/27';subnet.dispatchEvent(new Event('input',{bubbles:true}));gateway.value='10.10.0.95';gateway.dispatchEvent(new Event('input',{bubbles:true}));assert(!state().validation.valid,'Broadcast gateway');
      gateway.value='';gateway.dispatchEvent(new Event('input',{bubbles:true}));assert(!state().validation.valid,'Blank gateway rejected');
      set('devices0',60);assert(state()===null,'Stale allocation invalidated');
      [...root.querySelectorAll('button')].find(b=>b.textContent==='Periksa tabel manual').click();assert(state()===null,'Manual check must not bypass stale inputs');form.requestSubmit();assert(state().validation.valid,'Reallocation');
      set('parent','10.10.0.0/26');form.requestSubmit();assert(state()===null,'Small IPv4 parent');
      set('parent','10.10.0.0/24');set('ipv6','2001:db8:1200::/64');form.requestSubmit();assert(state()===null,'Small IPv6 parent');
      set('ipv6','2001:db8:1200::/48');form.requestSubmit();assert(state().validation.valid&&state().ipv6.subnets.length===4,'Valid dual-stack plan');
      {const create=URL.createObjectURL,click=HTMLAnchorElement.prototype.click;let exported;
        try{URL.createObjectURL=blob=>{exported=blob;return create.call(URL,blob);};HTMLAnchorElement.prototype.click=function(){};[...root.querySelectorAll('button')].find(b=>b.textContent==='Ekspor rencana JSON').click();assert(exported,'No plan exported');const file=JSON.parse(await exported.text());assert(file.ipv4.length===4&&file.ipv6.subnets.length===4&&file.validation.valid,'Export content');}
        finally{URL.createObjectURL=create;HTMLAnchorElement.prototype.click=click;}}
      break;
    }
    case 'layout': {
      assert(state().length===32&&Math.abs(state().cable-37.2)<1e-8&&state().complete,'Layout defaults');
      set('scale',200);assert(state().paperCm===16&&Math.abs(state().cable-37.2)<1e-8,'Scale invariance');
      [...root.querySelectorAll('button')].find(b=>b.textContent==='Mulai jalur dari rack').click();assert(!state().complete,'New path should be incomplete');
      set('x',2);set('y',7);form.requestSubmit();set('x',20);form.requestSubmit();assert(state().length===5&&!state().complete,'Forbidden segment rejected atomically');
      [...root.querySelectorAll('button')].find(b=>b.textContent==='Mulai jalur dari rack').click();set('x',22);set('y',2);form.requestSubmit();set('y',12);form.requestSubmit();assert(state().length===30&&state().complete&&state().cable===35,'Alternative route');
      break;
    }
    case 'requirements':
      assert(state().ports===39&&state().passing.join()==='C'&&!state().verified,'Default equipment analysis');
      set('cameras',8);assert(state().ports===44&&Math.abs(state().poe-112.8)<1e-9,'Camera increase');
      set('concurrent',100);assert(state().wan===195,'Peak traffic');
      set('budget',2000000);assert(!state().passing.length,'Unaffordable candidates');
      set('budget',4000000);form.elements.verified.checked=true;form.elements.verified.dispatchEvent(new Event('change',{bubbles:true}));assert(state().verified,'Evidence status');break;
    case 'safety':
      root.querySelector('[data-hazard="0"]').click();root.querySelector('[data-safety-action="0"]').click();root.querySelector('[data-safety-action="1"]').click();
      assert(state().completed[0]===2&&state().stop.includes('Kabel daya rusak'),'Safety escalation');break;
    case 'ports':
      assert(root.querySelectorAll('.switch-port').length===48,'Port panel default');
      set('ports',24);assert(state().remaining===-9,'Port shortage');set('ports',48);break;
    case 'ipv6':
      assert(root.querySelectorAll('.ipv6-hextet').length===8,'Eight hextets');
      set('address','2001::1::2');form.requestSubmit();assert(state()===null,'Invalid IPv6 accepted');
      [...root.querySelectorAll('button')].find(b=>b.textContent==='Catat percobaan').click();assert(root.querySelector('.topic-save-status').textContent.includes('valid'),'Invalid experiment recorded');
      set('address','2001:0db8:0:1::10/64');form.requestSubmit();assert(state().canonical==='2001:db8:0:1::10','IPv6 normalization');break;
    case 'tickets':
      for(let i=0;i<7;i++)root.querySelector(`[data-assign-ticket="${i}"][data-technician="0"]`).click();
      assert(state().loads[0]===315&&state().remaining===150,'Individual overload despite aggregate spare');
      set('tickets',16);assert(state().remaining===-120,'Ticket capacity shortage');break;
    case 'sensors':
      set('retained',25);assert(state().sent===14400000,'Sensor reduction');
      root.querySelector('[data-uplink]').click();assert(state().delivered===0,'Uplink disconnection');root.querySelector('[data-uplink]').click();break;
    case 'venture':
      assert(root.querySelector('svg'),'Revenue/cost chart missing');assert(state().profit===-120000,'Default venture');
      set('price',140000);assert(state().breakEven===12,'Break-even');set('price',90000);assert(state().breakEven===null,'Zero contribution');break;
    case 'propagation':
      set('distance',72000);form.elements.speed.value='300000';form.requestSubmit();assert(state().rtt===480,'Propagation RTT');
      root.querySelector('[data-pulse=send]').click();assert(form.querySelector('[data-pulse=return]').disabled===false,'Return enabled after one-way');
      root.querySelector('[data-pulse=return]').click();assert(root.querySelector('.signal-pulse').classList.contains('returning'),'Return pulse');break;
    case 'optical':
      assert(root.querySelector('.optical-meter').textContent==='-11.00 dBm','Power meter');
      root.querySelector('[data-optical-reference]').click();assert(root.querySelector('.optical-meter').textContent==='-3.00 dBm','Reference reading');
      root.querySelector('[data-optical-reference]').click();set('loss',16);assert(state().state==='low','Below sensitivity');
      set('transmit',5);set('loss',0);assert(state().state==='overload','Overload');
      set('sensitivity',0);assert(state()===null,'Invalid limits');set('sensitivity',-18);break;
  }
  const record=[...root.querySelectorAll('button')].find(b=>b.textContent==='Catat percobaan');record.click();
  const saved=JSON.parse(localStorage.getItem(`tjkt:${id}:studio:v1`));assert(saved.experiments.length>0,'Experiment persistence');
  const metadata=await fetch(`/tjkt-learning/data/${id}.json`).then(r=>r.json());
  const {default:course}=await import(`/tjkt-learning/${metadata.contentSource}`);
  assert(course.chapters.length===12,'Twelve chapters');
  assert(course.chapters.every((c,i)=>c.id===metadata.chapters[i].id&&c.title===metadata.chapters[i].title),'Metadata/content parity');
  assert(course.chapters.flatMap(c=>c.questions).length>=10,'Assessment question bank');
  return {type,experiment:true,scoped:true,persisted:true};
}
