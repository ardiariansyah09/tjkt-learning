import { createLevel,newState,act } from '../assets/js/action-game-core.js';
const assert=(value,message)=>{if(!value)throw new Error(message);};
const plans=new Map();
export function planLevel(index){
  if(plans.has(index))return plans.get(index);
  const level=createLevel(index),start=newState(level),queue=[{state:start,previous:-1,action:null}],seen=new Set();let cursor=0,goal=-1;
  const key=state=>[...state.player,state.carrying,state.checkpoint,state.key,state.turn%4,[...state.batteries].sort().join(''),state.won].join(':');seen.add(key(start));
  while(cursor<queue.length){const current=queue[cursor];if(current.state.won){goal=cursor;break;}
    for(const action of ['interact','up','right','down','left','wait']){
      const next=act(level,current.state,action);if(next.lost||next.mistakes>current.state.mistakes)continue;const id=key(next);if(seen.has(id))continue;seen.add(id);queue.push({state:next,previous:cursor,action});
    }cursor++;
  }
  assert(goal>=0,`Level ${index} is not solvable without losing a life`);
  const actions=[];for(let index=goal;queue[index].previous>=0;index=queue[index].previous)actions.unshift(queue[index].action);
  plans.set(index,actions);return actions;
}
export function checkActionCore(){
  const level=createLevel(),initial=newState(level),wall=act(level,initial,'down');
  assert(wall.player.join()===initial.player.join()&&wall.energy<initial.energy,'Wall collision must cost energy without moving');
  assert(!act(level,initial,'interact').won,'Picking up cargo must not win immediately');
  let exhausted=initial;for(let i=0;i<60;i++)exhausted=act(level,exhausted,'down');assert(exhausted.lost,'Energy exhaustion must cause failure');
  const lengths=[];
  for(let i=0;i<3;i++){let state=newState(createLevel(i));const plan=planLevel(i);for(const action of plan)state=act(createLevel(i),state,action);assert(state.won&&state.checkpoint===4&&state.carrying&&state.key,'Victory requires cargo, four stations, key and delivery');lengths.push(plan.length);}
  return {levels:3,solutionLengths:lengths,collision:true,failure:true};
}
export function solveActionGame(game){
  assert(game,'Action game missing');
  assert(!game.querySelector('input[type=radio],select,.studio-game-options,[data-option-index]'),'Question/answer controls in gameplay');
  const canvas=game.querySelector('canvas'),state=()=>JSON.parse(game.dataset.state);
  game.querySelector('[data-game-action=pause]').click();const before=state().player.join();canvas.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}));assert(state().player.join()===before,'Paused game moved');game.querySelector('[data-game-action=pause]').click();
  game.querySelector('[data-game-action=down]').click();assert(state().player.join()===before&&state().energy<110,'Wall collision did not register');game.querySelector('[data-game-action=restart]').click();
  const keys={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',interact:'e',wait:' '};
  for(let level=0;level<3;level++){
    for(const action of planLevel(level))canvas.dispatchEvent(new KeyboardEvent('keydown',{key:keys[action],bubbles:true}));
    assert(state().won&&!state().lost&&state().checkpoint===4,`UI did not complete level ${level}`);
    if(level<2)game.querySelector('[data-game-action=next]').click();
  }
  assert(state().completed,'Three-level completion not recorded');
  return {mode:game.dataset.mode,levels:3,score:100,noQuestions:true,keyboard:true,pause:true,collision:true};
}
