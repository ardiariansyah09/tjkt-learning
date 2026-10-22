import { incidents,maintenanceResult,repairBoards,traceRepair } from '../assets/js/maintenance-model.js';
const assert=(v,m)=>{if(!v)throw Error(m);};
export function checkMaintenanceModels(){
 incidents.forEach(c=>{
  assert(!maintenanceResult(c.id,'',0,{link:0,application:0}).verified,'Unrepaired case passed');
  assert(!maintenanceResult(c.id,c.fix,2,{link:1,application:1}).verified,'Stale verification passed');
  assert(!maintenanceResult(c.id,c.fix,2,{link:2}).verified,'Partial verification passed');
  assert(maintenanceResult(c.id,c.fix,2,{link:2,application:2}).verified,'Fresh verification rejected');
 });
 repairBoards.forEach(b=>{
  assert(!traceRepair(b,b.initial).complete,'Board starts solved');
  assert(traceRepair(b,b.target).complete,'Unsolvable board');
  const cost=b.target.reduce((n,r,i)=>n+(r-b.initial[i]+4)%4,0);assert(cost<=b.budget,'Insufficient rotation budget');
  const broken=[...b.target];broken[b.path[1]]=(broken[b.path[1]]+1)%4;assert(!traceRepair(b,broken).complete,'Broken connector passed');
 });return {incidents:3,verificationVectors:12,boards:3};
}
export function checkMaintenanceLab(root){
 const state=()=>JSON.parse(root.dataset.result),click=s=>root.querySelector(s).click();
 assert(!state().verified,'Initial ticket verified');click('[data-maintenance-close]');assert(!state().closed,'Premature close');
 click('[data-maintenance-tool=physical]');assert(state().history.some(t=>t.includes('open pin 3')),'Physical evidence missing');
 click('[data-maintenance-change=channel]');click('[data-maintenance-verify=link]');click('[data-maintenance-verify=application]');assert(!state().verified,'Wrong repair accepted');
 click('[data-maintenance-change=rollback]');click('[data-maintenance-change=cord]');assert(!state().verified,'Change reused old evidence');
 click('[data-maintenance-tool=physical]');assert(state().history.at(-1).includes('delapan pin lulus')&&!state().history.at(-1).includes('open pin 3'),'Post-repair reading stale');
 click('[data-maintenance-verify=link]');assert(!state().verified,'Partial verification');click('[data-maintenance-verify=application]');click('[data-maintenance-close]');assert(state().closed,'Correct repair not closable');
 const select=root.querySelector('select');for(const [id,fix] of [['radio','channel'],['segment','mapping']]){select.value=id;select.dispatchEvent(new Event('change',{bubbles:true}));assert(!state().closed&&state().revision===0,'Case reset');click('[data-maintenance-tool=ip]');click(`[data-maintenance-change=${fix}]`);click('[data-maintenance-verify=link]');click('[data-maintenance-verify=application]');assert(state().verified,'Other case not repairable');}
 return {cases:3,wrongRepair:true,rollback:true,staleEvidence:true,closure:true};
}
export function checkMaintenanceGame(game){
 assert(game?.getClientRects().length,'Repair game invisible');assert(!game.querySelector('input[type=radio],select'),'Quiz in repair game');
 const state=()=>JSON.parse(game.dataset.state),click=s=>game.querySelector(s).click();
 for(let i=0;i<8;i++)click('[data-repair-tile="0"]');assert(state().lost,'Budget failure missing');click('[data-repair-action=reset]');assert(!state().lost&&state().moves===0,'Game reset');
 repairBoards.forEach((board,level)=>{board.target.forEach((target,i)=>{const turns=(target-state().rotations[i]+4)%4;for(let t=0;t<turns;t++)click(`[data-repair-tile="${i}"]`);});click('[data-repair-action=test]');assert(state().trace.complete,'Packet trace incomplete');assert(game.querySelectorAll('.repair-reached').length===board.path.length,'Packet visual missing');click('[data-repair-action=submit]');});
 assert(state().completed,'Three repairs incomplete');const saved=JSON.parse(localStorage.getItem('tjkt:pemeliharaan-kabel-nirkabel:course:v2'));assert(saved.passed.game===100,'Repair score not persisted');
 return {boards:3,packetTrace:true,budgetFailure:true,reset:true,score:100,noQuestions:true};
}
