// Compact conceptual models only. Never rewrites game controls or application UIs.
const selectors='.final-tools,.os-tools,.services-tools,.service-tools,.web-tools,.db-tools,.vpn-tools,.hosting-tools,.file-tools,.access-tools,.monitoring-tools,.topic-tools,.nat-tools,.route-tools,.qos-tools,.proxy-tools,.dual-tools,.fiber-tools,.cabling-tools,.address-tools,.installation-tools,.maintenance-tools,.replacement-tools,.layout-toolbar,.wan-toolbar,.ospf-toolbar,.share-tools,.ftp-tools,.monitor-tools,.nat-toolbar,.proxy-toolbar,.qos-toolbar,.server-toolbar,.webdb-tools';
const ignored='[data-virtual-lab],[data-terminal-lab],.virtualization-game,.os-admin-game,[data-game],.topic-2d-game,.final-game';
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
function compactToolbar(toolbar){
 if(toolbar.dataset.compactOperations||toolbar.closest(ignored)||toolbar.closest('[class*="-game"]'))return;
 const buttons=[...toolbar.children].filter(n=>n.tagName==='BUTTON'&&n.type!=='submit');if(buttons.length<6)return;
 toolbar.dataset.compactOperations='true';const palette=el('div'),label=el('label','Operasi model'),select=el('select'),run=el('button','Jalankan');run.type='button';palette.className='activity-operation';select.setAttribute('aria-label','Pilih operasi model');const placeholder=el('option','Pilih satu tindakan sesuai tujuan');placeholder.value='';select.append(placeholder);
 buttons.forEach((b,index)=>{const option=el('option',b.textContent);option.value=String(index);select.append(option);b.hidden=true;b.setAttribute('aria-hidden','true');});label.append(select);palette.append(label,run);toolbar.before(palette);
 const sync=()=>{buttons.forEach((b,i)=>{const option=select.options[i+1];if(option.textContent!==b.textContent)option.textContent=b.textContent;if(option.disabled!==b.disabled)option.disabled=b.disabled;});run.disabled=select.value===''||!!buttons[Number(select.value)]?.disabled;};
 select.addEventListener('change',sync);run.addEventListener('click',()=>{const b=buttons[Number(select.value)];if(!b||b.disabled||select.value==='')return;b.click();sync();});new MutationObserver(sync).observe(toolbar,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled']});sync();
}
export function simplifyActivities(root){
 if(!root)return;
 if(!document.querySelector('[data-activity-presentation-style]')){const link=el('link');link.rel='stylesheet';link.href=new URL('../css/activity-presentation.css',import.meta.url).href;link.dataset.activityPresentationStyle='true';document.head.append(link);}
 for(const toolbar of root.querySelectorAll(selectors))compactToolbar(toolbar);
 for(const node of root.querySelectorAll('[data-topic-activity]')){
  if(node.dataset.activityMode==='project-reference'||node.querySelector('[data-concept-model-label]'))continue;
  const label=el('p','Simulasi konsep — hubungan input dan hasil. Menu serta operasi pada model ini bukan antarmuka aplikasi asli.');label.dataset.conceptModelLabel='true';label.className='activity-kind';node.querySelector('h2')?.after(label);
 }
}
