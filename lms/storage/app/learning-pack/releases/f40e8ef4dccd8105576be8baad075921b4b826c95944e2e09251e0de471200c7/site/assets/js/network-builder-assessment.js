/* TJKT Network Builder 4.0: visual topology is the actual graded lab.
   Local-only educational model; not a real ICMP or Ethernet implementation. */
(()=>{'use strict';
const NODES=[{id:'a',label:'PC A',icon:'💻',x:13,y:26},{id:'b',label:'PC B',icon:'💻',x:13,y:74},{id:'s',label:'Switch',icon:'🔀',x:49,y:50},{id:'r',label:'Router',icon:'🌐',x:84,y:26},{id:'v',label:'Server',icon:'🗄️',x:84,y:74}];
const byId=Object.fromEntries(NODES.map(n=>[n.id,n]));
const key=(a,b)=>[a,b].sort().join('|');
const elem=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
const NS='http://www.w3.org/2000/svg';
function mount(){if(typeof current==='undefined'||current!==6)return;
 const root=document.getElementById('content');if(!root)return;
 // Remove both earlier lab UIs: multiple lab widgets would mislead students.
 root.querySelectorAll('.intro-sim,.nvb').forEach(n=>n.remove());
 const oldGrid=root.querySelector('.grid');if(oldGrid)oldGrid.remove();
 [...root.querySelectorAll('p')].filter(p=>p.textContent.includes('Pilih tepat tiga komponen')).forEach(p=>p.remove());
 const check=document.getElementById('check');check.hidden=true;check.onclick=null;
 const section=elem('section','nva');section.append(elem('h2',null,'🔧 Praktik: Bangun LAN Sekolah'),elem('p',null,'Hubungkan PC A dan PC B masing-masing langsung ke switch. Router dan server adalah perangkat tambahan yang tidak diperlukan untuk skenario LAN sederhana ini.'));
 const board=elem('div','nva-board');board.setAttribute('aria-label','Area topologi jaringan');
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('preserveAspectRatio','none');svg.classList.add('nva-wires');svg.setAttribute('aria-hidden','true');board.append(svg);
 const links=new Set(),buttons=new Map();let selected=null,checked=false,pingDone=false,busy=false;
 const status=elem('p','nva-status','Mulai dengan memilih PC A, lalu Switch.');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const report=elem('div','nva-report');const toolbar=elem('div','nva-actions');
 function correct(){return links.size===2&&links.has(key('a','s'))&&links.has(key('b','s'))}
 // Use the actual rendered device rectangles, not percentages multiplied by fixed values.
 function deviceRect(id){
  const el=buttons.get(id);if(!el)return null;
  const r=el.getBoundingClientRect(),b=board.getBoundingClientRect();
  return {cx:r.left-b.left+r.width/2,cy:r.top-b.top+r.height/2,w:r.width,h:r.height};
 }
 function edgePoint(from,to){
  const dx=to.cx-from.cx,dy=to.cy-from.cy;
  if(!dx&&!dy)return {x:from.cx,y:from.cy};
  const t=Math.min(dx?from.w/2/Math.abs(dx):Infinity,dy?from.h/2/Math.abs(dy):Infinity);
  return {x:from.cx+dx*t,y:from.cy+dy*t};
 }
 function endpoints(a,b){
  const ra=deviceRect(a),rb=deviceRect(b);if(!ra||!rb)return null;
  return {start:edgePoint(ra,rb),end:edgePoint(rb,ra)};
 }
 function redraw(){
  const width=board.clientWidth,height=board.clientHeight;
  if(!width||!height)return;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  svg.replaceChildren();
  for(const pair of links){
   const [a,b]=pair.split('|'),pts=endpoints(a,b);if(!pts)continue;
   const line=document.createElementNS(NS,'line');
   line.setAttribute('x1',pts.start.x);line.setAttribute('y1',pts.start.y);
   line.setAttribute('x2',pts.end.x);line.setAttribute('y2',pts.end.y);
   line.setAttribute('stroke','#0284c7');line.setAttribute('stroke-width','4');
   line.setAttribute('stroke-linecap','round');svg.append(line);
  }
  for(const [id,button] of buttons){button.classList.toggle('nva-selected',selected===id);button.setAttribute('aria-pressed',String(selected===id))}
  report.textContent=links.size?'Kabel: '+[...links].map(v=>v.split('|').map(id=>byId[id].label).join(' ↔ ')).join(' · '):'Belum ada kabel.';
 }

 function choose(id){if(busy)return;if(!selected){selected=id;status.textContent=byId[id].label+' dipilih. Pilih perangkat tujuan.';redraw();return}if(selected===id){selected=null;status.textContent='Pilihan dibatalkan.';redraw();return}
  const pair=key(selected,id);if(links.has(pair)){links.delete(pair);status.textContent='Kabel dilepas.'}else{links.add(pair);status.textContent='Kabel terpasang.'}
  selected=null;checked=false;pingDone=false;redraw();}
 for(const n of NODES){const b=elem('button','nva-device');b.type='button';b.style.left=n.x+'%';b.style.top=n.y+'%';b.setAttribute('aria-label','Pilih '+n.label);b.append(elem('span','nva-emoji',n.icon),elem('strong',null,n.label));b.onclick=()=>choose(n.id);board.append(b);buttons.set(n.id,b)}
 const action=(text,fn,secondary=false)=>{const b=elem('button',secondary?'nva-action nva-secondary':'nva-action',text);b.type='button';b.onclick=fn;toolbar.append(b);return b};
 action('✓ Uji LAN',()=>{checked=correct();pingDone=false;status.textContent=checked?'✓ Topologi tepat: kedua PC langsung terhubung ke switch, tanpa kabel tambahan. Lanjutkan simulasi ping.':'✗ Topologi belum sesuai. Harus tepat dua kabel: PC A–Switch dan PC B–Switch.'});
 action('▶ Simulasi Ping',()=>{if(busy)return;if(!checked||!correct()){status.textContent='Uji LAN harus berhasil terlebih dahulu.';return}busy=true;status.textContent='Simulasi paket: PC A → Switch → PC B → Switch → PC A.';
  const dot=document.createElementNS(NS,'circle');dot.setAttribute('r','9');dot.setAttribute('fill','#f59e0b');dot.setAttribute('stroke','#fff');dot.setAttribute('stroke-width','2');svg.append(dot);
  const path=['a','s','b','s','a'];let segment=0,frame=0;const frames=28;
  function move(){
   if(!dot.isConnected||!document.contains(section)){busy=false;return}
   if(segment>=path.length-1){dot.remove();busy=false;pingDone=true;status.textContent='✓ Simulasi ping berhasil. Klik Nilai Praktik untuk menyimpan hasil.';return}
   const from=deviceRect(path[segment]),to=deviceRect(path[segment+1]);
   if(!from||!to){dot.remove();busy=false;return}
   const t=frame/frames;
   dot.setAttribute('cx',from.cx+(to.cx-from.cx)*t);
   dot.setAttribute('cy',from.cy+(to.cy-from.cy)*t);
   frame++;
   if(frame>frames){frame=0;segment++}
   requestAnimationFrame(move);
  }
  move();});
 action('↺ Hapus Kabel',()=>{if(busy)return;links.clear();selected=null;checked=false;pingDone=false;status.textContent='Semua kabel dihapus. Silakan mulai kembali.';redraw()},true);
 const scoreBtn=action('🏅 Nilai Praktik',()=>{const score=(correct()?40:0)+(checked&&correct()?30:0)+(pingDone&&correct()?30:0);
  status.textContent=score>=75?`✓ Praktik berhasil: ${score}/100. Tahap berikutnya terbuka.`:`Nilai praktik ${score}/100. Minimal 75. Pasang dua kabel yang benar, uji LAN, lalu simulasikan ping.`;
  // complete() is the existing module's scoring and progress persistence.
  complete(score);
 });scoreBtn.classList.add('nva-grade');
 section.append(board,toolbar,status,report,elem('p','nva-hint','Penilaian: topologi tepat 40 poin + uji LAN 30 poin + simulasi ping 30 poin. Kelulusan minimal 75. Mengubah kabel membatalkan hasil pengujian sebelumnya.'));
 root.append(section);redraw();
 // Recompute wires when the simulator changes size (desktop/mobile/sidebar).
 if(typeof ResizeObserver!=='undefined'){
  const observer=new ResizeObserver(()=>{if(!board.isConnected){observer.disconnect();return}if(!busy)redraw()});
  observer.observe(board);
 }

}
// Existing intro-upgrade script wraps render(); this wrapper runs after it.
if(typeof render==='function'){
 const originalRender=render;
 render=function(){originalRender();mount()};
 mount();
}
})();