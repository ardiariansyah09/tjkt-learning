// IP Quest: three independent games. Progress is dispatched only after all missions finish.
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
 const panel=el('section','ipq'),head=el('div','ipq-head'),heading=el('h2','','🎮 IP QUEST · SUBNET ADVENTURE'),hud=el('div','ipq-hud'),arena=el('div','ipq-arena'),foot=el('div','ipq-foot');
 heading.textContent='🎮 IP QUEST · SUBNET ADVENTURE';head.append(heading,hud);panel.append(head,arena,foot);root.append(panel);
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
 function hunter(){clear();arena.append(el('h3','','🕹️ MISI 1 — IP ADDRESS HUNTER'),el('p','','Gerakkan teknisi dengan WASD / tombol panah. Ambil 6 alamat IP PRIVAT (🟢), hindari IP publik (🔴). Waktu 55 detik.'));
 const stats=el('p','ipq-stats'),field=el('div','ipq-field'),player=el('div','ipq-player','🧑‍💻');field.append(player);arena.append(stats,field);
 const touch=el('div','ipq-controls');arena.append(touch);let x=50,y=50,collected=0,lives=3,time=55,done=false;const items=[];const used=new Set();const pools=['10.0.0.5','192.168.1.10','172.16.4.8','10.10.2.3','192.168.20.4','172.31.2.9','8.8.8.8','1.1.1.1','203.0.113.8','198.51.100.5'];
 function spawn(){items.forEach(i=>i.node.remove());items.length=0;const arr=[...pools].sort(()=>Math.random()-.5);arr.slice(0,7).forEach((ip,i)=>{const n=el('div',`ipq-item ${privateIP(ip)?'good':'bad'}`,ip);const xx=rand(8,86),yy=rand(10,80);n.style.left=xx+'%';n.style.top=yy+'%';field.append(n);items.push({node:n,ip,x:xx,y:yy,active:true});});}
 function statsDraw(){stats.textContent=`🟢 ${collected}/6 IP privat · ❤️ ${lives} · ⏱️ ${time}s`;player.style.left=x+'%';player.style.top=y+'%';}
 function end(){if(done)return;done=true;clearInterval(timer);window.removeEventListener('keydown',onKey);finish(Math.round(30*collected/6));}
 function move(dx,dy){if(done)return;x=Math.max(2,Math.min(96,x+dx));y=Math.max(2,Math.min(92,y+dy));for(const it of items){if(!it.active||Math.hypot(x-it.x,y-it.y)>9)continue;it.active=false;it.node.remove();if(privateIP(it.ip)){collected++;tone(660);}else{lives--;tone(180);}if(collected>=6||lives<=0){statsDraw();end();return;}}if(items.every(i=>!i.active))spawn();statsDraw();}
 const onKey=e=>{const k=e.key.toLowerCase();const dirs={arrowup:[0,-4],w:[0,-4],arrowdown:[0,4],s:[0,4],arrowleft:[-4,0],a:[-4,0],arrowright:[4,0],d:[4,0]};if(dirs[k]){e.preventDefault();move(...dirs[k]);}};window.addEventListener('keydown',onKey);
 [['⬆',0,-4],['⬅',-4,0],['⬇',0,4],['➡',4,0]].forEach(([t,dx,dy])=>touch.append(btn(t,()=>move(dx,dy),'ipq-dir')));
 spawn();statsDraw();const timer=setInterval(()=>{time--;statsDraw();if(time<=0)end();},1000);cleanup=()=>{done=true;clearInterval(timer);window.removeEventListener('keydown',onKey);};
 }
 function escapeGame(){clear();arena.append(el('h3','','🔐 MISI 2 — SUBNET ESCAPE'),el('p','','Buka lima gerbang dengan memilih subnet mask atau kapasitas host yang tepat. Setiap gerbang bernilai 7 poin.'));
 const gates=[{p:26,q:'Subnet mask untuk /26?',a:'255.255.255.192',options:['255.255.255.192','255.255.255.224','255.255.255.128']},{p:27,q:'Host usable untuk /27?',a:'30',options:['14','30','62']},{p:28,q:'Subnet mask untuk /28?',a:'255.255.255.240',options:['255.255.255.248','255.255.255.240','255.255.255.224']},{p:29,q:'Host usable untuk /29?',a:'6',options:['8','6','14']},{p:25,q:'Subnet mask untuk /25?',a:'255.255.255.128',options:['255.255.255.0','255.255.255.192','255.255.255.128']}];
 let i=0,points=0;const display=el('div','ipq-gate'),choices=el('div','ipq-choices'),msg=el('p','ipq-stats');arena.append(display,choices,msg);
 function next(){if(i===gates.length){finish(points);return;}const g=gates[i];display.textContent=`🚪 GERBANG ${i+1}/5 · CIDR /${g.p}`;msg.textContent=g.q;choices.replaceChildren();g.options.sort(()=>Math.random()-.5).forEach(answer=>choices.append(btn(answer,()=>{const ok=answer===g.a;if(ok){points+=7;tone(760);}else tone(160);i++;next();})));}
 next();}
 function city(){clear();arena.append(el('h3','','🏙️ MISI 3 — VLSM CITY BUILDER'),el('p','','Bangun subnet dari blok 192.168.10.0/24. Pilih prefix terkecil yang cukup, lalu alokasikan blok tanpa tumpang tindih.'));
 const rooms=[{name:'🏫 Lab TJKT',hosts:50},{name:'🏢 Ruang Guru',hosts:20},{name:'📚 Perpustakaan',hosts:10},{name:'📷 CCTV',hosts:5},{name:'🖨️ Printer',hosts:2}];let idx=0,points=0,offset=0;const status=el('p','ipq-stats'),zone=el('div','ipq-city'),choices=el('div','ipq-choices'),history=el('div','ipq-history');arena.append(status,zone,choices,history);
 function next(){if(idx>=rooms.length){finish(points);return;}const r=rooms[idx],p=best(r.hosts);status.textContent=`Gedung ${idx+1}/5 · ${r.hosts} host diperlukan · ${points}/35 poin`;zone.textContent=`${r.name} — Pilih subnet yang efisien`;choices.replaceChildren();[24,25,26,27,28,29,30].filter(v=>v>=p-1&&v<=p+1).sort(()=>Math.random()-.5).forEach(candidate=>choices.append(btn(`/${candidate} · ${usable(candidate)} host`,()=>{const ok=candidate===p;if(ok){const size=2**(32-p);const start=offset;offset+=size;const ip=`192.168.10.${start}`;history.append(el('p','ipq-built',`✓ ${r.name}: ${ip}/${p} · ${usable(p)} host`));points+=7;tone(730);}else{history.append(el('p','ipq-miss',`✗ ${r.name}: /${candidate} tidak paling efisien. Seharusnya /${p}.`));tone(160);offset+=2**(32-p);}idx++;next();})));}
 next();}
 function render(){if(mission>=3){summary();return;}clear();arena.append(el('p','ipq-intro',`MISI ${mission+1}/3 · ${names[mission]} · Maksimum ${max[mission]} poin`));const start=btn('▶ MULAI MISI',()=>[hunter,escapeGame,city][mission]());foot.append(start,btn(muted?'🔇 Suara mati':'🔊 Suara aktif',()=>{muted=!muted;render();},'ipq-btn ipq-alt'));}
 render();
 // Remove listeners and timers when navigating to another lesson.
 const observer=new MutationObserver(()=>{if(!panel.isConnected){cleanup();observer.disconnect();}});observer.observe(document.getElementById('lessonContent')||document.body,{childList:true,subtree:false});
}
