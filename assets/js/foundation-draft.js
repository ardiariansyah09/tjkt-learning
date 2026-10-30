import {newFoundationLab,runFoundationAction} from './foundation-draft-model.js';
export function mountFoundationLab(box){
 const topic=box.dataset.foundationDraft;let state=newFoundationLab(topic);
 const create=(tag,text)=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
 const fields=create('div'),buttons=create('div'),status=create('p'),history=create('ol'),inputs=new Map();
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const control=(label,key,options)=>{const wrapper=create('label',label+' '),input=create('select');
  for(const[value,title]of options){const option=create('option',title);option.value=String(value);input.append(option);}
  input.value=String(state[key]);inputs.set(key,input);input.addEventListener('change',()=>{state[key]=typeof state[key]==='boolean'?input.value==='true':key==='ram'?Number(input.value):input.value;if(key==='os'||key==='target'){state.installed=false;state.booted=false;}status.textContent='Pengaturan berubah. Jalankan pengujian baru.';});wrapper.append(input);fields.append(wrapper);return input;};
 const yesNo=[['true','Terpasang'],['false','Tidak terpasang']];
 if(topic==='vm'){
  control('Platform','platform',[['virtualbox','VirtualBox'],['workstation','VMware Workstation']]);
  control('RAM guest (host 16 GiB; cadangan 4 GiB)','ram',[[4,'4 GiB'],[8,'8 GiB'],[16,'16 GiB']]);
  control('ISO disetujui','media',yesNo);control('Segmen lab','isolated',[['true','Terisolasi'],['false','LAN tanpa izin']]);
 }else if(topic==='os'){
  control('OS desktop','os',[['linux-desktop','Linux desktop'],['windows','Windows desktop']]);
  control('Target','target',[['empty','Disk virtual kosong'],['host','Disk host berisi data']]);
  control('Media ISO','media',yesNo);
 }else control('Gateway PC A','gateway',[['192.168.10.1','192.168.10.1 — sesuai rencana'],['192.168.20.1','192.168.20.1 — di subnet lain'],['','Belum diatur']]);
 const actions=topic==='vm'?[['check','Uji rencana VM']]:topic==='os'?[['install','Jalankan installer model'],['eject','Lepas ISO'],['boot','Uji boot dari disk']]:[['test','Uji jalur'],['save','Simpan konfigurasi'],['reboot','Mulai ulang model']];
 for(const[action,title]of actions){const button=create('button',title);button.type='button';button.addEventListener('click',()=>{
  if(topic==='os'&&action==='install'&&state.installed){status.textContent='Instalasi model sudah selesai. Lepas ISO lalu uji boot; untuk percobaan baru tekan Mulai percobaan baru.';return;}
  const result=runFoundationAction(state,action);state=result.state;for(const[key,input]of inputs)input.value=String(state[key]);status.textContent=result.text;history.replaceChildren(...state.log.map(l=>create('li',l.text)));
 });buttons.append(button);}
 const reset=create('button','Mulai percobaan baru');reset.type='button';reset.addEventListener('click',()=>{box.replaceChildren();mountFoundationLab(box);});buttons.append(reset);
 box.append(fields,buttons,status,history);
}
for(const box of document.querySelectorAll('[data-foundation-draft]'))mountFoundationLab(box);
