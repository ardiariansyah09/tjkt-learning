import { floorObstacles,blockedPoint,equalPoint,inspectRoute,layoutEstimate,cableLevels } from './layout-model.js';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const btn=(text,action)=>{const b=el('button',text,'secondary-action');b.type='button';b.addEventListener('click',action);return b;};
const NS='http://www.w3.org/2000/svg';
const shape=(tag,attrs,text)=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([key,value])=>n.setAttribute(key,String(value)));if(text!==undefined)n.textContent=text;return n;};
function drawGrid(svg,{width,height,obstacles,points,markers,cursor}){
  svg.replaceChildren();const cell=30,m=30;svg.setAttribute('viewBox',`0 0 ${(width+2)*cell} ${(height+2)*cell}`);
  svg.append(shape('rect',{x:m,y:m,width:width*cell,height:height*cell,fill:'#f8fafc',stroke:'#64748b'}));
  for(let x=0;x<=width;x++)svg.append(shape('line',{x1:m+x*cell,y1:m,x2:m+x*cell,y2:m+height*cell,stroke:'#cbd5e1','stroke-width':.6}));
  for(let y=0;y<=height;y++)svg.append(shape('line',{x1:m,y1:m+y*cell,x2:m+width*cell,y2:m+y*cell,stroke:'#cbd5e1','stroke-width':.6}));
  obstacles.forEach(r=>svg.append(shape('rect',{x:m+(r.x1-.35)*cell,y:m+(r.y1-.35)*cell,width:(r.x2-r.x1+.7)*cell,height:(r.y2-r.y1+.7)*cell,fill:'#fecaca',stroke:'#b91c1c'})));
  if(points.length)svg.append(shape('polyline',{points:points.map(([x,y])=>`${m+x*cell},${m+y*cell}`).join(' '),fill:'none',stroke:'#0284c7','stroke-width':5,'stroke-linejoin':'round'}));
  markers.forEach(({point,label})=>{svg.append(shape('circle',{cx:m+point[0]*cell,cy:m+point[1]*cell,r:8,fill:'#0f766e',stroke:'#fff','stroke-width':2}),shape('text',{x:m+point[0]*cell,y:m+point[1]*cell-12,'text-anchor':'middle',fill:'#0f172a','font-size':12},label));});
  if(cursor)svg.append(shape('circle',{cx:m+cursor[0]*cell,cy:m+cursor[1]*cell,r:11,fill:'none',stroke:'#d97706','stroke-width':3}));
  svg.append(shape('text',{x:m,y:(height+2)*cell-7,fill:'#334155','font-size':12},`1 kotak = 1 m · bidang ${width} × ${height} m · merah = area dilarang`));
}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),a=el('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function mountLayoutLab(root,record){
  root.append(el('p','Bidang latihan 24 × 16 m. Pilih mode, lalu klik titik grid atau gunakan koordinat. Segmen kabel mengikuti sumbu horizontal/vertikal; area merah tidak boleh dipotong. Posisi AP hanya penempatan simbol, bukan simulasi cakupan radio.'));
  const form=el('form',undefined,'topic-form'),fields=el('div',undefined,'studio-inputs'),controls={};form.append(fields);root.append(form);
  function number(name,label,value,min,max){const wrap=el('label',label),n=el('input');n.name=name;n.type='number';n.value=value;n.min=min;n.max=max;n.required=true;wrap.append(n);fields.append(wrap);controls[name]=n;return n;}
  number('scale','Skala 1 : n',100,20,1000);number('reserve','Cadangan panjang (%)',10,0,100);number('rise','Tambahan vertikal/terminasi (m)',2,0,100);
  const modeLabel=el('label','Mode penempatan'),mode=el('select');mode.name='mode';[['route','Tambahkan titik jalur'],['rack','Letakkan rack'],['pc','Letakkan endpoint'],['ap','Letakkan AP']].forEach(([value,text])=>{const option=el('option',text);option.value=value;mode.append(option);});modeLabel.append(mode);fields.append(modeLabel);
  number('x','Koordinat x (m)',2,0,24);number('y','Koordinat y (m)',2,0,16);
  const apply=el('button','Terapkan titik','primary-action');apply.type='submit';form.append(apply);
  let rack=[2,2],pc=[22,12],ap=[18,3],points=[[2,2],[2,13],[22,13],[22,12]],cursor=[2,2];
  const svg=shape('svg',{class:'layout-grid',tabindex:0,role:'application','aria-label':'Denah interaktif. Panah menggerakkan penunjuk; Enter menerapkan titik sesuai mode.'});root.append(svg);
  const status=el('p',undefined,'studio-feedback');status.setAttribute('role','status');status.setAttribute('aria-live','polite');root.append(status);
  let message='';
  function draw(){const scale=Number(controls.scale.value),reserve=Number(controls.reserve.value),rise=Number(controls.rise.value);const r=layoutEstimate(points,scale,reserve,rise),complete=points.length>1&&equalPoint(points[0],rack)&&equalPoint(points.at(-1),pc);drawGrid(svg,{width:24,height:16,obstacles:floorObstacles,points,markers:[{point:rack,label:'RACK'},{point:pc,label:'ENDPOINT'},{point:ap,label:'AP'}],cursor});
    status.textContent=`${message?message+' ':''}Jalur ${r.length} m; panjang garis jalur di kertas pada 1:${scale} = ${r.paperCm.toFixed(1)} cm. Estimasi kabel ${r.cable.toFixed(1)} m (jalur + ${reserve}% + ${rise} m). ${complete?'Jalur sudah mencapai endpoint.':'Jalur belum menghubungkan rack ke endpoint.'} Ekspor SVG pada ukuran asli agar skala fisiknya dipertahankan.`;
    if(form.checkValidity())record({scale,reserve,rise,rack:[...rack],pc:[...pc],ap:[...ap],points:points.map(p=>[...p])},{...r,complete});else record({},null);
  }
  function act(point){if(blockedPoint(point,floorObstacles)){message='Titik berada di area terlarang.';draw();return;}
    if(mode.value==='route'){const candidate=[...points,point],r=inspectRoute(candidate);if(!r.valid){message=r.reason;draw();return;}if(!equalPoint(points.at(-1),point))points.push(point);}
    else if(mode.value==='rack'){rack=point;points=[[...rack]];}
    else if(mode.value==='pc'){pc=point;points=[[...rack]];}else ap=point;
    cursor=point;controls.x.value=point[0];controls.y.value=point[1];message='Titik diterapkan.';draw();
  }
  form.addEventListener('submit',event=>{event.preventDefault();if(form.reportValidity())act([Number(controls.x.value),Number(controls.y.value)]);});
  ['scale','reserve','rise'].forEach(name=>controls[name].addEventListener('input',()=>{if(form.checkValidity())draw();else record({},null);}));
  svg.addEventListener('click',event=>{if(!form.reportValidity())return;const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;const transformed=point.matrixTransform(svg.getScreenCTM().inverse()),x=Math.round((transformed.x-30)/30),y=Math.round((transformed.y-30)/30);if(x>=0&&y>=0&&x<=24&&y<=16)act([x,y]);});
  svg.addEventListener('keydown',event=>{const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[event.key];if(d){event.preventDefault();cursor=[Math.max(0,Math.min(24,cursor[0]+d[0])),Math.max(0,Math.min(16,cursor[1]+d[1]))];draw();}else if(event.key==='Enter'){event.preventDefault();if(form.reportValidity())act([...cursor]);}});
  const toolbar=el('div',undefined,'layout-toolbar');toolbar.append(btn('Urungkan titik jalur',()=>{if(points.length>1)points.pop();message='Titik terakhir diurungkan.';draw();}),btn('Mulai jalur dari rack',()=>{points=[[...rack]];message='Jalur baru dimulai.';draw();}),btn('Ekspor SVG berskala',()=>{if(!form.reportValidity())return;const copy=svg.cloneNode(true),scale=Number(controls.scale.value);copy.setAttribute('xmlns',NS);copy.setAttribute('width',`${26*1000/scale}mm`);copy.setAttribute('height',`${18*1000/scale}mm`);copy.removeAttribute('class');download('layout-jaringan.svg',new XMLSerializer().serializeToString(copy),'image/svg+xml');}),btn('Ekspor rancangan JSON',()=>{if(form.reportValidity())download('layout-jaringan.json',JSON.stringify({version:1,unit:'m',scale:Number(controls.scale.value),rack,pc,ap,points,obstacles:floorObstacles},null,2),'application/json');}));root.append(toolbar,el('p','Skala cetak berlaku pada SVG berukuran asli; ukuran di layar mengikuti viewport. Estimasi belum menghitung seluruh detail tray, naik-turun jalur, slack tiap titik, bend radius, standar aplikasi, atau izin lokasi. Penempatan simbol dan rute bukan izin instalasi.','studio-boundary'));draw();
}

