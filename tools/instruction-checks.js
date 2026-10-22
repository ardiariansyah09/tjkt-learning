import { activityTargets,mountActivityInstructions } from '../assets/js/activity-instructions.js';
const assert=(v,m)=>{if(!v)throw Error(m);};
export function checkActivityInstructions(){
 const root=document.querySelector('.lesson-content'),moduleId=document.body.dataset.moduleId;
 const targets=activityTargets(root,moduleId);
 targets.forEach(({node,key})=>assert([...node.children].some(n=>n.classList.contains('activity-instructions')),`Instructions were not mounted by page: ${moduleId}/${key}`));
 // Exercise idempotence after redraw, without resetting activity state or inputs.
 const values=[...root.querySelectorAll('input,select,textarea')].map(n=>[n,n.value,n.checked]);
 mountActivityInstructions(root,moduleId);mountActivityInstructions(root,moduleId);
 values.forEach(([n,value,checked])=>assert(n.value===value&&n.checked===checked,'Guide mount changed learner inputs'));
 let visible=0;
 targets.forEach(({node,data,key})=>{
  const guides=[...node.children].filter(n=>n.classList.contains('activity-instructions'));
  assert(guides.length===1,`Missing/duplicate activity instructions: ${moduleId}/${key}`);const box=guides[0];
  assert(box.querySelectorAll('ol>li').length>=3,`No actionable steps: ${key}`);
  for(const label of ['Tujuan:','Tanda selesai:','Jika ingin mengulang atau memperbaiki:'])assert(box.textContent.includes(label),`Missing instruction section ${key}/${label}`);
  assert(box.textContent.includes(data.steps[0]),`Wrong contextual instructions: ${key}`);
  const control=node.querySelector('button,input,select,textarea,canvas,[role=application]');
  if(control)assert(Boolean(box.compareDocumentPosition(control)&Node.DOCUMENT_POSITION_FOLLOWING),`Instructions appear after controls: ${key}`);
  if(node.getClientRects().length){visible++;assert(box.getClientRects().length,'Guide hidden on visible activity');}
 });
 return {targets:targets.length,visible,idempotent:true,inputsPreserved:true};
}
