import {topicGameDefinitions,newTopicGame,topicGameAction,topicGoal,ipv6ZeroRun} from '../assets/js/topic-games-model.js';
const assert=(v,m)=>{if(!v)throw Error('Topic game: '+m);};
export function topicGameSolution(id,level){let s=newTopicGame(id,level);const steps=[],doIt=(...a)=>{steps.push(a);s=topicGameAction(s,...a);assert(!s.lost,'solution exhausted '+id);};
 switch(s.kind){
 case 'tickets':for(let i=0;i<s.data.tickets.length;i++)for(let n=0;n<5;n++)doIt('advance',i,n===2&&s.data.tickets[i].fiber?1:0);break;
 case 'sensor':for(let i=0;i<s.data.samples.length;i++)doIt('collect');if(level===2)doIt('pin');if(level>0)doIt('summarize');doIt('uplink');doIt('send');break;
 case 'shop':doIt('price',55);if(level>0)doIt('train');for(let i=0;i<s.data.target;i++){doIt('buy');doIt('serve');}break;
 case 'radio':for(const [key,action]of [['a','sendA'],['b','sendB']])while(s.data[key]<s.data.target)doIt(s.data.interference.includes(s.data.slot)?'wait':action);break;
 case 'meter':doIt('wave',1310);doIt('path','reference');doIt('read');doIt('path','link');doIt('read');doIt('answer',s.data.loss);break;
 case 'safety':doIt('isolate');doIt('mat');doIt('dry');for(const[id,zone]of [['cable','tray'],['fiber','bin'],['component','mat'],['ewaste','recycle'],['tools','storage']])if(Object.hasOwn(s.data.positions,id))doIt('move',id,zone);break;
 case 'rack':doIt('panel',[4,8,12].find(n=>n>=s.data.count+1+s.data.reserve));for(let i=0;i<s.data.count;i++)doIt('plug',i,i+1);doIt('plug','uplink',s.data.capacity);break;
 case 'ipv6':for(let i=0;i<8;i++)doIt('normalize',i);{const run=ipv6ZeroRun(s.data.groups);if(run)doIt('compress',...run);else doIt('keep');}break;
 case 'delivery':while(s.data.job<s.data.jobs.length){const d=s.data,target=d.jobs[d.job],next=d.returning?(d.node==='switch'?'pc':d.node==='router'?'switch':d.node==='internet'?'router':'switch'):(d.node==='pc'?'switch':d.node==='switch'?(target==='internet'?'router':target):'internet');doIt('route',next);}break;
 case 'resilience':for(const[a,b]of (level===0?[['S','A'],['S','B'],['S','C'],['S','D']]:[['S','A'],['A','B'],['B','C'],['C','D'],['S','D']]))doIt('edge',a,b);break;
 case 'workshop':doIt('power');doIt('install',s.data.required);doIt('power');break;
 case 'envelopes':for(const n of s.data.required)doIt('wrap',n);doIt('send');for(const n of [...s.data.required].reverse())doIt('unwrap',n);break;
 case 'blocks':for(let room=0;room<s.data.hosts.length;room++){const needed=2**Math.ceil(Math.log2(s.data.hosts[room]+2));let i=s.data.free.findIndex(b=>b.size>=needed);assert(i>=0,'free aligned block');while(s.data.free[i].size>needed)doIt('split',i);doIt('allocate',room,i);}break;
 case 'windows':for(let i=0;i<2;i++){doIt('lease',i);doIt('query',i);for(let n=0;n<s.data.target;n++)doIt('download',i);if(i===0)doIt('release',i);}break;
 case 'diagnostic':for(const n of ['link','ip','dns'])doIt('inspect',n);if(!s.data.cable)doIt('repair','cable');if(s.data.gateway!==1)doIt('repair','gateway');if(s.data.dns!==2)doIt('repair','dns');doIt('probe');break;
 case 'frames':while(s.data.index<s.data.frames.length){const d=s.data,f=d.frames[d.index],vlan=['A','B'].includes(f.dst)?10:20;if(vlan!==f.vlan)doIt('drop');else if(d.mac[f.dst])doIt('forward',f.dst);else doIt('flood');}break;
 }
 assert(topicGoal(s),'solution goal '+id+' '+level);doIt('test');assert(s.won,'solution win '+id);return steps;
}
export function checkTopicGamesModels(){
 const kinds=new Set();let levels=0;
 for(const[id,def]of Object.entries(topicGameDefinitions)){assert(!kinds.has(def.kind),'duplicate mechanics '+id);kinds.add(def.kind);for(let level=0;level<3;level++){let s=newTopicGame(id,level);const before=JSON.stringify(s);assert(!topicGameAction(s,'test').won,'early completion '+id);assert(JSON.stringify(s)===before,'model mutates previous state');for(const a of topicGameSolution(id,level))s=topicGameAction(s,...a);assert(s.won&&!s.lost,'solvable '+id);let failed=newTopicGame(id,level);for(let i=0;i<failed.budget+1;i++)failed=topicGameAction(failed,'test');assert(failed.lost&&!failed.won,'failure/reset needed '+id);levels++;}}
 let s=newTopicGame('k3-budaya-kerja');s=topicGameAction(s,'dry');assert(!s.data.dry,'unsafe cleanup accepted');s=topicGameAction(s,'move','component','mat');assert(s.data.positions.component==='table','ESD before preparation');
 s=newTopicGame('perangkat-jaringan');s=topicGameAction(s,'install',s.data.required);assert(s.data.part==='faulty','powered replacement');
 s=newTopicGame('ipv6-dasar',1);for(let i=0;i<8;i++)s=topicGameAction(s,'normalize',i);s=topicGameAction(s,'compress',5,6);assert(!topicGoal(s),'canonical tie chooses first run');
 s=newTopicGame('protokol-layanan');s=topicGameAction(s,'lease',0);s=topicGameAction(s,'lease',1);assert(s.data.owner===0,'pool double allocated');
 s=newTopicGame('switching-vlan');s=topicGameAction(s,'forward','C');assert(s.data.index===0,'VLAN leak accepted');
 s=newTopicGame('troubleshooting');for(const n of ['link','ip','dns'])s=topicGameAction(s,'inspect',n);s=topicGameAction(s,'repair','cable');s=topicGameAction(s,'admin');s=topicGameAction(s,'probe');assert(!topicGoal(s),'allow-all considered repair');
 s=newTopicGame('proses-bisnis-tjkt',2);s=topicGameAction(s,'wait');s=topicGameAction(s,'wait');for(let i=0;i<5;i++)s=topicGameAction(s,'advance',0,0);assert(s.lost,'late handover accepted');
 s=newTopicGame('wawasan-tjkt',1);s=topicGameAction(s,'collect');s=topicGameAction(s,'collect');s=topicGameAction(s,'summarize');assert(!s.data.summarized,'partial aggregation accepted');s=topicGameAction(s,'collect');s=topicGameAction(s,'summarize');const queue=JSON.stringify(s.data.queue);s=topicGameAction(s,'summarize');assert(JSON.stringify(s.data.queue)===queue,'reaggregated summary counted twice');
 return {distinctMechanics:kinds.size,levels,negativeGuards:true};
}
export function checkTopicGameUI(game){
 assert(game?.getClientRects().length,'game not visible');assert(!game.querySelector('input[type=radio],canvas,.action-game'),'old maze/quiz still present');
 assert(game.querySelector('.pg-guide').textContent.length>15&&game.querySelector('.pg-help').textContent.length>50,'missing topic instructions');const id=document.body.dataset.moduleId,state=()=>JSON.parse(game.dataset.state),control=a=>game.querySelector(`[data-pg-control="${a}"]`).click();
 assert(getComputedStyle(game.querySelector('.pg-hud')).color==='rgb(255, 255, 255)','HUD contrast overridden by topic CSS');
 const bounds=game.getBoundingClientRect(),guide=game.querySelector('.pg-guide').getBoundingClientRect();assert(guide.left>=bounds.left&&guide.right<=bounds.right+1,'instructions clipped');
 control('reset');game.querySelector('[data-pg-action=test]').click();assert(!state().won,'UI early completion');control('retry');
 const drag=(source,target)=>{assert(source?.draggable&&target,'drag objects missing');const dataTransfer=new DataTransfer();source.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer}));target.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer}));};
 if(state().kind==='workshop'){game.querySelector('[data-pg-action=power]').click();drag([...game.querySelectorAll('[data-pg-select]')].find(n=>n.dataset.pgSelect===state().data.required),game.querySelector('[data-module-socket]'));assert(state().data.part===state().data.required,'part placement');control('retry');}
 if(state().kind==='envelopes'){drag([...game.querySelectorAll('[data-pg-select]')].find(n=>n.dataset.pgSelect==='TCP'),game.querySelector('[data-packet-wrap]'));assert(state().data.layers[0]==='TCP','header placement');control('retry');}
 if(state().kind==='frames'){game.querySelector('[data-pg-action=flood]').click();drag(game.querySelector('[data-active-frame]'),game.querySelector('[data-vlan-port=A]'));assert(state().data.index===2,'frame delivery');control('retry');}
 if(state().kind==='radio'){drag(game.querySelector('[data-radio-frame=a]'),game.querySelector('[data-radio-station=b]'));assert(state().data.a===1,'radio frame delivery');control('retry');}
 if(state().kind==='shop'){game.querySelector('[data-pg-action=buy]').click();drag(game.querySelector('[data-shop-kit]'),game.querySelector('[data-shop-order="0"]'));assert(state().data.orders===1,'kit delivered to order');control('retry');}
 for(let level=0;level<3;level++){
  for(const[a,v,o]of topicGameSolution(id,level)){
   if(['plug','move','lay','allocate','wrap','install'].includes(a)){const token=[...game.querySelectorAll('[data-pg-select]')].find(n=>n.dataset.pgSelect===String(v));assert(token,'selection '+a+' '+v);token.click();}
   if(a==='compress'){for(const[name,value]of [['zero-start',v],['zero-end',o]]){const input=game.querySelector(`[name=${name}]`);input.value=value;input.dispatchEvent(new Event('change'));}}
   if(a==='price'||a==='answer'){game.querySelector(`[name=${a==='price'?'price':'loss'}]`).value=v;}
   const key=JSON.stringify([v??null,o??null]),b=[...game.querySelectorAll('[data-pg-action]')].find(n=>n.dataset.pgAction===a&&(n.dataset.pgArgs===key||['price','answer'].includes(a)));
   assert(b&&!b.disabled&&b.getClientRects().length,'real control '+a+' '+key);b.click();
  }
  assert(state().won,'UI level '+level+' '+id);control('next');
 }
 assert(state().completed,'all levels not completed');return {levels:3,distinctMechanic:state().kind,realControls:true,score:100};
}
export async function checkAllTopicGameUIs(){
 const {mountTopicGame}=await import('../assets/js/topic-games.js'),original=document.body.dataset.moduleId,results=[];
 try{for(const id of Object.keys(topicGameDefinitions)){document.body.dataset.moduleId=id;const host=document.createElement('div');document.body.append(host);let completed=0;try{const g=mountTopicGame(host,{moduleId:id,onComplete:()=>completed++});assert(mountTopicGame(host,{moduleId:id})===g&&host.querySelectorAll('.topic-2d-game').length===1,'duplicate mount '+id);const result=checkTopicGameUI(host.querySelector('.topic-2d-game'));assert(completed===1,'completion callback exactly once '+id);results.push({id,...result});g.dispose();}finally{host.remove();}}}finally{document.body.dataset.moduleId=original;}
 return {models:checkTopicGamesModels(),games:results};
}