export function mountLayoutGame(root,{onComplete=()=>{}}={}){
  let level=0,path=[],damages=0,completed=false,lost=false,message='';
  const game=el('section',undefined,'layout-game');game.append(el('h3','Cable Route Builder'),el('p','Gerakkan ujung kabel dari S ke T dengan panah/WASD atau tombol arah. Hindari area merah dan selesaikan jalur dalam panjang gulungan. Tiga tabrakan menyebabkan kegagalan; urungkan langkah untuk menghemat kabel.'));
  const hud=el('p'),svg=shape('svg',{class:'layout-grid',tabindex:0,role:'application','aria-label':'Game pemasangan jalur kabel. Panah atau WASD menggambar jalur; Backspace mengurungkan.'}),feedback=el('p',undefined,'studio-feedback');feedback.setAttribute('role','status');
  const controls=el('div',undefined,'layout-toolbar');[['↑','up'],['↓','down'],['←','left'],['→','right']].forEach(([label,action])=>{const b=btn(label,()=>move(action));b.dataset.cableMove=action;b.setAttribute('aria-label',`Gerak ${action}`);controls.append(b);});
  const undo=btn('Urungkan langkah',()=>{if(path.length>1&&!completed&&!lost){path.pop();message='Satu meter kabel dikembalikan.';draw();}});undo.dataset.cableAction='undo';
  const next=btn('Level berikutnya',()=>{if(won()&&!completed){level++;path=[[...cableLevels[level].start]];damages=0;message='Gulungan baru siap.';draw();}});next.dataset.cableAction='next';
  const reset=btn('Ulangi permainan',()=>resetGame());reset.dataset.cableAction='reset';game.append(hud,svg,controls,undo,next,reset,feedback,el('p','Game menguji strategi rute pada grid 1 m dan gulungan terbatas. Tabrakan adalah aturan permainan, bukan prosedur penanganan bahaya nyata. Tidak memodelkan radio, rugi optik, atau pemasangan fisik.','studio-boundary'));root.append(game);
  function won(){return equalPoint(path.at(-1),cableLevels[level].goal);}
  function move(action){if(completed||lost||won())return;const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[action],current=path.at(-1),point=[current[0]+d[0],current[1]+d[1]],r=inspectRoute([current,point],{width:10,height:6,obstacles:cableLevels[level].obstacles});
    if(!r.valid){damages++;lost=damages>=3;message=lost?'Tiga tabrakan. Ulangi permainan.':'Area dilarang atau batas bidang; pilih jalur lain.';}else if(path.length-1>=cableLevels[level].spool){message='Gulungan habis. Urungkan langkah untuk menyusun rute lain.';}else{path.push(point);message='Satu meter kabel digelar.';if(won()){message='Jalur mencapai tujuan dalam batas gulungan.';if(level===2){completed=true;message='Tiga rute selesai! Skor 100/100.';draw();onComplete(100);return;}}}draw();
  }
  function draw(){const config=cableLevels[level];hud.textContent=`Level ${level+1}/3 · ${config.name} · Kabel ${path.length-1}/${config.spool} m · Tabrakan ${damages}/3`;feedback.textContent=message;next.hidden=!won()||completed;drawGrid(svg,{width:10,height:6,obstacles:config.obstacles,points:path,markers:[{point:config.start,label:'S'},{point:config.goal,label:'T'}],cursor:path.at(-1)});game.dataset.state=JSON.stringify({level,path:path.map(p=>[...p]),damages,lost,completed,won:won(),used:path.length-1});}
  function resetGame(){level=0;path=[[...cableLevels[0].start]];damages=0;completed=false;lost=false;message='Mulai dari S dan rencanakan lintasan ke T.';draw();}
  svg.addEventListener('keydown',event=>{const action={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[event.key];if(action){event.preventDefault();move(action);}else if(event.key==='Backspace'){event.preventDefault();undo.click();}});resetGame();return {reset:resetGame,dispose(){game.remove();}};
}
