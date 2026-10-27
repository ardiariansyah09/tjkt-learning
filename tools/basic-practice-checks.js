import {newBasicPractice,basicAction,basicProbe,basicAcceptance,basicPlan} from '../assets/js/basic-practice-model.js';
const assert=(ok,message)=>{if(!ok)throw Error('Basic practice: '+message);};
const healthy=()=>{let s=newBasicPractice();s=basicAction(s,'cable');s=basicAction(s,'vm');s=basicAction(s,'mode','internal');s=basicAction(s,'configure',basicPlan);return s;};
export function checkBasicPracticeModels(){
  let s=newBasicPractice();assert(!basicAcceptance(s).ok,'initial network should fail');
  assert(!basicAction(s,'save').saved,'reject unhealthy baseline');assert(!basicAction(s,'fault','dns').incident,'reject incident before baseline');
  s=healthy();assert(basicAcceptance(s).ok,'prepared network');assert(!basicAction(s,'save').saved,'explicit current acceptance evidence required');assert(basicProbe(s,'192.168.10.1').ok&&basicProbe(s,'192.168.20.20').ok,'gateway and routed path');
  for(const [name,value]of [['ip','999.1.1.1'],['ip','192.168.10.0'],['ip','192.168.10.255'],['ip','192.168.10.1'],['ip','192.168.30.10'],['prefix',31],['gateway','192.168.10.99']]){const bad=basicAction(s,'configure',{...basicPlan,[name]:value});assert(!basicAcceptance(bad).ok,'invalid '+name+' '+value);}
  const wide=basicAction(s,'configure',{...basicPlan,prefix:16});assert(basicProbe(wide,'192.168.10.1').ok&&!basicProbe(wide,'192.168.20.20').ok,'wrong prefix keeps gateway but breaks server path');
  const narrow=basicAction(s,'configure',{...basicPlan,prefix:25});assert(basicProbe(narrow,'192.168.20.20').ok&&!basicAcceptance(narrow).ok,'connectivity and plan compliance differ');
  const dns=basicAction(s,'configure',{...basicPlan,dns:'192.168.20.99'});assert(basicProbe(dns,'192.168.20.20').ok,'DNS does not break IP reachability');assert(!basicAction(dns,'command','nslookup portal.lab.test').logs.at(-1).text.includes('DNS model:'),'wrong DNS lookup fails');
  assert(!basicProbe({...s,vm:false},'192.168.20.20').ok,'VM power');assert(!basicProbe({...s,mode:'nat'},'192.168.20.20').ok,'VM wrong virtual network');
  assert(!basicProbe(s,'8.8.8.8').ok,'outside dataset refused');assert(basicAction(s,'command','<script>alert(1)</script>').logs.at(-1).text.includes('tidak didukung'),'arbitrary command not executed');
  s=basicAction(s,'test');s=basicAction(s,'save');
  for(const fault of ['dns','cable','vm-mode']){
    let t=basicAction(s,'fault',fault);assert(!t.evidence&&!t.bootVerified,'stale evidence cleared');t=basicAction(t,'command','ping 8.8.8.8');assert(!t.failure,'outside scope cannot count as failed incident evidence');t=basicAction(t,'test');assert(t.failure&&!t.evidence.ok,'record actual failure');t=basicAction(t,'restore');
    if(fault!=='dns')assert(!basicAcceptance(t).ok,'config restore cannot fix physical/VM condition');
    if(fault==='cable')t=basicAction(t,'cable');if(fault==='vm-mode')t=basicAction(t,'mode','internal');
    t=basicAction(t,'test');assert(t.recovered&&t.evidence.ok,'retest recovery '+fault);t=basicAction(t,'reboot');assert(t.bootVerified&&basicAcceptance(t).ok,'boot persistence '+fault);
    t=basicAction(t,'configure',{...basicPlan,dns:'192.168.20.99'});assert(!t.evidence&&!t.bootVerified,'later changes invalidate current acceptance');
  }
  for(let i=0;i<40;i++)s=basicAction(s,'command','help');assert(s.logs.length===30,'bounded evidence log');
  return {incidentTypes:3,addressAndPrefixCases:9,scopeGuards:true,staleEvidence:true,bootPersistence:true};
}
export function checkBasicPracticeUI(){
  const box=document.querySelector('#laboratorium .basic-practice');assert(box,'mounted on planning lab');
  const oldConfirm=window.confirm;window.confirm=()=>true;try{box.querySelector('[data-basic-reset]').click();}finally{window.confirm=oldConfirm;}
  const state=()=>JSON.parse(box.dataset.basicState),act=(action,value)=>{const b=[...box.querySelectorAll('[data-basic-action]')].find(n=>n.dataset.basicAction===action&&(value===undefined||n.dataset.basicValue===value));assert(b,'control '+action);b.click();};
  const config=box.querySelector('.basic-controls');
  const apply=values=>{for(const[k,v]of Object.entries(values))config.elements[k].value=v;config.requestSubmit();};
  const command=text=>{const form=box.querySelector('.basic-terminal');form.elements.command.value=text;form.requestSubmit();};
  act('save');assert(!state().saved,'UI blocks unhealthy baseline');command('pwd');assert(box.querySelector('pre').textContent.includes('/lab'),'terminal output');command('cat rencana.txt');assert(box.querySelector('pre').textContent.includes('Tidak ada uplink'),'read lab plan');
  act('cable');act('vm');const mode=box.querySelector('[name=basic-mode]');mode.value='internal';mode.dispatchEvent(new Event('change'));apply(basicPlan);act('test');assert(state().evidence.ok,'UI healthy setup');act('save');assert(state().baseline,'UI baseline');
  for(const fault of ['dns','cable','vm-mode']){act('fault',fault);assert(!state().evidence,'UI stale results');if(fault==='dns'){command('ping 192.168.20.20');assert(!state().failure,'IP success alone does not diagnose DNS');command('nslookup portal.lab.test');}else command('ping 192.168.20.20');assert(state().failure,'UI failure evidence '+fault);act('restore');if(fault==='cable')act('cable');if(fault==='vm-mode'){mode.value='internal';mode.dispatchEvent(new Event('change'));}act('test');act('reboot');assert(box.dataset.basicComplete==='true','UI recovery and boot '+fault);}
  const notes=box.querySelector('.basic-report');for(const n of notes.querySelectorAll('textarea')){n.value='Prediksi dan bukti uji; alasan perubahan minimum serta batas dataset.';n.dispatchEvent(new Event('input'));}notes.requestSubmit();const saved=JSON.parse(localStorage.getItem('tjkt:perencanaan-jaringan:basic-practice:v1'));assert(saved.state.bootVerified&&saved.notes.reason,'practice journal persists separately');
  assert(!box.querySelector('script'),'terminal creates no executable markup');
  return {threeIncidents:true,terminal:true,report:true};
}
