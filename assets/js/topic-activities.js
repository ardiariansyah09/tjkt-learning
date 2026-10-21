import { capacity,parseIPv6,ticketLoad,sensorData,venture,propagation,opticalPower } from './topic-models.js';

const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const btn=(text,action)=>{const node=el('button',text,'secondary-action');node.type='button';node.addEventListener('click',action);return node;};
const money=n=>`Rp${n.toLocaleString('id-ID')}`;
const configurations={
  'k3-budaya-kerja': ['Inspeksi area kerja dan lembar JSA','safety',mountSafety],
  'perencanaan-jaringan':['Rancang kapasitas panel switch','ports',mountPorts],
  'ipv6-dasar':['Bongkar dan periksa alamat IPv6','ipv6',mountIPv6],
  'proses-bisnis-tjkt':['Atur antrean tiket dan beban teknisi','tickets',mountTickets],
  'wawasan-tjkt':['Aliran data sensor: lokal, edge, dan cloud','sensors',mountSensors],
  'profesi-kewirausahaan-tjkt':['Uji biaya, pendapatan, dan titik impas','venture',mountVenture],
  'sistem-telekomunikasi-dasar':['Telusuri waktu rambat sinyal','propagation',mountPropagation],
  'alat-ukur-tjkt':['Meja ukur daya dan rugi optik virtual','optical',mountOptical]
};
export const topicActivityTypes=Object.fromEntries(Object.entries(configurations).map(([id,c])=>[id,c[1]]));

function field(area,name,label,value,{min=0,max=1000000,step=1,type='number'}={}){
  const wrap=el('label',label),input=el('input');input.name=name;input.type=type;input.value=value;
  if(type!=='text'){input.min=min;input.max=max;input.step=step;}input.required=true;
  wrap.append(input);area.append(wrap);return input;
}
function formFor(root){const form=el('form',undefined,'topic-form'),fields=el('div',undefined,'studio-inputs');form.append(fields);root.append(form);return {form,fields};}
function feedback(root){const p=el('p',undefined,'studio-feedback');p.setAttribute('role','status');p.setAttribute('aria-live','polite');root.append(p);return p;}
function boundary(root,text){root.append(el('p',text,'studio-boundary'));}
function bar(root,label,value,maximum,kind=''){
  const row=el('div',undefined,`topic-bar ${kind}`),caption=el('span',label),track=el('div',undefined,'topic-bar-track'),fill=el('span');
  fill.style.width=`${Math.max(0,Math.min(100,100*value/Math.max(maximum,1)))}%`;track.append(fill);row.append(caption,track);root.append(row);
}
function connectForm(form,update){
  form.addEventListener('submit',event=>{event.preventDefault();if(form.reportValidity())update();});
  form.addEventListener('input',()=>{if(form.checkValidity())update();});
}
const values=(controls)=>Object.fromEntries(Object.entries(controls).map(([key,input])=>[key,input.type==='text'?input.value:Number(input.value)]));

