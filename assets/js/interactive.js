import { subnetInfo, parseIPv4, octetBits } from './ipv4-core.js';
const QUIZ_KEY = 'tjkt:ipv4-subnetting:practice:v1';
const weights = [128,64,32,16,8,4,2,1];
const el = (tag, className, text) => { const node=document.createElement(tag); if(className)node.className=className; if(text!==undefined)node.textContent=text; return node; };
function section(root, title, description) { const box=el('section','lab-widget'); box.append(el('h2','',title),el('p','widget-intro',description)); root.append(box); return box; }
function field(label, value, type='text') { const wrap=el('label','lab-field'); wrap.append(el('span','',label)); const input=el('input','lab-input'); input.type=type; input.value=value; wrap.append(input); return {wrap,input}; }
function stat(label, value) { const box=el('div','lab-stat'); box.append(el('span','',label),el('strong','',String(value))); return box; }
function button(label, fn) { const b=el('button','lab-btn',label); b.type='button'; b.addEventListener('click',fn); return b; }
function format(n) { return n.toLocaleString('id-ID'); }
function savePractice(data) { try { localStorage.setItem(QUIZ_KEY, JSON.stringify({...data,updatedAt:new Date().toISOString()})); return true; } catch { return false; } }
function readPractice() { try { const x=JSON.parse(localStorage.getItem(QUIZ_KEY)||'{}'); return x && typeof x==='object' ? x : {}; } catch { return {}; } }
function binary(root) {
  const box=section(root,'🔢 Binary Builder — 8 Bit','Klik setiap bit untuk mengubah nilai biner menjadi desimal. Perhatikan bobot 128 hingga 1.');
  let bits=[1,1,0,0,0,0,0,0]; const row=el('div','bit-buttons'); const output=el('div','lab-output');
  const draw=()=>{row.replaceChildren();bits.forEach((v,i)=>{const b=button(`${weights[i]}\n${v}`,()=>{bits[i]=1-bits[i];draw();});b.classList.add('bit-button');b.classList.toggle('on',v===1);b.setAttribute('aria-label',`Bit bobot ${weights[i]} bernilai ${v}, klik untuk mengubah`);row.append(b);}); const decimal=bits.reduce((s,v,i)=>s+v*weights[i],0);output.replaceChildren(stat('Bilangan biner',bits.join('')),stat('Nilai desimal',decimal),stat('Penjumlahan bit aktif',bits.map((v,i)=>v?weights[i]:null).filter(Boolean).join(' + ')||'0'));};
  box.append(row,output,button('Reset ke 192',()=>{bits=[1,1,0,0,0,0,0,0];draw();}));draw();
}
function cidr(root) {
  const box=section(root,'🎚️ Subnet Mask & CIDR Explorer','Geser prefix untuk melihat jumlah network bit, host bit, subnet mask, dan total alamat.');
  const label=el('label','lab-field');label.append(el('span','','Panjang prefix'));const slider=el('input','cidr-range');slider.type='range';slider.min='0';slider.max='32';slider.value='24';label.append(slider);
  const visual=el('div','cidr-bits');visual.setAttribute('aria-label','Visualisasi 32 bit');const output=el('div','lab-output');
  function draw(){const p=Number(slider.value);const info=subnetInfo('192.168.10.70',p);visual.replaceChildren();for(let i=0;i<32;i++){const bit=el('span',i<p?'network-bit':'host-bit');bit.title=`Bit ${i+1}: ${i<p?'Network':'Host'}`;visual.append(bit);}output.replaceChildren(stat('Prefix',`/${p}`),stat('Subnet mask',info.mask),stat('Network bits',p),stat('Host bits',32-p),stat('Total alamat',format(info.total)));}
  slider.addEventListener('input',draw);box.append(label,visual,output,el('p','widget-hint','Untuk /31, kedua alamat dapat dipakai pada link point-to-point (RFC 3021). /32 merepresentasikan satu alamat.'));draw();
}
function calculator(root) {
  const box=section(root,'🧮 IPv4 Subnet Calculator','Masukkan IPv4 dan prefix. Hasil ditampilkan setelah menekan Hitung Subnet.');
  const ip=field('Alamat IPv4','192.168.10.70');const prefix=field('Prefix CIDR (0–32)','26','number');prefix.input.min='0';prefix.input.max='32';const inputs=el('div','lab-fields');inputs.append(ip.wrap,prefix.wrap);const output=el('div','lab-output');output.setAttribute('aria-live','polite');
  function calculate(){const p=Number(prefix.input.value);const info=prefix.input.value.trim()!==''?subnetInfo(ip.input.value,p):null;output.replaceChildren();if(!info){output.append(el('p','lab-error','Alamat IPv4 atau prefix tidak valid. Gunakan empat oktet 0–255 dan prefix 0–32.'));return;}output.append(stat('Network address',info.network),stat('Broadcast address',info.broadcast),stat('Subnet mask',info.mask),stat('Total alamat',format(info.total)),stat('Host usable',format(info.usable)),stat('Host pertama',info.first),stat('Host terakhir',info.last));if(p>=31)output.append(el('p','widget-hint',p===31?'Prefix /31: kedua alamat digunakan untuk link point-to-point.':'Prefix /32: satu alamat host.'));}
  box.append(inputs,button('Hitung Subnet',calculate),output);calculate();
}
const QUESTIONS=[
  {q:'Ubah bilangan biner 11000000 menjadi desimal.',answer:'192',explain:'128 + 64 = 192.'},
  {q:'Apa subnet mask dari prefix /26? (format dotted decimal)',answer:'255.255.255.192',explain:'26 bit network = 24 bit penuh dan dua bit pada oktet terakhir: 128 + 64 = 192.'},
  {q:'Network address dari 192.168.10.70/26 adalah?',answer:'192.168.10.64',explain:'Ukuran blok /26 adalah 64. IP .70 berada pada subnet .64–.127.'},
  {q:'Broadcast address dari 192.168.10.70/26 adalah?',answer:'192.168.10.127',explain:'Alamat terakhir pada blok .64–.127 adalah broadcast .127.'},
  {q:'Berapa jumlah host usable pada subnet /27 biasa?',answer:'30',explain:'32 alamat total dikurangi network dan broadcast = 30 host usable.'}
];
function practice(root){
  const box=section(root,'📝 Latihan Subnetting — 5 Soal','Isi jawaban sendiri sebelum memeriksa. Nilai terbaik disimpan di browser ini.');const form=el('form','practice-form');const inputs=[];
  QUESTIONS.forEach((item,i)=>{const f=field(`${i+1}. ${item.q}`,'');f.input.value='';f.input.placeholder='Ketik jawaban...';f.input.required=true;inputs.push(f.input);form.append(f.wrap);});
  const submit=el('button','lab-btn','Periksa Semua Jawaban');submit.type='submit';form.append(submit);const result=el('div','practice-result');result.setAttribute('aria-live','polite');
  function summary(){const old=readPractice();if(typeof old.bestScore==='number')result.append(el('p','widget-hint',`Nilai terbaik tersimpan: ${old.bestScore}/100. Percobaan: ${old.attempts||0}.`));}
  form.addEventListener('submit',event=>{event.preventDefault();const old=readPractice();let correct=0;const details=el('div','answer-details');QUESTIONS.forEach((item,i)=>{const answer=inputs[i].value.trim().toLowerCase().replace(/\s+/g,'');const ok=answer===item.answer.toLowerCase();if(ok)correct++;const line=el('p',ok?'answer-correct':'answer-wrong',`${i+1}. ${ok?'✓ Benar':'✗ Belum tepat'} — Jawaban: ${item.answer}. ${item.explain}`);details.append(line);});const score=correct*20;const stored=savePractice({bestScore:Math.max(score,Number(old.bestScore)||0),lastScore:score,attempts:(Number(old.attempts)||0)+1});result.replaceChildren(el('h3','',`Nilai latihan: ${score}/100 (${correct} dari 5 benar)`),details,el('p','widget-hint',stored?'Hasil latihan tersimpan di browser ini.':'Penyimpanan browser tidak tersedia.'));if(stored&&score>=75)queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tjkt:assessment',{detail:{lessonId:'subnet',score,answeredAll:inputs.every(x=>x.value.trim()!=='')}})));});
  box.append(form,result);summary();
}
export function mountInteractive(lessonId, container){
  const widgetRoot=el('div','interactive-area');container.append(widgetRoot);
  if(lessonId==='biner')binary(widgetRoot);
  if(lessonId==='mask')cidr(widgetRoot);
  if(lessonId==='subnet'){calculator(widgetRoot);practice(widgetRoot);}
}
