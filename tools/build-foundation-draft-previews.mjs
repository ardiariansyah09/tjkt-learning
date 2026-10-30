import fs from 'node:fs';
const map=JSON.parse(fs.readFileSync('data/atp-fase-e.json','utf8'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const inline=s=>escape(s).replace(/\[([^\]]+)\]\((https:\/\/[^ )]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
for(const draft of map.drafts){
 const topic=draft.id==='virtualisasi-server-dasar'?'vm':draft.id==='instalasi-komputer-dasar'?'os':'router';
 const sections=fs.readFileSync(draft.file,'utf8').trim().split(/\r?\n\r?\n/).map(block=>{
  if(block.startsWith('# '))return '';
  if(block.startsWith('### '))return `<h3>${inline(block.slice(4))}</h3>`;
  if(block.startsWith('## '))return `<h2>${inline(block.slice(3))}</h2>`;
  return `<p>${inline(block).replaceAll('\n','<br>')}</p>`;
 }).join('\n');
 const instructions={vm:'Pilih platform dan RAM. Tekan Uji rencana VM. Bandingkan RAM 4 dan 16 GiB, lalu coba ISO tidak terpasang. Berhasil bila Anda dapat menjelaskan mengapa rencana diterima atau ditolak.',os:'Pilih OS dan disk virtual kosong. Jalankan installer model, lepas ISO, lalu uji boot. Mulai percobaan baru dan coba target disk host untuk melihat penghentian aman. Ini model keputusan, bukan salinan layar installer.',router:'Uji gateway sesuai rencana, lalu ubah ke gateway salah dan uji lagi. Bandingkan hasil satu LAN dan lintas subnet. Coba mulai ulang sebelum menyimpan; kemudian perbaiki, simpan dan mulai ulang lagi.'}[topic];
 const html=`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(draft.title)} — Draft</title><link rel="stylesheet" href="../../../assets/css/foundation-draft.css"></head><body><header><a href="../../../index.html">Daftar materi</a><span>Fase E · Kelas X · Draft</span></header><main><h1>${escape(draft.title)}</h1><aside>Pratinjau draft. Belum memberi nilai atau sertifikat dan tidak mengubah progres modul yang sudah ada.</aside><section class="lab"><h2>Latihan model interaktif</h2><p>${escape(instructions)}</p><p>Batas: tidak memasang OS, mengakses disk, atau menjalankan jaringan nyata. Hasil latihan hanya selama halaman dibuka.</p><div data-foundation-draft="${topic}"></div></section>${sections}</main><script type="module" src="../../../assets/js/foundation-draft.js"></script></body></html>`;
 const directory=`modules/dasar-jaringan/${draft.id}`;fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(directory+'/index.html',html);
}
console.log('Built 3 draft previews with topic-specific conceptual labs.');