export function mountTopicActivities(moduleId){
  const config=configurations[moduleId];if(!config)return;
  const root=document.querySelector('.lesson-content');if(!root)return;
  const key=`tjkt:${moduleId}:studio:v1`;
  let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(saved));return true;}catch{return false;}};
  function mount(){
    const lab=root.querySelector('#laboratorium'),reflection=root.querySelector('#refleksi');
    if(!lab||!reflection)return false;
    if(lab.querySelector('[data-topic-activity]'))return true;
    const activity=el('section',undefined,'topic-activity');activity.dataset.topicActivity=config[1];
    activity.append(el('h2',config[0]));
    const log=el('p','Uji satu perubahan, amati hasil, lalu catat bukti percobaan.','topic-save-status');log.setAttribute('role','status');
    let latest=null;
    config[2](activity,(inputs,result)=>{latest=result===null?null:{inputs,result};activity.dataset.result=JSON.stringify(result);});
    activity.append(btn('Catat percobaan',()=>{
      const form=activity.querySelector('.topic-form');
      if(form&&!form.reportValidity()){log.textContent='Perbaiki input percobaan sebelum mencatat hasil.';return;}
      if(!latest){log.textContent='Lengkapi satu percobaan yang valid terlebih dahulu.';return;}
      saved.experiments=Array.isArray(saved.experiments)?saved.experiments:[];
      saved.experiments.push({at:new Date().toISOString(),...latest});saved.experiments=saved.experiments.slice(-30);
      log.textContent=save()?`Percobaan tersimpan. ${saved.experiments.length} catatan tersedia pada browser ini.`:'Penyimpanan tidak tersedia; salin atau ekspor catatan Anda.';
    }),log);lab.append(activity);
    const journal=el('section',undefined,'topic-journal');journal.append(el('h2','Jurnal bukti dan tindak lanjut'));
    const form=el('form',undefined,'studio-journal'),fields={};
    [['prediction','Prediksi awal'],['evidence','Hasil dan bukti percobaan'],['reasoning','Penjelasan serta batas kesimpulan'],['transfer','Perbaikan dan rencana uji berikutnya']].forEach(([name,label])=>{
      const wrap=el('label',label),input=el('textarea');input.name=name;input.rows=3;input.maxLength=6000;input.value=typeof saved.journal?.[name]==='string'?saved.journal[name]:'';wrap.append(input);form.append(wrap);fields[name]=input;
    });
    const status=feedback(journal),collect=()=>{saved.journal=Object.fromEntries(Object.entries(fields).map(([name,input])=>[name,input.value.trim()]));};
    const submit=el('button','Simpan jurnal','primary-action');submit.type='submit';form.append(submit);
    form.addEventListener('submit',event=>{event.preventDefault();collect();status.textContent=save()?'Jurnal tersimpan pada browser ini.':'Penyimpanan tidak tersedia; ekspor jurnal.';});
    journal.append(form,btn('Ekspor jurnal dan percobaan',()=>{
      collect();save();const url=URL.createObjectURL(new Blob([JSON.stringify({moduleId,activity:config[1],journal:saved.journal,experiments:saved.experiments||[]},null,2)],{type:'application/json'}));
      const link=el('a');link.href=url;link.download=`jurnal-${moduleId}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }));reflection.append(journal);return true;
  }
  if(!mount()){const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});observer.observe(root,{childList:true,subtree:true});}
}

function mountSafety(root,record){
  root.append(el('p','Pilih area pada denah, periksa temuannya, lalu terapkan tindakan pada lembar inspeksi. Praktik ini melatih JSA; tidak menghitung efektivitas pengendalian dengan persentase buatan.'));
  const room=el('div',undefined,'inspection-room'),report=el('div',undefined,'inspection-report');
  const hazards=[
    {label:'Kabel daya rusak',place:'Sisi rak',evidence:'Selubung kabel daya terkelupas. Sumber belum diamankan.',stop:true,actions:['Hentikan pemakaian dan tandai area','Laporkan kepada guru/petugas berwenang'],result:'Pemakaian dihentikan dan temuan dilaporkan. Area tetap menunggu pengamanan/verifikasi petugas; siswa tidak memperbaiki penghantar.'},
    {label:'Jalur terhalang',place:'Pintu keluar',evidence:'Patch cord latihan yang sudah terlepas melintang di jalur berjalan.',stop:false,actions:['Alihkan kabel latihan ke jalur aman','Periksa kembali akses keluar'],result:'Hambatan simulasi telah dipindahkan dan akses diperiksa. Pengaturan jalur tetap perlu dijaga saat kegiatan berlangsung.'},
    {label:'Serpihan fiber',place:'Meja terminasi',evidence:'Serpihan berada di luar wadah; status sumber optik belum diketahui.',stop:true,actions:['Batasi akses meja dan hentikan aktivitas','Minta penanganan sesuai SOP kepada guru'],result:'Area dibatasi. Penanganan serpihan dan identifikasi sumber dilakukan sesuai SOP oleh pihak yang berwenang; jangan meniup atau menatap fiber.'},
    {label:'Posisi kerja',place:'Meja komputer',evidence:'Layar terlalu rendah dan posisi kerja tidak pernah diselingi.',stop:false,actions:['Sesuaikan stasiun kerja bersama guru','Atur pergantian tugas dan jeda'],result:'Penataan dan pola kerja diperbaiki. Tinjau keluhan pengguna dan sesuaikan lagi bila perlu.'}
  ];
  const completed=hazards.map(()=>new Set());let selected=0;
  const summary=feedback(root);
  function draw(){
    report.replaceChildren();const h=hazards[selected];report.append(el('h3',h.label),el('p',`${h.place}: ${h.evidence}`),el('strong',h.stop?'STOP — tunggu penanganan berwenang':'Perbaikan tata kerja pada objek latihan'));
    h.actions.forEach((action,i)=>{const b=btn(`${completed[selected].has(i)?'✓ ':''}${action}`,()=>{completed[selected].add(i);draw();});b.dataset.safetyAction=i;report.append(b);});
    const all=completed[selected].size===h.actions.length;
    summary.textContent=all?h.result:'Identifikasi sumber bahaya, dampak, tindakan, serta penanggung jawab sebelum menyatakan pekerjaan dapat dilanjutkan.';
    const state={selected,completed:completed.map(set=>set.size),stop:hazards.filter(h=>h.stop).map(h=>h.label)};record({area:h.label},state);
    room.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===selected)));
  }
  hazards.forEach((h,i)=>{const button=btn(`${h.place} · ${h.label}`,()=>{selected=i;draw();});button.dataset.hazard=i;room.append(button);});
  root.append(room,report);boundary(root,'Denah dan kondisi bersifat latihan. Penandaan selesai tidak menyatakan sumber berbahaya sudah aman atau memberi izin bekerja. Verifikasi dilakukan guru/petugas sesuai SOP.');draw();
}

function mountPorts(root,record){
  root.append(el('p','Susun kebutuhan port, lalu periksa panel switch: biru terpakai, kuning cadangan, dan abu-abu belum dialokasikan. Perubahan kebutuhan langsung mengubah panel.'));
  const {form,fields}=formFor(root),controls={
    clients:field(fields,'clients','PC berkabel',24,{max:1000}),extra:field(fields,'extra','Printer/server/AP',2,{max:1000}),uplinks:field(fields,'uplinks','Port uplink pada switch ini',1,{max:100}),reserve:field(fields,'reserve','Cadangan (%)',20,{max:100}),ports:field(fields,'ports','Port tersedia',48,{min:1,max:96})
  };
  const panel=el('div',undefined,'switch-port-panel'),output=feedback(root);root.append(panel);
  function update(){const v=values(controls),r=capacity(v.clients,v.extra,v.uplinks,v.reserve,v.ports);panel.replaceChildren();
    for(let i=0;i<v.ports;i++){const port=el('span',String(i+1),`switch-port ${i<r.current?'occupied':i<r.required?'reserved':'free'}`);port.title=i<r.current?'Terpakai':i<r.required?'Cadangan':'Belum dialokasikan';panel.append(port);}
    output.textContent=`${r.current} port kebutuhan sekarang + ${r.spare} cadangan = ${r.required} port. ${r.enough?`Cukup; sisa ${r.remaining} port.`:`Kurang ${-r.remaining} port. Perbesar kapasitas atau tinjau rancangan.`}`;record(v,r);
  }
  connectForm(form,update);boundary(root,'Model satu switch; kapasitas uplink, daya PoE, fitur, panjang jalur, dan pembagian beberapa switch perlu rancangan terpisah.');update();
}

function mountIPv6(root,record){
  root.append(el('p','Masukkan alamat, periksa delapan hextet hasil ekspansi, dan lihat posisi batas prefix. Bandingkan alamat valid dengan sintaks yang keliru.'));
  const {form,fields}=formFor(root),input=field(fields,'address','Alamat IPv6 (boleh /prefix)','2001:0db8:0000:0001:0000:0000:0000:0010/64',{type:'text'});
  const submit=el('button','Periksa alamat','primary-action');submit.type='submit';form.append(submit);
  const hextets=el('div',undefined,'ipv6-hextets'),output=feedback(root);root.append(hextets);
  function update(){hextets.replaceChildren();try{const r=parseIPv6(input.value);
    r.expanded.split(':').forEach((part,i)=>{const cell=el('div',undefined,'ipv6-hextet');cell.append(el('small',`Bit ${i*16}–${i*16+15}`),el('code',part));const covered=r.prefix===null?0:Math.max(0,Math.min(16,r.prefix-i*16));cell.style.setProperty('--prefix-share',`${covered/16*100}%`);cell.append(el('small',covered===16?'Seluruh hextet dalam prefix':covered?`${covered} bit dalam prefix`:'Di luar prefix / belum diberikan'));hextets.append(cell);});
    output.textContent=`Lengkap: ${r.expanded}\nKanonis: ${r.canonical}${r.prefix===null?'':`/${r.prefix}`}\nLingkup: ${r.scope}. ${r.documentation?'Alamat dokumentasi, bukan alokasi Internet sekolah.':''} Sintaks valid belum membuktikan jalur atau layanan berfungsi.`;record({address:input.value},r);
  }catch(error){output.textContent=`Periksa input: ${error.message}`;record({address:input.value},null);}}
  connectForm(form,update);boundary(root,'Latihan notasi heksadesimal dan prefix; tidak mencakup semua bentuk khusus seperti zone ID atau notasi campuran IPv4. Bagian di luar prefix tidak otomatis seluruhnya merupakan ID interface pada semua panjang prefix.');update();
}

function mountTickets(root,record){
  root.append(el('p','Ubah beban harian, lalu alokasikan tiket ke teknisi. Bandingkan kapasitas agregat dengan pembagian nyata: satu teknisi dapat kelebihan beban meskipun total kapasitas masih cukup.'));
  const {form,fields}=formFor(root),controls={tickets:field(fields,'tickets','Jumlah tiket',10,{max:24}),duration:field(fields,'duration','Menit per tiket model',45,{min:1,max:600}),staff:field(fields,'staff','Jumlah teknisi',2,{min:1,max:4}),minutes:field(fields,'minutes','Menit produktif per teknisi',300,{min:1,max:1440})};
  const board=el('div',undefined,'ticket-board'),output=feedback(root);root.append(board);let assignment=[],signature='';
  function update(){const v=values(controls),next=JSON.stringify(v);if(signature!==next){assignment=Array(v.tickets).fill(-1);signature=next;}const r=ticketLoad(v.tickets,v.duration,v.staff,v.minutes);board.replaceChildren();
    const queue=el('div',undefined,'ticket-queue');queue.append(el('h3','Tiket belum dialokasikan'));
    assignment.forEach((owner,i)=>{if(owner!==-1)return;const card=el('article',undefined,'ticket-card');card.append(el('strong',`T${i+1} · ${i<2?'Prioritas tinggi':'Rutin'}`),el('span',`${v.duration} menit`));for(let t=0;t<v.staff;t++){const b=btn(`Ke teknisi ${t+1}`,()=>{assignment[i]=t;update();});b.dataset.assignTicket=i;b.dataset.technician=t;card.append(b);}queue.append(card);});board.append(queue);
    const loads=Array.from({length:v.staff},(_,t)=>assignment.filter(owner=>owner===t).length*v.duration);
    loads.forEach((load,t)=>{const lane=el('div',undefined,'technician-lane');lane.append(el('h3',`Teknisi ${t+1}`));bar(lane,`${load}/${v.minutes} menit`,load,v.minutes,load>v.minutes?'warning':'');assignment.forEach((owner,i)=>{if(owner===t)lane.append(btn(`T${i+1} · kembalikan ke antrean`,()=>{assignment[i]=-1;update();}));});board.append(lane);});
    output.textContent=`Beban ${r.work} menit; kapasitas ${r.available} menit; utilisasi ${r.utilization.toFixed(1)}%. ${r.remaining<0?`Kekurangan ${-r.remaining} menit.`:`Sisa agregat ${r.remaining} menit.`} Belum dialokasikan: ${assignment.filter(owner=>owner===-1).length}. Periksa distribusi per teknisi sebelum menjanjikan penyelesaian.`;record({...v,assignment:[...assignment]},{...r,loads});
  }
  connectForm(form,update);boundary(root,'Durasi disamakan untuk memisahkan pengaruh alokasi. Prioritas dan menit di papan adalah data latihan; model tidak menghitung waktu respons, antrean dinamis, keahlian, atau jaminan SLA.');update();
}

function mountSensors(root,record){
  root.append(el('p','Amati aliran sensor → edge → jaringan → cloud. Kurangi data kirim atau putuskan uplink untuk membedakan data lokal dari data yang mencapai cloud.'));
  const {form,fields}=formFor(root),controls={sensors:field(fields,'sensors','Sensor',40,{min:1,max:10000}),bytes:field(fields,'bytes','Byte per sampel model',1000,{min:1}),interval:field(fields,'interval','Interval sampel (detik)',60,{min:1,max:86400}),retained:field(fields,'retained','Data dikirim setelah edge (%)',100,{max:100})};
  let online=true;const toggle=btn('Putuskan uplink',()=>{online=!online;toggle.textContent=online?'Putuskan uplink':'Sambungkan uplink';update();});toggle.dataset.uplink='toggle';form.append(toggle);
  const pipeline=el('div',undefined,'sensor-pipeline'),output=feedback(root);root.append(pipeline);
  function update(){const v=values(controls),r=sensorData(v.sensors,v.bytes,v.interval,v.retained);pipeline.replaceChildren();
    [['Sensor',`${r.samples.toFixed(0)} sampel/hari`],['Edge',`${(r.raw/1e6).toFixed(3)} MB mentah/hari`],['Uplink',online?'Tersambung':'TERPUTUS'],['Cloud',`${(online?r.sent/1e6:0).toFixed(3)} MB/hari tiba`]].forEach(([title,text],i)=>{const card=el('div',undefined,`sensor-stage ${i===2&&!online?'warning':''}`);card.append(el('strong',title),el('span',text));pipeline.append(card);});
    bar(pipeline,'Data mentah',r.raw,r.raw);bar(pipeline,'Data yang direncanakan dikirim',r.sent,r.raw);bar(pipeline,'Tiba di cloud',online?r.sent:0,r.raw);
    output.textContent=`Volume mentah ${(r.raw/1e6).toFixed(3)} MB/hari; volume kirim ${(r.sent/1e6).toFixed(3)} MB/hari; pengurangan ${(r.saved/1e6).toFixed(3)} MB/hari. ${online?'Aliran ke cloud tersedia pada model.':'Tidak ada data baru tiba di cloud. Buffer lokal diperlukan bila data harus disimpan; kapasitasnya belum dihitung.'} Ringkasan yang lebih kecil dapat kehilangan detail kejadian penting.`;record({...v,online},{...r,delivered:online?r.sent:0});
  }
  connectForm(form,update);boundary(root,'1 MB = 1.000.000 byte. Model rata-rata harian tidak menghitung overhead tambahan, pengiriman ulang, kapasitas buffer, atau menjamin semua informasi dipertahankan.');update();
}

function mountVenture(root,record){
  root.append(el('p','Geser jumlah pekerjaan untuk melihat posisi pendapatan terhadap total biaya. Ubah harga dan biaya, lalu amati perubahan titik pertemuan kedua garis. Angka seluruhnya fiktif.'));
  const {form,fields}=formFor(root),controls={fixed:field(fields,'fixed','Biaya tetap per bulan (Rp)',600000,{max:1000000000}),variable:field(fields,'variable','Biaya variabel per pekerjaan (Rp)',90000,{max:1000000000}),price:field(fields,'price','Harga per pekerjaan (Rp)',150000,{max:1000000000}),jobs:field(fields,'jobs','Jumlah pekerjaan',8,{max:40,type:'range'})};
  const chart=el('div',undefined,'venture-chart'),output=feedback(root);root.append(chart);
  const NS='http://www.w3.org/2000/svg';
  function shape(tag,attrs,text){const node=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));if(text)node.textContent=text;return node;}
  function update(){const v=values(controls),r=venture(v.fixed,v.variable,v.price,v.jobs),maxJobs=40,maxMoney=Math.max(v.price*maxJobs,v.fixed+v.variable*maxJobs,1);chart.replaceChildren();
    const svg=shape('svg',{viewBox:'0 0 620 300',role:'img','aria-label':'Grafik pendapatan dan total biaya untuk 0 sampai 40 pekerjaan'}),x=n=>55+n/maxJobs*530,y=n=>255-n/maxMoney*220;
    svg.append(shape('path',{d:'M55 25V255H590',fill:'none',stroke:'currentColor'}));
    svg.append(shape('line',{x1:x(0),y1:y(0),x2:x(maxJobs),y2:y(v.price*maxJobs),stroke:'#0284c7','stroke-width':4}),shape('line',{x1:x(0),y1:y(v.fixed),x2:x(maxJobs),y2:y(v.fixed+v.variable*maxJobs),stroke:'#d97706','stroke-width':4}));
    svg.append(shape('line',{x1:x(v.jobs),y1:25,x2:x(v.jobs),y2:255,stroke:'currentColor','stroke-dasharray':'5 5'}),shape('circle',{cx:x(v.jobs),cy:y(r.revenue),r:6,fill:'#0284c7'}),shape('circle',{cx:x(v.jobs),cy:y(r.cost),r:6,fill:'#d97706'}));
    svg.append(shape('text',{x:55,y:285,fill:'currentColor'},'0 pekerjaan'),shape('text',{x:475,y:285,fill:'currentColor'},'40 pekerjaan'),shape('text',{x:65,y:20,fill:'currentColor'},`Skala atas ${money(maxMoney)}`));chart.append(svg,el('p','Biru: pendapatan · Jingga: total biaya · Garis putus: volume dipilih'));
    output.textContent=`${v.jobs} pekerjaan: pendapatan ${money(r.revenue)}, total biaya ${money(r.cost)}, laba/rugi model ${money(r.profit)}. Kontribusi per pekerjaan ${money(r.contribution)}. ${r.contribution===0&&v.fixed===0?'Pendapatan sama dengan biaya pada semua volume model.':r.breakEven===null?'Tidak ada titik impas volume positif pada parameter ini.':`Titik impas ${r.breakEven} pekerjaan per bulan${r.breakEven>40?' (di luar rentang grafik)':''}.`}`;record(v,r);
  }
  connectForm(form,update);boundary(root,'Grafik tidak membuktikan permintaan, kapasitas, atau saldo kas. Pajak, piutang, pendanaan, dan perubahan biaya belum dihitung.');update();
}

function mountPropagation(root,record){
  root.append(el('p','Kirim pulsa sepanjang lintasan, lalu lanjutkan perjalanan balik. Posisi pulsa memperlihatkan perbedaan satu arah dan RTT; gerak layar sengaja diperlambat agar dapat diamati.'));
  const {form,fields}=formFor(root),distance=field(fields,'distance','Total lintasan satu arah (km)',1000,{max:1000000,step:'any'}),wrap=el('label','Kecepatan rambat pendekatan'),speed=el('select');speed.name='speed';[['300000','Udara/vakum · 300.000 km/s'],['200000','Fiber · 200.000 km/s']].forEach(([v,t])=>{const o=el('option',t);o.value=v;speed.append(o);});speed.value='200000';wrap.append(speed);fields.append(wrap);
  const track=el('div',undefined,'propagation-track'),source=el('span','A'),pulse=el('span','●','signal-pulse'),target=el('span','B');track.append(source,pulse,target);const output=feedback(root);root.append(track);
  let leg=0;const send=btn('Kirim A → B',()=>{leg=1;draw();}),back=btn('Lanjutkan B → A',()=>{leg=2;draw();});send.dataset.pulse='send';back.dataset.pulse='return';form.append(send,back,btn('Reset lintasan',()=>{leg=0;draw();}));
  function draw(){const r=propagation(Number(distance.value),Number(speed.value));back.disabled=leg!==1;pulse.style.left=leg===1?'calc(100% - 30px)':'20px';pulse.classList.toggle('returning',leg===2);
    output.textContent=`Satu arah ${r.oneWay.toFixed(4)} ms; RTT propagasi simetris ${r.rtt.toFixed(4)} ms. ${leg===0?'Pulsa siap dikirim.':leg===1?`Pulsa tiba di B: waktu model ${r.oneWay.toFixed(4)} ms.`:`Pulsa kembali ke A: waktu model ${r.rtt.toFixed(4)} ms.`} Serialisasi, antrean, dan pemrosesan belum termasuk.`;record({distance:Number(distance.value),speed:Number(speed.value),leg},r);
  }
  connectForm(form,()=>{leg=0;draw();});boundary(root,'Gerak layar bukan waktu nyata. Gunakan seluruh panjang lintasan satu arah; bumi–satelit–bumi memiliki dua segmen. Kecepatan fiber pendekatan dan jalur balik dianggap simetris.');draw();
}

function mountOptical(root,record){
  root.append(el('p','Bandingkan pembacaan referensi sumber dengan daya setelah melewati link. Geser rugi link dan amati display meter serta batas sensitivitas/overload. Tidak ada laser atau perangkat fisik yang dikendalikan.'));
  const {form,fields}=formFor(root),controls={transmit:field(fields,'transmit','Daya sumber (dBm fiktif)',-3,{min:-60,max:30,step:'any'}),loss:field(fields,'loss','Total rugi link (dB)',8,{max:40,step:.5,type:'range'}),sensitivity:field(fields,'sensitivity','Sensitivitas (dBm fiktif)',-18,{min:-80,max:20,step:'any'}),maximum:field(fields,'maximum','Batas maksimum (dBm fiktif)',-1,{min:-60,max:30,step:'any'})};
  let reference=false;const referenceButton=btn('Baca referensi sumber',()=>{reference=!reference;referenceButton.textContent=reference?'Ukur setelah link':'Baca referensi sumber';update();});referenceButton.dataset.opticalReference='toggle';form.append(referenceButton);
  const bench=el('div',undefined,'optical-bench'),source=el('div','Sumber optik','optical-source'),link=el('div','Link fiber','optical-link'),meter=el('output',undefined,'optical-meter');meter.setAttribute('aria-label','Pembacaan power meter virtual');bench.append(source,link,meter);root.append(bench);const output=feedback(root);
  function update(){try{const v=values(controls),r=opticalPower(v.transmit,v.loss,v.sensitivity,v.maximum);meter.textContent=`${(reference?v.transmit:r.received).toFixed(2)} dBm`;link.textContent=reference?'Referensi tanpa link':`Rugi link ${v.loss.toFixed(1)} dB`;bench.dataset.state=r.state;
    output.textContent=`Daya sumber ${v.transmit.toFixed(2)} dBm; daya terima ${r.received.toFixed(2)} dBm; rugi ${v.loss.toFixed(2)} dB; margin bawah ${r.margin.toFixed(2)} dB. ${r.state==='low'?'Di bawah sensitivitas.':r.state==='overload'?'Melampaui batas maksimum: risiko overload.':'Dalam rentang daya model; cadangan desain belum dinilai.'} Display sedang membaca ${reference?'referensi sumber':'setelah link'}.`;record({...v,reference},r);
  }catch(error){output.textContent=`Periksa input: ${error.message}`;meter.textContent='—';record(values(controls),null);}}
  connectForm(form,update);boundary(root,'dBm adalah daya beracuan 1 mW; dB adalah rasio. Kompatibilitas optik, ketidakpastian, dispersi, kebersihan konektor, dan prosedur referensi nyata tidak disimulasikan. Jangan menatap fiber.');update();
}
