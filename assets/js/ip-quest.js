// IP Quest: three independent 2D games. Progress is dispatched only after all missions finish.
const KEY='tjkt:ipv4-subnetting:ipquest:v1';
const el=(tag,cls='',text='')=>{const n=document.createElement(tag);n.className=cls;n.textContent=text;return n;};
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const ipnum=s=>s.split('.').reduce((a,x)=>(a*256+Number(x))>>>0,0);
const privateIP=s=>{const a=s.split('.').map(Number);return a[0]===10||(a[0]===172&&a[1]>=16&&a[1]<=31)||(a[0]===192&&a[1]===168);};
const mask=p=>Array.from({length:4},(_,i)=>{const n=Math.max(0,Math.min(8,p-i*8));return n?256-2**(8-n):0;}).join('.');
const usable=p=>2**(32-p)-2;
const best=(host)=>{for(let p=30;p>=16;p--)if(usable(p)>=host)return p;return 16;};
export function mountIPQuest(root){
 const old=root.querySelector('.stage8-panel.arcade');if(old)old.remove();
 const panel=el('section','ipq'),head=el('div','ipq-head'),heading=el('h2','','🎮 IP QUEST 2D · SUBNET ADVENTURE'),hud=el('div','ipq-hud'),arena=el('div','ipq-arena'),foot=el('div','ipq-foot');
 heading.textContent='🎮 IP QUEST 2D · SUBNET ADVENTURE';head.append(heading,hud);panel.append(head,arena,foot);root.append(panel);
 let mission=0,results=[null,null,null],cleanup=()=>{},muted=false;
 const names=['IP Address Hunter','Subnet Escape','VLSM City Builder'],max=[30,35,35];
 function tone(f=560){if(muted)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C(),osc=ctx.createOscillator(),g=ctx.createGain();osc.type='sine';osc.frequency.value=f;g.gain.setValueAtTime(.07,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.12);osc.connect(g).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.13);osc.onended=()=>ctx.close();}catch{}}
 function drawHud(){const score=results.reduce((a,x)=>a+(x||0),0);hud.textContent=`MISI ${Math.min(mission+1,3)}/3 · ${score}/100`;}
 function btn(text,fn,cls='ipq-btn'){const b=el('button',cls,text);b.type='button';b.onclick=fn;return b;}
 function clear(){cleanup();cleanup=()=>{};arena.replaceChildren();foot.replaceChildren();drawHud();}
 function finish(earned){cleanup();cleanup=()=>{};results[mission]=earned;tone(880);arena.append(el('h3','ipq-win',`Misi selesai! +${earned}/${max[mission]} poin`));foot.replaceChildren(btn(mission===2?'Lihat hasil akhir →':'Misi berikutnya →',()=>{mission++;render();}));drawHud();}
 function summary(){clear();const total=results.reduce((a,b)=>a+b,0);let prev={best:0,attempts:0};try{prev=JSON.parse(localStorage.getItem(KEY))||prev;}catch{}const data={best:Math.max(prev.best||0,total),attempts:(prev.attempts||0)+1,last:total,results,date:new Date().toISOString()};try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}
 arena.append(el('h2','',total>=80?'🏆 IP QUEST BERHASIL!':'🔁 MISI BELUM LULUS'),el('p','',`Skor ${total}/100 · Rekor ${data.best}/100 · Percobaan ${data.attempts}`));names.forEach((n,i)=>arena.append(el('p','',`${n}: ${results[i]}/${max[i]} ${results[i]===max[i]?'⭐⭐⭐':results[i]>=max[i]*.6?'⭐⭐':'⭐'}`)));
 if(total>=80)queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tjkt:assessment',{detail:{lessonId:'games',score:total,answeredAll:true}})));
 foot.append(btn('Main lagi ↻',()=>{mission=0;results=[null,null,null];render();}));}
 function hunter(){clear();arena.append(el('h3','','🕹️ MISI 1 — IP ADDRESS HUNTER'),el('p','','Gerakkan teknisi dengan WASD / tombol panah. Ambil 6 alamat IP PRIVAT (🟢), hindari IP publik (🔴). Keenam IP privat tersedia sejak awal. Waktu 55 detik.'));
 const stats=el('p','ipq-stats'),field=el('div','ipq-field'),player=el('div','ipq-player','🧑‍💻');field.append(player);arena.append(stats,field);
 const touch=el('div','ipq-controls');arena.append(touch);
 let x=50,y=50,collected=0,lives=3,time=55,done=false;
 const items=[];
 const privatePool=['10.0.0.5','192.168.1.10','172.16.4.8','10.10.2.3','192.168.20.4','172.31.2.9'];
 const publicPool=['8.8.8.8','1.1.1.1','9.9.9.9','208.67.222.222'];
 function place(ip){
  const n=el('div',`ipq-item ${privateIP(ip)?'good':'bad'}`,ip);
  let xx=12,yy=15;
  for(let tries=0;tries<120;tries++){
   xx=rand(12,80);yy=rand(12,80);
   if(Math.hypot(xx-x,yy-y)<16)continue;
   if(items.some(i=>i.active&&Math.hypot(xx-i.x,yy-i.y)<17))continue;
   break;
  }
  n.style.left=xx+'%';n.style.top=yy+'%';field.append(n);
  items.push({node:n,ip,x:xx,y:yy,active:true});
 }
 function spawn(){
  items.forEach(i=>i.node.remove());items.length=0;
  // A full run always starts with six private addresses; never depend on a random slice.
  [...privatePool].sort(()=>Math.random()-.5).forEach(place);
  [...publicPool].sort(()=>Math.random()-.5).slice(0,2).forEach(place);
 }
 function replenish(){
  // Guard against soft-locks: enough collectible private addresses must remain.
  const remaining=6-collected;
  const activeGood=items.filter(i=>i.active&&privateIP(i.ip)).length;
  for(let i=activeGood;i<remaining;i++){
   const available=privatePool.filter(ip=>!items.some(it=>it.active&&it.ip===ip));
   place(available[rand(0,available.length-1)]||privatePool[rand(0,privatePool.length-1)]);
  }
 }
 function statsDraw(){stats.textContent=`🟢 ${collected}/6 IP privat · ❤️ ${lives} · ⏱️ ${time}s`;player.style.left=x+'%';player.style.top=y+'%';}
 function end(){if(done)return;done=true;clearInterval(timer);window.removeEventListener('keydown',onKey);finish(Math.round(30*collected/6));}
 function move(dx,dy){if(done)return;x=Math.max(2,Math.min(96,x+dx));y=Math.max(2,Math.min(92,y+dy));for(const it of items){if(!it.active||Math.hypot(x-it.x,y-it.y)>9)continue;it.active=false;it.node.remove();if(privateIP(it.ip)){collected++;tone(660);}else{lives--;tone(180);}if(collected>=6||lives<=0){statsDraw();end();return;}}replenish();statsDraw();}
 const onKey=e=>{const k=e.key.toLowerCase();const dirs={arrowup:[0,-4],w:[0,-4],arrowdown:[0,4],s:[0,4],arrowleft:[-4,0],a:[-4,0],arrowright:[4,0],d:[4,0]};if(dirs[k]){e.preventDefault();move(...dirs[k]);}};window.addEventListener('keydown',onKey);
 [['⬆',0,-4],['⬅',-4,0],['⬇',0,4],['➡',4,0]].forEach(([t,dx,dy])=>touch.append(btn(t,()=>move(dx,dy),'ipq-dir')));
 spawn();statsDraw();const timer=setInterval(()=>{time--;statsDraw();if(time<=0)end();},1000);cleanup=()=>{done=true;clearInterval(timer);window.removeEventListener('keydown',onKey);};
 }
 function escapeGame(){
  clear();
  arena.append(el('h3','','🔐 MISI 2 — SUBNET ESCAPE'),el('p','','Jelajahi koridor jaringan dan buka lima gerbang CIDR. Gunakan tombol panah kiri/kanan atau kontrol di layar; tiap gerbang hanya terbuka setelah konfigurasi subnet yang benar.'));
  const gates=[
   {p:26,q:'Pilih subnet mask /26.',a:'255.255.255.192',options:['255.255.255.192','255.255.255.224','255.255.255.128']},
   {p:27,q:'Berapa host usable pada /27?',a:'30',options:['14','30','62']},
   {p:28,q:'Pilih subnet mask /28.',a:'255.255.255.240',options:['255.255.255.248','255.255.255.240','255.255.255.224']},
   {p:29,q:'Berapa host usable pada /29?',a:'6',options:['8','6','14']},
   {p:25,q:'Pilih subnet mask /25.',a:'255.255.255.128',options:['255.255.255.0','255.255.255.192','255.255.255.128']}
  ];
  const width=12,height=7,routeY=3,gateXs=[2,4,6,8,10],blocked=new Set(['1,2','3,4','5,2','7,4','9,2']);
  const player=el('div','ipq-maze-player','🧑‍💻'),board=el('div','ipq-maze'),status=el('p','ipq-stats'),prompt=el('section','ipq-maze-prompt'),controls=el('div','ipq-controls');
  let x=0,lives=3,points=0,opened=new Set(),activeGate=null,finished=false;
  board.setAttribute('role','grid');board.setAttribute('aria-label','Labirin 2D untuk menyelesaikan gerbang subnet');
  arena.append(status,board,prompt,controls);
  function draw(){
   board.replaceChildren();
   for(let y=0;y<height;y++)for(let column=0;column<width;column++){
    const cell=el('div','ipq-maze-cell');
    const onRoute=y===routeY;
    const sidePocket=(y===routeY-1||y===routeY+1)&&column%2===1;
    if(onRoute||sidePocket)cell.classList.add('is-path');else cell.classList.add('is-wall');
    if(blocked.has(`${column},${y}`))cell.classList.add('is-obstacle');
    const gateIndex=gateXs.indexOf(column);
    if(onRoute&&gateIndex>=0){cell.classList.add(opened.has(gateIndex)?'is-open':'is-gate');cell.textContent=opened.has(gateIndex)?'✓':'🔒';cell.setAttribute('aria-label',`Gerbang ${gateIndex+1} ${opened.has(gateIndex)?'terbuka':'terkunci'}`);}
    else if(onRoute&&column===width-1){cell.classList.add('is-exit');cell.textContent='🚪';}
    if(onRoute&&column===x){cell.append(player);cell.classList.add('has-player');}
    cell.setAttribute('role','gridcell');board.append(cell);
   }
   player.textContent='🧑‍💻';status.textContent=`Gerbang ${opened.size}/5 · ⭐ ${points}/35 · ❤️ ${lives}`;
  }
  function showGate(index){
   activeGate=index;const gate=gates[index];prompt.replaceChildren(el('strong','',`GERBANG ${index+1}/5 · CIDR /${gate.p}`),el('p','',gate.q));
   const options=el('div','ipq-choices');
   gate.options.forEach(answer=>options.append(btn(answer,()=>{
    if(answer===gate.a){opened.add(index);activeGate=null;points+=7;tone(760);prompt.replaceChildren(el('p','ipq-built','✓ Gerbang terbuka. Lanjutkan menyusuri koridor.'));draw();if(x===width-1)end();return;}
    lives--;tone(160);prompt.querySelector('.ipq-maze-error')?.remove();prompt.append(el('p','ipq-maze-error',`Konfigurasi belum tepat. Periksa kembali prefix /${gate.p}.`));draw();if(lives<=0)end();
   })));
   prompt.append(options);
  }
  function step(dx){
   if(finished||activeGate!==null)return;
   const next=x+dx;if(next<0||next>=width||blocked.has(`${next},${routeY}`))return;
   const gateIndex=gateXs.indexOf(next);
   if(gateIndex>=0&&!opened.has(gateIndex)){x=next;draw();showGate(gateIndex);return;}
   x=next;draw();if(x===width-1)end();
  }
  function end(){if(finished)return;finished=true;window.removeEventListener('keydown',onKey);cleanup=()=>{};finish(points);}
  const onKey=event=>{const moves={arrowleft:-1,a:-1,arrowright:1,d:1};const dx=moves[event.key.toLowerCase()];if(dx!==undefined){event.preventDefault();step(dx);}};
  window.addEventListener('keydown',onKey);
  [['⬅',-1],['➡',1]].forEach(([label,dx])=>controls.append(btn(label,()=>step(dx),'ipq-dir')));
  cleanup=()=>{finished=true;window.removeEventListener('keydown',onKey);};
  draw();prompt.append(el('p','ipq-stats','Bergeraklah ke kanan untuk mencapai gerbang pertama.'));
 }
 function city(){
  clear();
  arena.append(el('h3','','🏙️ MISI 3 — VLSM CITY BUILDER'),el('p','','Bangun lima subnet untuk kota sekolah pada peta alamat 192.168.10.0/24. Alokasikan ruang yang cukup untuk tiap gedung tanpa tumpang tindih; setiap petak mewakili 4 alamat.'));
  const rooms=[{name:'🏫 Lab TJKT',hosts:50},{name:'🏢 Ruang Guru',hosts:20},{name:'📚 Perpustakaan',hosts:10},{name:'📷 CCTV',hosts:5},{name:'🖨️ Printer',hosts:2}];
  const status=el('p','ipq-stats'),cityMap=el('div','ipq-city-map'),blocks=el('div','ipq-address-map'),choices=el('div','ipq-choices'),history=el('div','ipq-history'),feedback=el('p','ipq-city-feedback');
  let idx=0,points=0,offset=0,lives=3;const allocations=[];
  arena.append(status,cityMap,blocks,choices,feedback,history);
  blocks.setAttribute('role','img');blocks.setAttribute('aria-label','Peta 256 alamat dalam blok 192.168.10.0/24');
  function draw(){
   status.textContent=`Gedung ${Math.min(idx+1,rooms.length)}/5 · ⭐ ${points}/35 · ❤️ ${lives} · ${offset}/256 alamat dialokasikan`;
   cityMap.replaceChildren();
   rooms.forEach((room,index)=>{
    const building=el('section',`ipq-building${index<idx?' is-built':''}`);
    building.append(el('strong','',room.name),el('span','',`${room.hosts} host`));
    if(allocations[index])building.append(el('small','',`/${allocations[index].prefix} · ${allocations[index].network}`));
    else building.append(el('small','',index===idx?'PILIH SUBNET':'Menunggu giliran'));
    cityMap.append(building);
   });
   blocks.replaceChildren();
   const addressUnits=Array(64).fill(null);
   allocations.forEach((allocation,index)=>{
    const unitStart=allocation.start/4,unitCount=allocation.size/4;
    for(let unit=unitStart;unit<unitStart+unitCount;unit++)addressUnits[unit]=index;
   });
   addressUnits.forEach((owner,index)=>{
    const unit=el('span',`ipq-address-unit${owner===null?'':` is-allocated allocation-${owner}`}`);
    unit.setAttribute('aria-label',owner===null?`Alamat ${index*4} sampai ${index*4+3} tersedia`:`Alamat dialokasikan untuk ${rooms[owner].name}`);
    blocks.append(unit);
   });
   choices.replaceChildren();
   if(idx>=rooms.length)return;
   const room=rooms[idx],required=best(room.hosts),reserve=rooms.slice(idx+1).reduce((sum,nextRoom)=>sum+2**(32-best(nextRoom.hosts)),0);
   [24,25,26,27,28,29,30].forEach(prefix=>{
    const size=2**(32-prefix),fits=usable(prefix)>=room.hosts&&offset%size===0&&offset+size+reserve<=256;
    const option=btn(`/${prefix} · ${usable(prefix)} host`,()=>allocate(prefix),'ipq-prefix-card');
    option.disabled=!fits;option.setAttribute('aria-label',`Pilih prefix /${prefix}, ${usable(prefix)} host usable${fits?'':' tidak sesuai'}`);
    choices.append(option);
   });
   function allocate(prefix){
    if(!fitsPrefix(prefix,room.hosts,offset)){lives--;tone(160);feedback.textContent=`/${prefix} tidak muat, tidak sejajar, atau melewati batas blok. Pilih ukuran yang valid.`;draw();if(lives<=0)finish(points);return;}
    const size=2**(32-prefix),ip=`192.168.10.${offset}`,optimal=prefix===required;
    allocations.push({prefix,start:offset,size,network:ip});
    history.append(el('p',optimal?'ipq-built':'ipq-miss',`${optimal?'✓':'↗'} ${room.name}: ${ip}/${prefix} · ${usable(prefix)} host usable${optimal?' — paling efisien':' — valid, tetapi menyisakan lebih banyak alamat'}`));
    points+=optimal?7:4;offset+=size;idx++;feedback.textContent=optimal?'Subnet efisien berhasil ditempatkan pada peta alamat.':'Subnet valid berhasil dibangun; alokasi yang lebih kecil akan menghemat ruang alamat.';tone(optimal?730:500);draw();
    if(idx>=rooms.length)finish(points);
   }
   function fitsPrefix(prefix,hosts,start){const size=2**(32-prefix);return usable(prefix)>=hosts&&start%size===0&&start+size+reserve<=256;}
  }
  draw();
 }
 function render(){if(mission>=3){summary();return;}clear();arena.append(el('p','ipq-intro',`MISI ${mission+1}/3 · ${names[mission]} · Maksimum ${max[mission]} poin`));const start=btn('▶ MULAI MISI',()=>[hunter,escapeGame,city][mission]());foot.append(start,btn(muted?'🔇 Suara mati':'🔊 Suara aktif',()=>{muted=!muted;render();},'ipq-btn ipq-alt'));}
 render();
 // Remove listeners and timers when navigating to another lesson.
 const observer=new MutationObserver(()=>{if(!panel.isConnected){cleanup();observer.disconnect();}});observer.observe(document.getElementById('lessonContent')||document.body,{childList:true,subtree:false});
}
