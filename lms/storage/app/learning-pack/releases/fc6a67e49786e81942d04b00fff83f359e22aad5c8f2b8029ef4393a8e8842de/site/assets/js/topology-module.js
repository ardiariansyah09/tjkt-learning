(()=>{'use strict';
const KEY='tjkt:topology:v1';
const lessons=[
['Pengertian dan Fungsi Topologi','Topologi fisik menggambarkan susunan perangkat dan kabel, sedangkan topologi logis menjelaskan bagaimana data mengalir. Bentuk fisik dan alur logis tidak selalu sama.'],
['Topologi Bus dan Ring','Bus memakai media bersama; Ring membentuk lintasan melingkar. Keduanya memiliki karakteristik dan risiko gangguan yang berbeda.'],
['Topologi Star dan Tree','Star menghubungkan perangkat ke titik pusat (umumnya switch). Tree menghubungkan beberapa segmen secara hierarkis.'],
['Topologi Mesh dan Hybrid','Mesh menyediakan beberapa jalur antarnode, sedangkan Hybrid menggabungkan lebih dari satu bentuk topologi.'],
['Memilih Topologi untuk Sekolah','Pertimbangkan biaya, kemudahan pengelolaan, skalabilitas, titik kegagalan, dan kebutuhan redundansi.'],
['Topology Builder — Virtual Lab','Rancang topologi Star: hubungkan PC A, PC B, dan PC C masing-masing ke switch.'],
['Link Rescue: Simulasi Topologi 2D','Diagnosis link dan perangkat melalui peta jaringan interaktif.'],
['Game 2D: Jaringan Tetap Terhubung','Bangun koneksi terbatas dan uji ketahanan terhadap kegagalan kabel atau simpul.'],
['Posttest dan Sertifikat','Selesaikan evaluasi akhir untuk memperoleh sertifikat penyelesaian mandiri.']
];
const questions=[
['Topologi fisik menggambarkan ...',['Susunan perangkat dan media penghubung','Alamat IP publik','Jenis aplikasi'],0],
['Salah satu risiko topologi Bus klasik adalah ...',['Kerusakan kabel utama mengganggu banyak perangkat','Semua PC wajib punya switch sendiri','Tidak menggunakan media'],0],
['Pada Ring sederhana, node membentuk ...',['Lingkaran lintasan','Bintang terpusat','Satu komputer tunggal'],0],
['Pada Star, kabel tiap PC biasanya menuju ...',['Switch pusat','Printer USB','Monitor'],0],
['Topologi Tree cocok menggambarkan ...',['Jaringan hierarkis antarsegmen','Satu kabel lurus saja','Tanpa perangkat penghubung'],0],
['Keunggulan utama Mesh adalah ...',['Tersedia jalur alternatif','Tidak memerlukan konfigurasi','Selalu termurah'],0],
['Hybrid berarti ...',['Gabungan dua atau lebih topologi','Hanya menggunakan wireless','Tidak memiliki koneksi'],0],
['Jika satu kabel PC putus pada Star yang sehat ...',['Umumnya hanya PC itu terputus','Seluruh LAN pasti mati','Semua router rusak'],0],
['Jika switch pusat Star mati ...',['Banyak PC pada switch tersebut terganggu','Hanya kabel printer rusak','Jaringan makin cepat'],0],
['Memilih topologi mempertimbangkan ...',['Biaya, keandalan, skalabilitas','Warna monitor saja','Nama pengguna'],0],
['Untuk lab sekolah dengan 20 PC, pendekatan yang umum adalah ...',['Star dengan switch','Bus koaksial tunggal wajib','Tanpa jaringan'],0],
['Redundansi jalur bermanfaat untuk ...',['Mengurangi ketergantungan pada satu jalur','Menghapus kebutuhan alamat IP','Menambah kerusakan'],0]
];
const $=id=>document.getElementById(id), create=(tag,txt,cls)=>{let n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n};
let state;try{state=JSON.parse(localStorage.getItem(KEY))||{}}catch{state={}};state.passed||={};state.scores||={};let current=0,selected=null,gameScore=0,challenge=0,quiz=[],answers={},lab=null;
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));const done=i=>!!state.passed[i];const unlocked=i=>window.TJKTLocalInstructor?.isActive()||i===0||done(i-1);
function complete(score){const threshold=current===8?80:current===7?80:75;state.scores[current]=Math.max(state.scores[current]||0,score);if(score>=threshold)state.passed[current]=true;save();$('feedback').textContent=score>=threshold?`✓ Lulus! Skor ${score}/100. Tahap berikutnya terbuka.`:`Skor ${score}/100. Minimal ${threshold}; silakan ulangi.`;drawNav();$('next').disabled=(!window.TJKTLocalInstructor?.isActive()&&!done(current))||current===8;if(current===8&&done(8))certificateForm();}
function drawNav(){const nav=$('nav');nav.replaceChildren();lessons.forEach(([title],i)=>{const b=create('button',`${done(i)?'✓':unlocked(i)?'○':'🔒'} ${i+1}. ${title}`);b.disabled=!unlocked(i);if(i===current)b.classList.add('active');b.onclick=()=>{current=i;render();window.scrollTo({top:0,behavior:'smooth'})};nav.append(b)});const count=lessons.filter((_,i)=>done(i)).length;$('progress').style.width=(count/lessons.length*100)+'%';$('progressLabel').textContent=`${count} dari ${lessons.length} tahap selesai`;}
function choices(parent,opts,callback){const wrap=create('div');const order=opts.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}order.forEach(i=>{const b=create('button',opts[i],'choice');b.type='button';b.onclick=()=>{wrap.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');callback(i)};wrap.append(b)});parent.append(wrap)}
function diagram(type){
 const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');
 svg.setAttribute('viewBox','0 0 600 280');svg.setAttribute('class','diagram');
 const line=(x1,y1,x2,y2)=>{const el=document.createElementNS(NS,'line');[['x1',x1],['y1',y1],['x2',x2],['y2',y2]].forEach(([k,v])=>el.setAttribute(k,v));svg.append(el)};
 const label=(x,y,value)=>{const el=document.createElementNS(NS,'text');el.setAttribute('x',x);el.setAttribute('y',y);el.textContent=value;svg.append(el)};
 if(type==='Bus'){
  line(72,140,528,140);
  const nodes=[[140,65,'PC1'],[245,215,'PC2'],[355,65,'PC3'],[460,215,'PC4']];
  nodes.forEach(([x,y,name])=>{line(x,Math.min(y+24,140),x,Math.max(y-24,140));const c=document.createElementNS(NS,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',23);svg.append(c);label(x,y,name)});
  [[40,'T'],[528,'T']].forEach(([x,name])=>{const r=document.createElementNS(NS,'rect');r.setAttribute('x',x);r.setAttribute('y',128);r.setAttribute('width',32);r.setAttribute('height',24);r.setAttribute('rx',5);svg.append(r);label(x+16,140,name)});
  return svg;
 }
 const layouts={
  Star:{nodes:[[300,140,'SW'],[115,60,'PC1'],[485,60,'PC2'],[115,220,'PC3'],[485,220,'PC4']],edges:[[0,1],[0,2],[0,3],[0,4]]},
  Ring:{nodes:[[300,45,'PC1'],[500,140,'PC2'],[300,235,'PC3'],[100,140,'PC4']],edges:[[0,1],[1,2],[2,3],[3,0]]},
  Tree:{nodes:[[300,45,'CORE'],[180,135,'SW1'],[420,135,'SW2'],[95,225,'PC1'],[265,225,'PC2'],[335,225,'PC3'],[505,225,'PC4']],edges:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]},
  Mesh:{nodes:[[150,60,'A'],[450,60,'B'],[150,220,'C'],[450,220,'D']],edges:[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]},
  Hybrid:{nodes:[[300,45,'CORE'],[190,140,'SW-A'],[410,140,'SW-B'],[100,225,'PC1'],[250,225,'PC2'],[350,225,'PC3'],[500,225,'PC4']],edges:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]},
  LogicalFlow:{nodes:[[110,140,'PC A'],[300,140,'SW'],[490,140,'SERVER']],edges:[[0,1],[1,2]]}
 };
 const layout=layouts[type]||layouts.Star;
 layout.edges.forEach(([a,b])=>line(layout.nodes[a][0],layout.nodes[a][1],layout.nodes[b][0],layout.nodes[b][1]));
 layout.nodes.forEach(([x,y,name])=>{const c=document.createElementNS(NS,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',26);svg.append(c);label(x,y,name)});
 return svg;
}
function learningCheck(c){const q=[questions[0],questions[1],questions[3],questions[5],questions[9]][current];c.append(create('h3','Cek Pemahaman'),create('p',q[0]));selected=null;choices(c,q[1],i=>selected=i);$('check').onclick=()=>{if(selected===null){$('feedback').textContent='Pilih jawaban terlebih dahulu.';return}complete(selected===q[2]?100:0)};}
function mountTopologySimulator(root){
 const panel=create('section',undefined,'topology-simulator');
 panel.append(create('h2','🧪 Simulasi Topologi 2D'),create('p','Pilih bentuk jaringan, lalu klik salah satu link untuk memutus atau memulihkannya. Kirim paket dari PC1 ke PC4 dan amati jalur yang masih tersedia.'));
 const toolbar=create('div',undefined,'topology-sim-toolbar'),select=document.createElement('select');
 select.setAttribute('aria-label','Pilih topologi simulasi');
 ['Star','Bus','Ring','Tree','Mesh'].forEach(type=>{const option=document.createElement('option');option.value=type;option.textContent=`Topologi ${type}`;select.append(option)});
 const send=create('button','📨 Kirim Paket','topology-sim-button'),reset=create('button','↻ Pulihkan Semua Link','topology-sim-button secondary');
 toolbar.append(select,send,reset);panel.append(toolbar);
 const figure=document.createElement('figure'),svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),status=create('p','Pilih topologi, ganggu satu link, lalu kirim paket.','topology-sim-status'),note=create('p','Model pembelajaran menyederhanakan protokol dan konfigurasi jaringan. Klik pada garis untuk mengubah kondisi link.','topology-sim-note');
 svg.setAttribute('viewBox','0 0 600 280');svg.setAttribute('role','img');svg.setAttribute('aria-label','Diagram topologi jaringan interaktif');
 figure.className='topology-sim-figure';figure.append(svg);panel.append(figure,status,note);
 root.append(panel);
 const layouts={
  Star:{nodes:[[95,65,'PC1'],[95,215,'PC2'],[505,65,'PC3'],[505,215,'PC4'],[300,140,'SW']],edges:[[0,4],[1,4],[2,4],[3,4]]},
  Bus:{nodes:[[90,78,'PC1'],[220,78,'PC2'],[380,78,'PC3'],[510,78,'PC4'],[100,140,''],[230,140,''],[370,140,''],[500,140,'']],edges:[[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7]]},
  Ring:{nodes:[[300,40,'PC1'],[500,140,'PC2'],[300,240,'PC3'],[100,140,'PC4']],edges:[[0,1],[1,2],[2,3],[3,0]],directed:true},
  Tree:{nodes:[[300,45,'CORE'],[180,135,'SW1'],[420,135,'SW2'],[95,225,'PC1'],[265,225,'PC2'],[335,225,'PC3'],[505,225,'PC4']],edges:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]},
  Mesh:{nodes:[[300,40,'PC1'],[520,220,'PC2'],[80,220,'PC3'],[300,145,'PC4']],edges:[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]}
 };
 let topology='Star',broken=new Set(),offline=new Set(),busy=false,runId=0;
 const ns='http://www.w3.org/2000/svg';
 const node=(tag,attrs,text)=>{const item=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([key,value])=>item.setAttribute(key,String(value)));if(text)item.textContent=text;return item;};
 function draw(){
  const layout=layouts[topology];svg.replaceChildren();
  if(topology==='Bus'){
   svg.append(node('line',{x1:74,y1:140,x2:100,y2:140,class:'topology-sim-bus-extension'}),node('line',{x1:500,y1:140,x2:526,y2:140,class:'topology-sim-bus-extension'}));
   [[61,'T'],[526,'T']].forEach(([x,label])=>{svg.append(node('rect',{x,y:127,width:14,height:26,rx:3,class:'topology-sim-terminator'}),node('text',{x:x+7,y:144,class:'topology-sim-label'},label));});
  }
  layout.edges.forEach(([from,to],index)=>{
   const a=layout.nodes[from],b=layout.nodes[to],line=node('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:`topology-sim-link${broken.has(index)||offline.has(from)||offline.has(to)?' is-broken':''}`,tabindex:0,role:'button','aria-label':`Link ${a[2]||'backbone'} ke ${b[2]||'backbone'}: ${broken.has(index)||offline.has(from)||offline.has(to)?'putus':'aktif'}`});
   const toggle=()=>{if(busy)return;broken.has(index)?broken.delete(index):broken.add(index);draw();status.textContent=`Link ${broken.has(index)?'diputus':'dipulihkan'}. Kirim paket untuk menguji konektivitas.`;};
   line.addEventListener('click',toggle);line.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});
   svg.append(line);
  });
  layout.nodes.forEach(([x,y,label],index)=>{
   if(!label)return;
   const canToggle=['SW','CORE','SW1','SW2'].includes(label),failed=offline.has(index),group=node('g',{class:`topology-sim-node-wrap${failed?' is-offline':''}`,...(canToggle?{tabindex:0,role:'button','aria-label':`${label}, ${failed?'offline':'online'}; klik untuk mengubah status`}:{})});
   group.append(node('circle',{cx:x,cy:y,r:25,class:`topology-sim-node${failed?' is-offline':''}${canToggle?' is-switch':''}`}));
   group.append(node('text',{x,y:y+5,class:'topology-sim-label'},label));
   if(canToggle){
    const toggle=()=>{if(busy)return;offline.has(index)?offline.delete(index):offline.add(index);runId++;send.disabled=false;draw();status.textContent=`${label} ${offline.has(index)?'dimatikan':'dipulihkan'}. Kirim paket untuk menguji jalurnya.`;};
    group.addEventListener('click',toggle);group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});
   }
   svg.append(group);
  });
 }
 select.addEventListener('change',()=>{topology=select.value;broken.clear();offline.clear();runId++;busy=false;send.disabled=false;status.textContent=`Topologi ${topology} dipilih. Klik link untuk mengubah kondisinya.`;note.textContent=topology==='Ring'?'Untuk latihan ini paket mengikuti satu arah pada ring sederhana. Implementasi nyata dapat memiliki mekanisme proteksi dan pemulihan yang berbeda.':'Model pembelajaran menyederhanakan protokol dan konfigurasi jaringan. Klik garis untuk mengubah kondisi link; klik switch untuk mematikan atau memulihkannya.';draw();});
 reset.addEventListener('click',()=>{broken.clear();offline.clear();runId++;busy=false;send.disabled=false;draw();status.textContent='Semua link dipulihkan.';});
 send.addEventListener('click',async()=>{
  if(busy)return;
  const id=++runId,layout=layouts[topology],adjacency=layout.nodes.map(()=>[]);
  layout.edges.forEach(([from,to],index)=>{if(broken.has(index))return;if(offline.has(from)||offline.has(to))return;adjacency[from].push({to,index});if(!layout.directed)adjacency[to].push({to:from,index});});
  const start=layout.nodes.findIndex(item=>item[2]==='PC1'),target=layout.nodes.findIndex(item=>item[2]==='PC4'),previous=new Map([[start,null]]),queue=[start];
  while(queue.length&&!previous.has(target)){const current=queue.shift();adjacency[current].forEach(edge=>{if(!previous.has(edge.to)){previous.set(edge.to,{from:current,index:edge.index});queue.push(edge.to);}});}
  if(!previous.has(target)){status.textContent=`Tidak ada jalur aktif dari PC1 ke PC4 pada topologi ${topology}.`;return;}
  const path=[];for(let cursor=target;cursor!==start;){const step=previous.get(cursor);path.unshift({from:step.from,to:cursor,index:step.index});cursor=step.from;}
  busy=true;send.disabled=true;status.textContent='Paket sedang melintasi jalur jaringan…';
  const packet=node('circle',{cx:layout.nodes[start][0],cy:layout.nodes[start][1],r:9,class:'topology-sim-packet'});svg.append(packet);
  for(const hop of path){
   const a=layout.nodes[hop.from],b=layout.nodes[hop.to],begin=performance.now(),duration=360;
   await new Promise(resolve=>{const frame=now=>{if(id!==runId||!svg.isConnected){resolve();return;}const t=Math.min(1,(now-begin)/duration);packet.setAttribute('cx',a[0]+(b[0]-a[0])*t);packet.setAttribute('cy',a[1]+(b[1]-a[1])*t);if(t<1)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   if(id!==runId)return;
  }
  packet.remove();busy=false;send.disabled=false;status.textContent=`✓ Paket berhasil tiba di PC4 melalui ${path.length} link.`;
 });
 draw();
}
function builder(c){c.append(create('h2','Praktik: bangun topologi Star'),create('p','Klik dua perangkat untuk menghubungkan kabel. Setiap PC harus terhubung langsung ke switch. Kabel PC-ke-PC tidak sesuai skenario ini.'));const tools=create('div',undefined,'lab-tools');const check=create('button','🔍 Periksa Topologi');const clear=create('button','↻ Hapus Kabel','subtle');tools.append(check,clear);c.append(tools);const board=create('div',undefined,'builder');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 600 310');svg.setAttribute('preserveAspectRatio','none');board.append(svg);const nodes=[['SW',50,48],['A',15,20],['B',85,20],['C',15,80]];let links=[],first=null;const renderLines=()=>{svg.replaceChildren();links.forEach(([a,b])=>{const na=nodes.find(n=>n[0]===a),nb=nodes.find(n=>n[0]===b),line=document.createElementNS('http://www.w3.org/2000/svg','line');[['x1',na[1]*6],['y1',na[2]*3.1],['x2',nb[1]*6],['y2',nb[2]*3.1],['stroke','#64e5ea'],['stroke-width','4']].forEach(([k,v])=>line.setAttribute(k,v));svg.append(line)})};nodes.forEach(([id,x,y])=>{const b=create('button',id==='SW'?'🔀 Switch':`💻 PC ${id}`,'device');b.style.left=x+'%';b.style.top=y+'%';b.onclick=()=>{if(first===null){first=id;b.classList.add('active');return}if(first!==id&&!links.some(([a,z])=>(a===first&&z===id)||(a===id&&z===first)))links.push([first,id]);first=null;board.querySelectorAll('.device').forEach(d=>d.classList.remove('active'));renderLines()};board.append(b)});c.append(board);clear.onclick=()=>{links=[];first=null;renderLines();$('feedback').textContent='Kabel dihapus.'};check.onclick=()=>{const valid=['A','B','C'].every(pc=>links.some(([a,b])=>(a==='SW'&&b===pc)||(b==='SW'&&a===pc)))&&links.length===3;complete(valid?100:Math.round(['A','B','C'].filter(pc=>links.some(([a,b])=>(a==='SW'&&b===pc)||(b==='SW'&&a===pc))).length/3*60))};$('check').hidden=true;}
function faultGame(c){
 $('check').hidden=true;
 const missions=[
  {title:'Misi 1 · PC A kehilangan koneksi',topology:'Star',symptom:'PC A offline, sedangkan PC lain tetap terhubung. Pilih link yang perlu diperiksa.',nodes:[[110,65,'PC A'],[110,215,'PC B'],[490,65,'PC C'],[490,215,'PC D'],[300,140,'SW']],edges:[[0,4],[1,4],[2,4],[3,4]],fault:{type:'edge',index:0},actions:['Uji kabel dan port PC A','Matikan seluruh switch'],correct:0,explanation:'Link akses PC A menjadi area awal yang paling sesuai dengan lingkup gangguan.'},
  {title:'Misi 2 · Seluruh switch offline',topology:'Star',symptom:'Semua PC pada satu Star kehilangan koneksi. Pilih perangkat yang menjadi titik pusat.',nodes:[[110,65,'PC A'],[110,215,'PC B'],[490,65,'PC C'],[490,215,'PC D'],[300,140,'SW']],edges:[[0,4],[1,4],[2,4],[3,4]],fault:{type:'node',index:4},actions:['Periksa daya dan status switch','Ganti NIC semua PC'],correct:0,explanation:'Gangguan pada perangkat pusat dapat memengaruhi seluruh perangkat yang terhubung.'},
  {title:'Misi 3 · Satu lantai terputus',topology:'Tree',symptom:'Perangkat pada satu segmen tidak dapat berkomunikasi; segmen lain normal. Identifikasi uplink yang bermasalah.',nodes:[[300,45,'CORE'],[180,135,'SW1'],[420,135,'SW2'],[95,225,'PC A'],[265,225,'PC B'],[335,225,'PC C'],[505,225,'PC D']],edges:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]],fault:{type:'edge',index:0},actions:['Periksa uplink CORE ke SW1','Ubah DNS di semua PC'],correct:0,explanation:'Gangguan pada uplink bersama dapat memutus satu segmen tanpa memengaruhi segmen lain.'},
  {title:'Misi 4 · Buktikan jalur alternatif',topology:'Mesh',symptom:'Link langsung PC A ke PC D terganggu. Uji apakah masih tersedia rute lain.',nodes:[[150,60,'PC A'],[450,60,'PC B'],[150,220,'PC C'],[450,220,'PC D']],edges:[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],fault:{type:'edge',index:2},actions:[],correct:0}
 ];
 let missionIndex=0,score=0,energy=4,attempts=0,selected=false,runId=0;
 const ns='http://www.w3.org/2000/svg';
 const svgNode=(tag,attrs,text)=>{const item=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([key,value])=>item.setAttribute(key,String(value)));if(text)item.textContent=text;return item;};
 function finish(){runId++;c.replaceChildren(create('h2',`🏁 Link Rescue selesai — ${score}/100`),create('p',`Energi tersisa: ${energy}/4. Setiap misi meminta diagnosis pada peta dan tindakan pemulihan yang sesuai.`));const saveButton=create('button','Simpan Nilai dan Lanjut');saveButton.onclick=()=>complete(score);const retry=create('button','Main Lagi','subtle');retry.onclick=()=>{missionIndex=0;score=0;energy=4;attempts=0;selected=false;render();};c.append(saveButton,retry);}
 function render(){
  runId++;const id=runId;c.replaceChildren();
  if(missionIndex>=missions.length){finish();return;}
  const mission=missions[missionIndex],header=create('div',undefined,'link-rescue-hud');
  header.append(create('strong',`MISI ${missionIndex+1}/4 · LINK RESCUE`),create('span',`⭐ ${score}/100 · ⚡ ${energy}/4`));
  c.append(header,create('h2',mission.title),create('p',mission.symptom));
  const figure=create('figure',undefined,'link-rescue-figure'),svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 600 280');svg.setAttribute('role','group');svg.setAttribute('aria-label',`Peta jaringan ${mission.topology} untuk diagnosis gangguan`);figure.append(svg);c.append(figure);
  mission.edges.forEach(([from,to],index)=>{
   const a=mission.nodes[from],b=mission.nodes[to],damaged=mission.fault.type==='edge'&&mission.fault.index===index;
   const line=svgNode('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:`link-rescue-link${damaged?' is-damaged':''}`,tabindex:0,role:'button','aria-label':`Link ${a[2]} ke ${b[2]}${damaged?', gangguan':''}`});
   const choose=()=>diagnose('edge',index);
   line.addEventListener('click',choose);line.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose();}});
   svg.append(line);
  });
  mission.nodes.forEach(([x,y,label],index)=>{
   const damaged=mission.fault.type==='node'&&mission.fault.index===index,group=svgNode('g',{class:`link-rescue-node${damaged?' is-damaged':''}`,tabindex:0,role:'button','aria-label':`${label}${damaged?', gangguan':''}; klik untuk mendiagnosis`});
   group.append(svgNode('circle',{cx:x,cy:y,r:25}));group.append(svgNode('text',{x,y:y+5},label));
   const choose=()=>diagnose('node',index);
   group.addEventListener('click',choose);group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose();}});
   svg.append(group);
  });
  const status=create('p','Klik link atau perangkat yang paling sesuai dengan gejala.','link-rescue-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');c.append(status);
  function diagnose(type,index){
   if(selected||energy<=0)return;
   if(mission.fault.type===type&&mission.fault.index===index){selected=true;status.textContent='✓ Titik gangguan ditemukan. Pilih tindakan pemulihan.';const actions=create('div',undefined,'link-rescue-actions');mission.actions.forEach((action,actionIndex)=>{const button=create('button',action);button.onclick=()=>{if(energy<=0)return;if(actionIndex===mission.correct){score+=Math.max(10,25-attempts*5);status.textContent=mission.explanation;missionIndex++;attempts=0;selected=false;setTimeout(()=>{if(missionIndex>=missions.length)finish();else render();},850);}else{attempts++;energy--;status.textContent=`Tindakan belum tepat. Energi tersisa ${energy}/4. Coba pemeriksaan yang lebih sesuai.`;if(energy<=0){actions.querySelectorAll('button').forEach(item=>item.disabled=true);setTimeout(finish,750);}}};actions.append(button);});c.append(actions);return;}
   attempts++;energy--;status.textContent=`Titik itu tidak paling sesuai dengan gejala. ⚡ Energi ${energy}/4.`;if(energy<=0){svg.querySelectorAll('[role=button]').forEach(item=>item.setAttribute('aria-disabled','true'));setTimeout(finish,750);}
  }
  if(missionIndex===3){
   const final={title:'Misi 4 · Buktikan jalur alternatif',topology:'Mesh',symptom:'Link langsung PC A ke PC D terganggu. Kirim paket dan amati apakah jaringan Mesh menyediakan jalur lain.',nodes:[[150,60,'PC A'],[450,60,'PC B'],[150,220,'PC C'],[450,220,'PC D']],edges:[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],fault:{type:'edge',index:2}};
   c.replaceChildren(create('div',undefined,'link-rescue-hud'),create('h2',final.title),create('p',final.symptom));
   const finalHud=c.firstChild;finalHud.append(create('strong',`MISI 4/4 · LINK RESCUE`),create('span',`⭐ ${score}/100 · ⚡ ${energy}/4`));
   const finalFigure=create('figure',undefined,'link-rescue-figure'),finalSvg=document.createElementNS(ns,'svg');finalSvg.setAttribute('viewBox','0 0 600 280');finalSvg.setAttribute('role','img');finalSvg.setAttribute('aria-label','Jaringan mesh dengan satu link langsung terputus');finalFigure.append(finalSvg);c.append(finalFigure);
   final.edges.forEach(([from,to],index)=>finalSvg.append(svgNode('line',{x1:final.nodes[from][0],y1:final.nodes[from][1],x2:final.nodes[to][0],y2:final.nodes[to][1],class:`link-rescue-link${index===2?' is-damaged':''}`})));
   final.nodes.forEach(([x,y,label])=>{finalSvg.append(svgNode('circle',{cx:x,cy:y,r:25,class:'link-rescue-node-circle'}),svgNode('text',{x,y:y+5,class:'link-rescue-label'},label));});
   const result=create('p','Jalur langsung terganggu. Uji pengiriman untuk menemukan rute yang masih aktif.','link-rescue-status');result.setAttribute('role','status');c.append(result);
   const send=create('button','📨 Uji Jalur Alternatif');send.onclick=async()=>{
    send.disabled=true;const packet=svgNode('circle',{cx:150,cy:60,r:9,class:'link-rescue-packet'});finalSvg.append(packet);
    const route=[[150,60],[450,60],[450,220]];
    for(let hop=1;hop<route.length;hop++){const [x1,y1]=route[hop-1],[x2,y2]=route[hop],start=performance.now();await new Promise(resolve=>{const frame=now=>{if(id!==runId||!finalSvg.isConnected){resolve();return;}const t=Math.min(1,(now-start)/420);packet.setAttribute('cx',String(x1+(x2-x1)*t));packet.setAttribute('cy',String(y1+(y2-y1)*t));if(t<1)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});if(id!==runId)return;}
    packet.remove();score+=25;result.textContent='✓ Paket tiba di PC D melalui PC B. Jalur alternatif Mesh menjaga konektivitas pada skenario ini.';setTimeout(finish,900);
   };c.append(send);return;
  }
 }
 render();
}
const arcade=[{name:'Pattern Rush',desc:'Identifikasi topologi dari diagram. Pilih jawaban yang sesuai.',types:['Star','Bus','Ring','Mesh'],pts:30},{name:'Design Decision',desc:'Pilih desain terbaik untuk kebutuhan sekolah.',types:['Star','Tree','Mesh'],pts:35},{name:'Fault Rescue',desc:'Pilih tindakan pemulihan berdasarkan gejala gangguan.',types:['Star','Tree','Mesh'],pts:35}];
function oldArcadeGame(c){$('check').hidden=true;const results=[];let step=0;const draw=()=>{c.replaceChildren();if(step===3){c.append(create('h2',`🏆 Topology Arcade Selesai — ${gameScore}/100`),create('p','Target kelulusan: 80. Selesaikan semua tantangan sebelum menyimpan nilai.'));const saveButton=create('button','Simpan Nilai');saveButton.onclick=()=>complete(gameScore);const retry=create('button','Ulangi','subtle');retry.onclick=()=>{step=0;gameScore=0;draw()};c.append(saveButton,retry);return}const g=arcade[step];c.append(create('h2',`🎮 ${step+1}/3 — ${g.name}`),create('p',g.desc));let question,opts,correct;if(step===0){const t='Ring';c.append(diagram(t));question='Topologi apakah yang ditunjukkan?';opts=['Bus','Ring','Star'];correct=1}else if(step===1){c.append(diagram('Tree'));question='Tiga ruangan sekolah dihubungkan melalui switch distribusi. Pola yang paling sesuai?';opts=['Tree hierarkis','Bus tanpa switch','Ring koaksial wajib'];correct=0}else{c.append(diagram('Star'));question='Hanya satu PC kehilangan koneksi di Star. Langkah paling masuk akal?';opts=['Periksa kabel/port PC tersebut','Ganti seluruh PC','Hapus semua IP'];correct=0}c.append(create('h3',question));choices(c,opts,i=>{gameScore+=i===correct?g.pts:0;step++;draw()})};gameScore=0;draw();}
function arcadeGame(c){$('check').hidden=true;import('./action-game.js?v=3').then(({mountActionGame})=>{if(current===7&&c.isConnected)mountActionGame(c,{moduleId:'topologi-jaringan',mode:'2d',onComplete:score=>complete(score)});}).catch(error=>{console.error(error);$('feedback').textContent='Game gagal dimuat. Muat ulang halaman.';});}
function posttest(c){const order=questions.map((q,i)=>({q,i}));for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}quiz=order.slice(0,10);answers={};c.append(create('p','Jawab 10 soal. Nilai minimal 80 untuk menyelesaikan modul.'));quiz.forEach(({q},i)=>{const box=create('section',undefined,'quiz-item');box.append(create('h3',`${i+1}. ${q[0]}`));choices(box,q[1],v=>answers[i]=v);c.append(box)});$('check').onclick=()=>{if(Object.keys(answers).length!==10){$('feedback').textContent='Jawab seluruh 10 soal.';return}complete(quiz.filter(({q},i)=>answers[i]===q[2]).length*10)};if(done(8))certificateForm();}
function certificateForm(){window.TJKTCertificateFlow?.refresh();}
function render(){drawNav();$('heading').textContent=lessons[current][0];$('description').textContent=lessons[current][1];$('crumb').className='lesson-kicker';$('crumb').textContent=`MATERI ${String(current+1).padStart(2,'0')}`;$('crumb').hidden=false;$('feedback').textContent=done(current)?`✓ Sudah lulus · Nilai terbaik ${state.scores[current]}/100`:'Selesaikan aktivitas untuk membuka tahap berikutnya.';$('next').disabled=(!window.TJKTLocalInstructor?.isActive()&&!done(current))||current===8;$('check').hidden=false;const c=$('lesson');c.replaceChildren();if(current<5){window.TopologyGames.addLearning(c,current,diagram);if(current===0)mountTopologySimulator(c);learningCheck(c);}else{if(current!==7)window.TopologyGames.addActivityGuide(c,current);if(current===5)builder(c);else if(current===6)faultGame(c);else if(current===7){const host=create('div');host.className='topology-arcade-host';c.append(host);arcadeGame(host);}else posttest(c)}}
$('next').onclick=()=>{if(current<8&&(window.TJKTLocalInstructor?.isActive()||done(current))){current++;render();window.scrollTo({top:0,behavior:'smooth'})}};$('reset').onclick=()=>{if(confirm('Hapus progres Topologi Jaringan?')){localStorage.removeItem(KEY);location.reload()}};import('./theme.js').then(({bindThemeToggle})=>bindThemeToggle($('theme'))).catch(error=>console.error('Tema halaman tidak dapat diinisialisasi:',error));render();
})();
