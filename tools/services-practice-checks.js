import {servicesAction} from '../assets/js/services-model.js';
import {servicesCases,servicesCaseState,newServicesRun,observeServicesRun} from '../assets/js/services-practice-model.js';
const assert=(v,m)=>{if(!v)throw Error('Services practice: '+m);};
export function checkServicesPracticeModels(){
 for(const id of Object.keys(servicesCases)){
  let s=servicesCaseState(id),run=newServicesRun(id);
  const act=(a,client='A')=>{const r=servicesAction(s,a,client);s=r.state;run=observeServicesRun(run,s,r.result,'operation');return r.result;};
  const set=(k,v)=>{s.config[k]=v;run=observeServicesRun(run,s,null,'change');};
  act('renew');assert(run.index===0,'cannot skip diagnostic '+id);
  // Restore scenario because the attempted operation can legitimately change a lease.
  s=servicesCaseState(id);run=newServicesRun(id);
  if(id==='relay'){act('lease');assert(run.index===1,'capture relay failure');set('relay',true);act('lease');}
  if(id==='ack'){act('dns');set('resolver','correct');const result=act('dns');assert(!result.ok&&s.leases.A.resolver==='wrong','server change does not rewrite client lease');}
  if(id==='cache'){assert(act('dns').address==='192.168.10.20','old positive cache');act('ssh');act('flush');assert(act('dns').address==='192.168.10.10','fresh authoritative result');const r=act('ssh');assert(!r.ok&&r.message.includes('Host key'),'identity denial required');set('key','trusted');}
  const finalStart=servicesCases[id].steps.length-3;assert(run.index===finalStart,'diagnosis sequence '+id);
  act('dns');assert(run.index===finalStart,'cannot skip renewal acceptance');act('renew');act('dns');act('ssh');assert(run.complete,'case complete '+id);
  assert(run.proofs.slice(-3).every(p=>p.revision===run.revision),'acceptance same revision');
  set('key','changed');assert(!run.complete&&run.index===finalStart,'change invalidates accepted run');set('key','trusted');act('ssh');assert(!run.complete,'old proof cannot bypass reacceptance');act('renew');act('dns');act('ssh');assert(run.complete,'reacceptance');
  act('tick');assert(!run.complete&&run.index===finalStart,'time invalidates proof');
  run=observeServicesRun(run,s,null,'reset');assert(run.blocked&&!run.complete&&run.index===0,'lab reset blocks stale case');act('dns');assert(run.index===0,'reset requires explicit case reload');
 }
 return {cases:3,orderedEvidence:true,leaseOptions:true,cache:true,hostIdentity:true,staleProof:true,resetGuard:true};
}
export function checkServicesPracticeUI(root){
 checkServicesPracticeModels();const box=root.querySelector('.services-practice');assert(box,'mounted');
 const run=()=>JSON.parse(box.dataset.servicesRun),set=(name,v)=>{const n=root.querySelector(`[name="${name}"]`);n.value=String(v);n.dispatchEvent(new Event('change',{bubbles:true}));},act=a=>root.querySelector(`[data-services-action="${a}"]`).click();
 for(const id of Object.keys(servicesCases)){
  set('services-case',id);box.querySelector('[data-services-practice=start]').click();assert(run().id===id&&run().index===0,'load '+id);
  if(id==='relay'){act('lease');set('relay',true);act('lease');}
  if(id==='ack'){act('dns');set('resolver','correct');act('dns');}
  if(id==='cache'){act('dns');act('ssh');act('flush');act('dns');act('ssh');set('key','trusted');}
  act('renew');act('dns');act('ssh');assert(run().complete,'UI complete '+id);
  assert(box.querySelectorAll('li[aria-current]').length===0,'completed steps');
  const form=box.querySelector('form');for(const n of form.querySelectorAll('textarea'))n.value='Prediksi, bukti sebelum dan sesudah perbaikan, alasan serta batas simulasi.';form.requestSubmit();const saved=JSON.parse(localStorage.getItem('tjkt:layanan-server:guided-practice:v1'));assert(saved.at(-1).case===id&&saved.at(-1).run.complete,'saved case report '+id);
  set('ssh',false);assert(!run().complete,'UI state change clears acceptance');set('ssh',true);act('renew');act('dns');act('ssh');assert(run().complete,'UI reacceptance');
 }
 act('reset');assert(run().blocked,'UI reset invalidates run');act('lease');
 return {completedCases:3,realControls:true,persistedReports:true};
}
