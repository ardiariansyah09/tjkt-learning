window.__testInstaller=(selector,{manual=false,name='Guest-Uji'}={})=>{
 const root=document.querySelector(selector);if(!root)throw Error('Missing simulator '+selector);
 const q=s=>root.querySelector(s),assert=(v,label)=>{if(!v)throw Error(label);};
 const click=action=>{const b=q(`[data-action="${action}"]`);assert(b,'Missing action '+action);b.click();};
 const set=(field,value)=>{const node=q(`[name="${field}"]`);assert(node,'Missing field '+field);if(node.type==='checkbox')node.checked=value;else node.value=value;node.dispatchEvent(new Event('change',{bubbles:true}));};
 const next=()=>q('[data-form=installer]').requestSubmit();
 click('new');set('name',name);q('[data-form=create]').requestSubmit();click('start');
 let screens=[],guard=0;
 while(!q('.vml-desktop')){
  if(++guard>40)throw Error('Installer stalled: '+screens.join(','));
  const screen=q('[data-screen]')?.dataset.screen;screens.push(screen);
  if(screen==='welcome'){click('try');assert(q('.vml-live'),'Live session');click('return-installer');}
  if(screen==='license'){next();assert(q('[data-screen]').dataset.screen==='license','License guard');set('licensed',true);}
  if(screen==='disk'){
   set('diskId','1');next();assert(q('.vml-status').textContent.includes('terlindungi'),'Protected disk guard');set('diskId','0');
   if(manual){set('layout','manual');next();assert(q('[data-screen]').dataset.screen==='disk','Missing partitions guard');set('mount','/boot/efi');set('fs','fat32');set('size','1');click('partition');set('mount','/');set('fs','ext4');set('size','40');click('partition');assert(q('tbody').textContent.includes('ext4'),'Manual root partition');}
  }
  if(screen==='account'){set('username','siswa-uji');set('hostname','guest-uji');set('password','fiktif-ujilab');set('confirmation','fiktif-ujilab');}
  if(screen==='review'){next();assert(q('[data-screen]').dataset.screen==='review','Review confirmation guard');set('confirmed',true);}
  if(screen==='copy'){click('copy');continue;}
  if(screen==='restart'){click('restart');assert(q('.vml-status').textContent.includes('ISO masih'),'Boot media guard');click('eject');click('restart');continue;}
  next();
 }
 assert(q('.vml-desktop').textContent.includes('diverifikasi tanpa ISO'),'Installed disk boot');
 click('shutdown');click('snapshot');click('start');click('change-data');assert(q('.vml-desktop').textContent.includes('Versi 2'),'Changed data version');click('shutdown');click('restore');click('start');assert(q('.vml-desktop').textContent.includes('Versi 1'),'Snapshot restored data');
 return {name,screens,manual,protectedDiskRejected:true,mediaGuard:true,snapshotRestored:true};
};
