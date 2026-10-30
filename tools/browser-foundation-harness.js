(async()=>{
 const result=document.getElementById('result'),frame=document.querySelector('iframe'),errors=[];
 const wait=async(predicate,label)=>{for(let i=0;i<250;i++){if(await predicate())return;await new Promise(r=>setTimeout(r,40));}throw Error('Timeout '+label);};
 const assert=(value,label)=>{if(!value)throw Error(label);};
 const open=async path=>{frame.src=path;await new Promise((resolve,reject)=>{frame.onload=resolve;setTimeout(()=>reject(Error('frame load')),12000);});await wait(()=>frame.contentDocument?.querySelectorAll('#lessonNav>button').length>0,'navigation');};
 const q=(selector)=>frame.contentDocument.querySelector(selector),qa=selector=>[...frame.contentDocument.querySelectorAll(selector)];
 const click=selector=>{const n=q(selector);assert(n,'Missing '+selector);n.click();};
 const set=(selector,value)=>{const n=q(selector);assert(n,'Missing '+selector);if(n.type==='checkbox')n.checked=value;else n.value=value;n.dispatchEvent(new Event('change',{bubbles:true}));};
 try{
  localStorage.setItem('tjkt:local-instructor:v1','off');localStorage.setItem('qa:preserve','unchanged');
  const reports=[];
  for(const id of ['virtualisasi-server-dasar','instalasi-komputer-dasar','konfigurasi-perangkat-dasar']){
   const c=await(await fetch(`/data/${id}.json`)).json();await open(`/modules/dasar-jaringan/${id}/`);
   frame.contentWindow.addEventListener('error',e=>errors.push(e.message));
   assert(qa('#lessonNav>button').length===c.chapters.length,'Stage count');assert(qa('#lessonNav>button')[1].disabled,'Sequential gate');
   if(id==='virtualisasi-server-dasar'){
    const box=q('[data-virtual-lab]');assert(box,'VM lab');
    click('[data-virtual-lab] [data-action=new]');q('[data-form=create]').requestSubmit();click('[data-virtual-lab] [data-action=start]');
    let loops=0;while(!q('.vml-desktop')){
     assert(++loops<30,'Installer loop');
     if(q('[data-action=copy]')){click('[data-action=copy]');continue;}
     if(q('[data-action=restart]')){click('[data-action=eject]');click('[data-action=restart]');continue;}
     if(q('[name=username]')){set('[name=password]','fiktif123');set('[name=confirmation]','fiktif123');}
     if(q('[name=confirmed]'))set('[name=confirmed]',true);
     q('[data-form=installer]').requestSubmit();
    }
    assert(q('.vml-desktop').textContent.includes('diverifikasi tanpa ISO'),'Disk boot evidence');
    const saved=localStorage.getItem(`tjkt:${id}:vm-lab:vm-main:v1`);assert(saved&&!saved.includes('fiktif123'),'Password not persisted');
   }
   for(const ch of c.chapters){
    const section=q('#'+ch.id),form=section.parentElement.querySelector('form.chapter-check-form');
    for(const [index,question]of ch.questions.entries())form.querySelectorAll('fieldset')[index].querySelector(`input[value="${question.answer}"]`).click();
    form.requestSubmit();if(ch.id!=='evaluasi')click('#nextChapter');
   }
   assert(q('#progressLabel').textContent==='100%','Progress complete');
   await wait(()=>q('[name=certificateName]'),'Certificate eligibility');
   frame.contentWindow.print=()=>{frame.contentWindow.__printed=true;};
   set('[name=certificateName]','Siswa Uji Simulator');q('[data-certificate-action=create]').click();await frame.contentWindow.TJKTCertificate.ready(q('#tjktPrintableCertificate'));await wait(()=>!q('[data-certificate-action=print]').disabled,'Certificate ready');click('[data-certificate-action=print]');await wait(()=>frame.contentWindow.__printed,'Print callback');
   await open(`/modules/dasar-jaringan/${id}/`);assert(q('#progressLabel').textContent==='100%','Reload restores progress');
   assert(localStorage.getItem('qa:preserve')==='unchanged','Unrelated storage preserved');
   reports.push({id,stages:c.chapters.length,complete:true,print:true,reload:true});
  }
  assert(errors.length===0,errors.join('; '));result.textContent=JSON.stringify({result:'PASS',reports,errors});document.title='AUDIT PASS';
 }catch(error){let diagnostic;try{diagnostic={url:frame.src,errors,certificate:q('.module-certificate-panel')?.textContent,name:q('[name=certificateName]')?.value,valid:q('.module-certificate-panel form')?.checkValidity(),invalid:qa('.module-certificate-panel :invalid').map(n=>({tag:n.tagName,name:n.name,message:n.validationMessage})),paper:!!q('#tjktPrintableCertificate'),component:typeof frame.contentWindow.TJKTCertificate,nav:qa('#lessonNav>button').map(n=>({text:n.textContent,active:n.className})),version:frame.contentDocument.body.dataset.progressVersion,keys:Object.keys(localStorage).filter(k=>k.includes(':course:')).map(k=>[k,localStorage.getItem(k)])};}catch{}result.textContent=JSON.stringify({result:'FAIL',error:error.message,stack:error.stack,diagnostic});document.title='AUDIT FAIL';}
})();
