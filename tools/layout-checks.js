import { inspectRoute,layoutEstimate,cableLevels,blockedPoint,equalPoint } from '../assets/js/layout-model.js';
const assert=(condition,message)=>{if(!condition)throw Error(message);};
export function solveCableLevel(config){
  const queue=[{point:config.start,steps:[]}],seen=new Set([config.start.join()]);
  for(let i=0;i<queue.length;i++){const {point,steps}=queue[i];if(equalPoint(point,config.goal))return steps;
    for(const [key,dx,dy] of [['ArrowUp',0,-1],['ArrowDown',0,1],['ArrowLeft',-1,0],['ArrowRight',1,0]]){
      const next=[point[0]+dx,point[1]+dy];if(next[0]<0||next[1]<0||next[0]>10||next[1]>6||blockedPoint(next,config.obstacles)||seen.has(next.join())||steps.length>=config.spool)continue;seen.add(next.join());queue.push({point:next,steps:[...steps,key]});
    }
  }throw Error('Cable level unsolvable');
}
export function checkLayoutModels(){
  const p=[[2,2],[2,13],[22,13],[22,12]],a=layoutEstimate(p,100,10,2),b=layoutEstimate(p,200,10,2);
  assert(a.valid&&a.length===32&&Math.abs(a.cable-37.2)<1e-8&&a.paperCm===32,'Layout baseline');
  assert(b.paperCm===16&&b.cable===a.cable,'Scale must not change real length');
  assert(!inspectRoute([[2,7],[20,7]]).valid,'Segment through forbidden area');
  assert(!inspectRoute([[2,2],[22,12]]).valid,'Diagonal not supported');
  assert(!inspectRoute([[-1,2]]).valid,'Out of bounds');
  const lengths=cableLevels.map(c=>solveCableLevel(c).length);return {vectors:5,levelLengths:lengths};
}
export function checkLayoutGame(game){
  assert(game?.getClientRects().length,'Cable game not visible');assert(!game.querySelector('input[type=radio],select'),'Quiz in cable game');
  const svg=game.querySelector('svg'),state=()=>JSON.parse(game.dataset.state),key=key=>svg.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));
  key('ArrowLeft');key('ArrowLeft');key('ArrowLeft');key('ArrowLeft');assert(state().lost,'Three collisions cause failure');
  game.querySelector('[data-cable-action=reset]').click();key('ArrowRight');assert(state().used===1,'Cable movement');game.querySelector('[data-cable-action=undo]').click();assert(state().used===0,'Cable undo');
  cableLevels.forEach((config,i)=>{solveCableLevel(config).forEach(key);assert(state().won,'Cable route did not reach destination');if(i<2)game.querySelector('[data-cable-action=next]').click();});
  assert(state().completed,'Three cable levels incomplete');const saved=JSON.parse(localStorage.getItem('tjkt:desain-topologi-arsitektur:course:v2'));assert(saved.passed.game===100,'Cable completion not saved');
  return {levels:3,noQuestions:true,movement:true,undo:true,failure:true,score:100};
}
