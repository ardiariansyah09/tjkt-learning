import { studioPacks } from './studio-data.js';
import { createLevel,newState,act,at,earnedScore } from './action-game-core.js';

const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const themes={
  'proses-bisnis-tjkt':['Service Courier','Antarkan berkas pelanggan melalui survei, rencana, implementasi, dan penerimaan.','Berkas layanan'],
  'wawasan-tjkt':['Sensor Expedition','Antarkan token sensor melalui edge, jaringan, dan cloud sambil mengelola energi.','Data sensor'],
  'profesi-kewirausahaan-tjkt':['Venture Delivery','Antarkan proposal melalui kompetensi, pelanggan, nilai layanan, dan operasi.','Proposal'],
  'sistem-telekomunikasi-dasar':['Telecom Relay','Bawa pesan melalui sumber, pemancar, kanal, dan penerima di tiga lintasan.','Pesan'],
  'alat-ukur-tjkt':['Measure Patrol','Antarkan catatan melalui inspeksi, pemilihan alat, pengukuran, dan laporan.','Catatan ukur'],
  'k3-budaya-kerja':['Safety Patrol','Bawa laporan inspeksi melalui empat pos. Hindari zona bahaya; avatar tidak menangani sumber listrik atau fiber aktif.','Laporan'],
  'perencanaan-jaringan':['Blueprint Courier','Bawa rancangan melalui pos pengguna, port, gateway, dan dokumentasi sebelum diserahkan.','Blueprint'],
  'ipv6-dasar':['IPv6 Packet Run','Antarkan token paket melalui pos konfigurasi IPv6. Kunci adalah mekanik permainan, bukan pengganti routing nyata.','Paket IPv6'],
  'pengenalan-jaringan':['Packet Courier','Ambil paket di depot, aktifkan pos komunikasi, dan antarkan ke gerbang tujuan.','Paket'],
  'topologi-jaringan':['Topology Runner','Temukan jalan memutar di antara penghalang dan aktifkan empat pos jaringan.','Token jalur'],
  'perangkat-jaringan':['Device Delivery','Antarkan modul layanan melalui empat pos perangkat. Hindari gangguan di koridor.','Modul'],
  'media-transmisi':['Signal Runner','Bawa token sinyal melewati pos media dan alat uji tanpa kehabisan energi.','Sinyal'],
  'osi-tcpip':['Encapsulation Run','Bawa token data melalui pos aplikasi, transport, IP, dan link secara berurutan.','Data'],
  'ipv4-subnetting':['Subnet Courier','Antarkan paket melalui pos host, subnet, gateway, dan tujuan; ambil token untuk membuka gerbang.','Paket IPv4'],
  'protokol-layanan':['Service Delivery','Bawa permintaan layanan melewati pos komunikasi dan serahkan pada gerbang keluar.','Request'],
  'troubleshooting':['Network Rescue Run','Antarkan laporan pemeriksaan melalui pos link, IP, gateway, dan DNS; hindari gangguan.','Laporan'],
  'switching-vlan':['VLAN Transit','Bawa frame melalui pos access, trunk, segmen tujuan, dan Layer 3 pada model permainan.','Frame']
};

