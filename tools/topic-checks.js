import { topicActivityTypes } from '../assets/js/topic-activities.js';
import { ticketLoad,sensorData,venture,propagation,opticalPower } from '../assets/js/topic-models.js';
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
  return {vectors:10};
}
export async function checkTopicStage(){
  const id=document.body.dataset.moduleId,type=topicActivityTypes[id];
  assert(!document.getElementById('learning-studio'),'Global studio should be removed');
  assert(!document.querySelector('[data-studio-panel]'),'Forced studio panels should be removed');
  const visibleGames=[...document.querySelectorAll('.action-game')].filter(node=>node.getClientRects().length);
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
  switch(type){
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