export function mountActionGame(root,{moduleId,mode='2d',onComplete=()=>{}}){
  const pack=studioPacks[moduleId];if(!pack)return;
  const theme=themes[moduleId];let levelIndex=0,level=createLevel(0),state=newState(level),scores=[],completed=false,paused=false,angle=.55,zoom=1,drag=null,queued=false;
  const game=el('section',undefined,`action-game action-game-${mode}`);game.dataset.mode=mode;game.dataset.gameVersion='action-v1';
  game.append(el('span',`${mode.toUpperCase()} · PETUALANGAN BERBASIS LANGKAH`,'action-eyebrow'),el('h3',theme[0]),el('p',theme[1]));
  const spatial=['k3-budaya-kerja','pengenalan-jaringan','topologi-jaringan','perangkat-jaringan','perencanaan-jaringan','ipv4-subnetting','ipv6-dasar','osi-tcpip','switching-vlan','troubleshooting'].includes(moduleId);
  const hud=el('div',undefined,'action-hud'),objective=el('p',undefined,'action-objective');
  const canvas=el('canvas',undefined,'action-world');canvas.tabIndex=0;canvas.setAttribute('role','application');canvas.setAttribute('aria-label',`${theme[0]}. Bergerak dengan panah atau WASD; E untuk ambil, aktivasi pos, dan serahkan; spasi untuk tunggu. Kontrol sentuh tersedia di bawah.`);
  const feedback=el('p',undefined,'action-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  const controls=el('div',undefined,'action-controls');
  function control(label,action,cls='secondary-action'){const b=el('button',label,cls);b.type='button';b.dataset.gameAction=action;b.addEventListener('click',()=>dispatch(action));return b;}
  const dpad=el('div',undefined,'action-dpad');[['↑','up'],['←','left'],['↓','down'],['→','right']].forEach(([label,action])=>{const b=control(label,action);b.setAttribute('aria-label',`Bergerak ${action}`);dpad.append(b);});
  controls.append(dpad,control('E · Aksi','interact','primary-action'),control('Tunggu','wait'),control('Jeda','pause'),control('Ulangi level','restart'));
  const advance=control('Level Berikutnya','next','primary-action');advance.hidden=true;controls.append(advance);
  const camera=el('div',undefined,'action-camera');camera.hidden=mode!=='3d';
  [['Putar kiri','rotateLeft'],['Putar kanan','rotateRight'],['Perbesar','zoomIn'],['Perkecil','zoomOut']].forEach(([label,action])=>camera.append(control(label,action)));controls.append(camera);
  if(spatial){
    const views=el('div',undefined,'action-view-controls');views.append(el('span','Sudut pandang game:'));
    ['2d','3d'].forEach(view=>{const choice=el('button',view.toUpperCase(),'secondary-action');choice.type='button';choice.dataset.gameView=view;choice.setAttribute('aria-pressed',String(mode===view));choice.addEventListener('click',()=>{
      mode=view;game.dataset.mode=mode;game.className=`action-game action-game-${mode}`;camera.hidden=mode!=='3d';game.querySelector('.action-eyebrow').textContent=`${mode.toUpperCase()} · PETUALANGAN BERBASIS LANGKAH`;
      views.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===choice)));resize();
    });views.append(choice);});game.append(views);
  }
  const legend=el('div',undefined,'action-legend');legend.append(el('p',`Kontrol: panah/WASD = bergerak · E = ambil/aktifkan/serahkan · spasi = tunggu. Depot D → pos 1–4 → keluar F. ◆ token kunci · + energi · ! zona gangguan · ● drone. Muatan: ${theme[2]}.`));
  const stationList=el('ol');pack.nodes.forEach(node=>stationList.append(el('li',`${node.label}: ${node.role}`)));legend.append(stationList);
  game.append(hud,objective,canvas,controls,feedback,legend,el('p','Ini permainan strategi rute pada model simbolik. Nyawa, kunci, dan energi adalah mekanik game; tidak mewakili ukuran risiko, TTL, atau konfigurasi jaringan sebenarnya.','studio-boundary'));root.append(game);
  const ctx=canvas.getContext('2d');let width=800,height=460;
  const keyMap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',e:'interact',' ':'wait'};
  canvas.addEventListener('keydown',event=>{const action=keyMap[event.key]||keyMap[event.key.toLowerCase()];if(action){event.preventDefault();dispatch(action);}});
  canvas.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY};if(mode==='3d')canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointerup',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;drag=null;if(Math.hypot(dx,dy)<20)return;if(mode==='3d'){angle+=dx*.007;schedule();}else dispatch(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});
  function dispatch(action){
    if(action==='pause'){paused=!paused;update();return;}
    if(action==='restart'){state=newState(level);completed=false;paused=false;update();return;}
    if(action==='rotateLeft'){angle-=.25;schedule();return;}if(action==='rotateRight'){angle+=.25;schedule();return;}
    if(action==='zoomIn'){zoom=Math.min(1.4,zoom+.1);schedule();return;}if(action==='zoomOut'){zoom=Math.max(.65,zoom-.1);schedule();return;}
    if(action==='next'&&state.won){if(levelIndex===2){levelIndex=0;scores=[];completed=false;}else levelIndex++;level=createLevel(levelIndex);state=newState(level);update();return;}
    if(paused||completed)return;
    const wasWon=state.won;state=act(level,state,action);
    if(state.won&&!wasWon){scores[levelIndex]=earnedScore(state);if(levelIndex===2){completed=true;onComplete(Math.round(scores.reduce((sum,value)=>sum+value,0)/3));}}
    update();
  }
  function update(){
    hud.textContent=`Level ${levelIndex+1}/3 · Energi ${Math.max(0,state.energy)} · Nyawa ${Math.max(0,state.lives)} · Pos ${state.checkpoint}/4 · Langkah ${state.moves} · Kunci ${state.key?'✓':'—'}`;
    objective.textContent=paused?'Dijeda. Tekan Jeda lagi untuk melanjutkan.':completed?`Seluruh level selesai! Skor ${Math.round(scores.reduce((sum,value)=>sum+value,0)/3)}/100.`:!state.carrying?'Tujuan: ambil muatan di depot D dengan E / Aksi.':state.checkpoint<4?`Tujuan: pos ${state.checkpoint+1} — ${pack.nodes[state.checkpoint].label}. Berdiri di pos lalu tekan E / Aksi.`:'Tujuan: bawa muatan ke F lalu tekan E / Aksi untuk menyerahkannya.';
    feedback.textContent=state.message;advance.hidden=!state.won;advance.textContent=completed?'Mainkan dari awal':'Level Berikutnya';
    game.dataset.state=JSON.stringify({level:levelIndex,player:state.player,carrying:state.carrying,checkpoint:state.checkpoint,key:state.key,energy:state.energy,lives:state.lives,moves:state.moves,won:state.won,lost:state.lost,completed,paused});
    schedule();
  }
  const label=(x,y,text,color='#fff',size=13)=>{ctx.fillStyle=color;ctx.font=`700 ${size}px Segoe UI`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x,y);};
  function tileType(x,y){const p=[x,y];if(level.walls.some(c=>at(c,p)))return 'wall';if(level.hazards.some(c=>at(c,p)))return 'hazard';if(at(p,level.gate))return 'gate';return 'floor';}
  function draw2D(){
    const cell=Math.min((width-16)/11,(height-16)/7),ox=(width-cell*11)/2,oy=(height-cell*7)/2;
    for(let y=0;y<7;y++)for(let x=0;x<11;x++){const type=tileType(x,y);ctx.fillStyle=type==='wall'?'#233c59':type==='hazard'?'#9f2446':type==='gate'&&!state.key?'#ca8a04':(x+y)%2?'#183249':'#1b3a52';ctx.fillRect(ox+x*cell+1,oy+y*cell+1,cell-2,cell-2);if(type==='hazard')label(ox+(x+.5)*cell,oy+(y+.5)*cell,'!','#fecdd3');}
    const marker=(p,text,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(ox+p[0]*cell+cell*.12,oy+p[1]*cell+cell*.12,cell*.76,cell*.76,6);ctx.fill();label(ox+(p[0]+.5)*cell,oy+(p[1]+.5)*cell,text,'#062032',Math.max(11,cell*.29));};
    marker(level.start,'D','#94a3b8');marker(level.exit,'F','#c084fc');level.stations.forEach((p,index)=>marker(p,String(index+1),index<state.checkpoint?'#2dd4bf':index===state.checkpoint?'#fbbf24':'#7dd3fc'));
    if(!state.key)marker(level.key,'◆','#fde047');level.batteries.forEach((p,index)=>{if(!state.batteries.includes(index))marker(p,'+','#86efac');});
    const drone=level.patrol[state.turn%level.patrol.length];marker(drone,'●','#fb7185');
    const px=ox+(state.player[0]+.5)*cell,py=oy+(state.player[1]+.5)*cell;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px,py,cell*.27,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0284c7';ctx.beginPath();ctx.arc(px,py,cell*.17,0,Math.PI*2);ctx.fill();if(state.carrying){ctx.fillStyle='#f97316';ctx.fillRect(px+cell*.09,py-cell*.25,cell*.2,cell*.2);}
  }
  function draw3D(){
    const project=([x,y,z])=>{const a=(x-5)*Math.cos(angle)+(z-3)*Math.sin(angle),b=-(x-5)*Math.sin(angle)+(z-3)*Math.cos(angle);const depth=14+b*.4-y*.3;const scale=Math.min(width/16,height/11)*zoom*14/depth;return {x:width/2+a*scale,y:height*.52+(b*.48-y)*scale,depth};};
    const polygons=[];const square=(x,z,y,color)=>{const points=[[x-.47,y,z-.47],[x+.47,y,z-.47],[x+.47,y,z+.47],[x-.47,y,z+.47]].map(project);polygons.push({points,color,depth:points.reduce((sum,p)=>sum+p.depth,0)/4});};
    const cubes=[];
    for(let z=0;z<7;z++)for(let x=0;x<11;x++){const type=tileType(x,z);square(x,z,0,type==='hazard'?'#a32952':(x+z)%2?'#18384b':'#245064');if(type==='wall')cubes.push({x,z,h:.65,color:'#40617e'});if(type==='gate'&&!state.key)cubes.push({x,z,h:1,color:'#c78d22',text:'▣'});}
    const marker=(p,text,color,h=.45)=>cubes.push({x:p[0],z:p[1],h,color,text});
    marker(level.start,'D','#94a3b8',.15);marker(level.exit,'F','#a78bfa',.3);level.stations.forEach((p,i)=>marker(p,String(i+1),i<state.checkpoint?'#2dd4bf':i===state.checkpoint?'#fbbf24':'#38bdf8'));
    if(!state.key)marker(level.key,'◆','#fde047',.6);level.batteries.forEach((p,i)=>{if(!state.batteries.includes(i))marker(p,'+','#86efac',.35);});marker(level.patrol[state.turn%level.patrol.length],'!','#fb7185',.8);marker(state.player,state.carrying?'▣':'●','#f8fafc',.95);
    const labels=[];
    cubes.forEach(({x,z,h,color,text})=>{const points=[[x-.32,0,z-.32],[x+.32,0,z-.32],[x+.32,0,z+.32],[x-.32,0,z+.32],[x-.32,h,z-.32],[x+.32,h,z-.32],[x+.32,h,z+.32],[x-.32,h,z+.32]].map(project);[[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].forEach((indices,i)=>{const pts=indices.map(k=>points[k]);polygons.push({points:pts,color,shade:i*.09,depth:pts.reduce((sum,p)=>sum+p.depth,0)/4});});if(text)labels.push({point:project([x,h+.18,z]),text});});
    polygons.sort((a,b)=>b.depth-a.depth).forEach(({points,color,shade=0})=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.fill();if(shade){ctx.fillStyle=`rgba(0,0,0,${shade})`;ctx.fill();}ctx.strokeStyle='rgba(3,16,28,.35)';ctx.lineWidth=1;ctx.stroke();});labels.forEach(({point,text})=>label(point.x,point.y,text,'#fff',Math.max(11,width/70)));
  }
  function draw(){queued=false;if(!game.isConnected)return;ctx.fillStyle='#0c192c';ctx.fillRect(0,0,width,height);mode==='3d'?draw3D():draw2D();if(paused||state.lost||completed){ctx.fillStyle='rgba(3,12,24,.8)';ctx.fillRect(0,0,width,height);label(width/2,height/2,completed?'MISI SELESAI':state.lost?'COBA LAGI':'JEDA','#fff',Math.min(28,width/12));}}
  function schedule(){if(!queued){queued=true;requestAnimationFrame(draw);}}
  const resize=()=>{const rect=canvas.getBoundingClientRect();if(!rect.width)return;width=rect.width;height=mode==='2d'?Math.max(220,width*7/11):Math.max(280,Math.min(530,width*.7));const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);canvas.style.height=`${height}px`;ctx.setTransform(ratio,0,0,ratio,0,0);schedule();};
  const observer=new ResizeObserver(resize);observer.observe(canvas);update();resize();
  return {reset(){levelIndex=0;level=createLevel(0);state=newState(level);scores=[];completed=false;paused=false;update();},dispose(){observer.disconnect();game.remove();}};
}
