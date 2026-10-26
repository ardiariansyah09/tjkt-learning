import { applyLearningFormat } from './ipv4-learning-format.js?v=3';
import { readProgress, writeProgress } from './progress.js';
import { mountInteractive } from './interactive.js';
import { mountVLSM } from './vlsm-lab.js';
import { mountNetworkLab } from './network-lab.js';
import { mountGames, mountPosttest, mountReport } from './stage8.js?v=4';
import { mountLearnerDashboard, mountCertificate, setupResetProgress } from './stage9.js?v=completion1';
import { bindThemeToggle } from './theme.js';

// Materi tahap 4. Konten teori statis; aktivitas interaktif berada dalam modul JavaScript terpisah.
const lessons = [
  {
    id: 'pengenalan', title: 'Pengenalan IPv4', summary: 'Mengapa perangkat jaringan memerlukan alamat IP?',
    html: `<h2>Apa itu IP Address?</h2>
      <p><strong>IP Address (Internet Protocol Address)</strong> adalah alamat logis yang diberikan kepada antarmuka perangkat dalam jaringan berbasis Internet Protocol. Alamat ini membantu perangkat menentukan sumber dan tujuan pengiriman paket.</p>
      <p>Dalam jaringan komputer, setiap perangkat yang berkomunikasi menggunakan IPv4 perlu memiliki konfigurasi alamat yang sesuai dengan jaringan tempatnya berada. Satu perangkat dapat memiliki lebih dari satu alamat IP karena memiliki beberapa antarmuka jaringan.</p>
      <div class="concept-card"><span class="concept-label">CONTOH ALAMAT IPv4</span><strong class="ip-example">192.168.10.1</strong><span>Empat oktet • masing-masing 8 bit • total 32 bit</span></div>
      <h2>Analogi pengiriman paket</h2><p>Bayangkan paket data seperti surat. Alamat IP tujuan membantu jaringan mengarahkan paket menuju perangkat yang tepat. Namun, pengiriman dalam jaringan lokal juga melibatkan alamat link-layer, misalnya alamat MAC pada Ethernet.</p>
      <h2>Fungsi IP Address</h2><ul><li><strong>Identifikasi:</strong> membedakan alamat antarmuka dalam jaringan.</li><li><strong>Pengalamatan:</strong> mencantumkan sumber dan tujuan pada paket IP.</li><li><strong>Routing:</strong> memungkinkan router meneruskan paket antarjaringan berdasarkan alamat tujuan.</li></ul>
      <h2>Contoh sederhana</h2><p>PC-A memiliki alamat <code>192.168.10.10/24</code>, sedangkan PC-B memiliki alamat <code>192.168.10.20/24</code>. Keduanya berada pada subnet <code>192.168.10.0/24</code>, sehingga secara konsep dapat berkomunikasi langsung melalui jaringan lokal yang terhubung, jika tidak ada penghalang konfigurasi lain.</p>
      <div class="learning-note"><strong>Ingat:</strong> alamat IP bukan satu-satunya syarat konektivitas. Kabel atau Wi-Fi, konfigurasi interface, firewall, dan kondisi jaringan juga berpengaruh.</div>
      `
  },
  {
    id: 'struktur', title: 'Struktur Alamat IPv4', summary: 'Empat oktet, 32 bit, dan notasi desimal bertitik.',
    html: `<h2>Bagaimana IPv4 ditulis?</h2><p>Alamat IPv4 terdiri atas <strong>32 bit</strong> yang biasanya ditulis sebagai empat bilangan desimal (oktet), dipisahkan titik. Setiap oktet bernilai <strong>0 sampai 255</strong>.</p><div class="concept-card"><span class="concept-label">EMPAT OKTET</span><strong class="ip-example">192 . 168 . 10 . 1</strong><span>8 bit + 8 bit + 8 bit + 8 bit = 32 bit</span></div><h2>Jenis dan penggunaan alamat IPv4</h2><p>Alamat <strong>unicast</strong> mengidentifikasi satu interface, <strong>broadcast</strong> digunakan untuk mengirim ke seluruh host pada domain broadcast IPv4 yang relevan, sedangkan <strong>multicast</strong> ditujukan kepada kelompok penerima. Tidak semua alamat dapat digunakan sebagai alamat host biasa.</p><p>Rentang private IPv4 menurut RFC 1918 adalah <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, dan <code>192.168.0.0/16</code>. Alamat private umumnya tidak dirutekan di Internet publik tanpa mekanisme seperti NAT.</p><h2>Alamat jaringan dan host</h2><p>Bagian network dan host ditentukan oleh <strong>prefix</strong> atau subnet mask. Tanpa prefix, kita tidak dapat memastikan batas subnet hanya dari angka IP.</p><div class="learning-note">Contoh: <code>192.168.10.70/26</code> berada pada subnet <code>192.168.10.64/26</code>.</div>`
  },
  {
    id: 'biner', title: 'Bilangan Biner', summary: 'Memahami nilai bit untuk perhitungan subnet.',
    html: `<h2>Mengenal delapan bit</h2><p>Satu oktet terdiri atas delapan bit. Bobot bit dari kiri ke kanan adalah:</p><div class="bit-strip"><span>128</span><span>64</span><span>32</span><span>16</span><span>8</span><span>4</span><span>2</span><span>1</span></div><p>Contoh, <code>11000000</code> = 128 + 64 = <strong>192</strong>.</p><h2>Langkah konversi</h2><p>Untuk mengubah 168 menjadi biner, pilih bobot 128 (sisa 40), lalu 32 (sisa 8), lalu 8 (sisa 0). Jadi <code>168 = 10101000</code>. Untuk konversi sebaliknya, jumlahkan bobot semua bit bernilai 1.</p><h2>Mengapa biner penting?</h2><p>Subnet mask bekerja pada bit, bukan sekadar angka desimal. Operasi bitwise AND antara alamat IP dan subnet mask menghasilkan network address.</p><div class="learning-note">Coba Binary Builder di bawah. Ubah bit 0 menjadi 1 dan amati perubahan nilai desimal.</div>`
  },
  {
    id: 'mask', title: 'Subnet Mask & CIDR', summary: 'Memahami pembagian bit network dan host.',
    html: `<h2>Subnet mask</h2><p>Subnet mask menunjukkan bit mana yang merupakan bagian network. Dalam bentuk biner, bit network bernilai 1 secara berurutan dari kiri, diikuti bit host bernilai 0.</p><div class="concept-card"><span class="concept-label">CONTOH PREFIX /24</span><strong class="ip-example">255.255.255.0</strong><span>24 bit network • 8 bit host</span></div><h2>Operasi AND bit demi bit</h2><p>Network address diperoleh dari <strong>IP AND subnet mask</strong>. Hasil bit bernilai 1 hanya ketika kedua bit masukan sama-sama 1. Contoh oktet terakhir: IP <code>70 = 01000110</code>, mask /26 <code>192 = 11000000</code>, hasil AND <code>01000000 = 64</code>.</p><h2>Notasi CIDR</h2><p>Penulisan <code>192.168.10.5/24</code> berarti alamat tersebut menggunakan prefix sepanjang 24 bit. Prefix <code>/26</code> setara dengan mask <code>255.255.255.192</code>.</p><div class="learning-note">Jumlah alamat pada subnet IPv4 dengan prefix /n adalah 2 pangkat (32 − n). Jumlah host usable memiliki pengecualian untuk /31 dan /32.</div>`
  },
  {
    id: 'subnet', title: 'Dasar Subnetting', summary: 'Menghitung network, broadcast, dan rentang host.',
    html: `<h2>Apa itu subnetting?</h2><p>Subnetting membagi ruang alamat IP menjadi beberapa jaringan yang lebih kecil agar pengalamatan dan pengelolaan jaringan lebih terstruktur.</p><h2>Langkah menentukan subnet</h2><ol><li>Tentukan jumlah host bit: <code>32 − prefix</code>.</li><li>Hitung total alamat: <code>2^(host bit)</code>.</li><li>Temukan batas network dengan operasi AND atau ukuran blok.</li><li>Tentukan broadcast dan rentang host yang dapat digunakan.</li></ol><h2>Contoh /26</h2><p>Prefix <code>/26</code> memiliki 6 bit host, sehingga setiap subnet berisi <strong>64 alamat</strong>. Untuk <code>192.168.10.70/26</code>:</p><ul><li>Network address: <code>192.168.10.64</code></li><li>Broadcast address: <code>192.168.10.127</code></li><li>Host usable: <code>192.168.10.65</code> hingga <code>192.168.10.126</code></li><li>Jumlah host usable pada subnet biasa: <strong>62</strong></li></ul><div class="learning-note">Gunakan kalkulator untuk memeriksa perhitungan, lalu kerjakan lima soal tanpa melihat pembahasan terlebih dahulu.</div>`
  },
  {
    id: 'vlsm', title: 'Praktikum VLSM', summary: 'Alokasikan subnet untuk empat ruangan sekolah dengan drag & drop dan penilaian otomatis.',
    html: `<h2>VLSM: Subnet Sesuai Kebutuhan</h2><p><strong>Variable Length Subnet Mask (VLSM)</strong> memungkinkan satu network induk dibagi menjadi subnet dengan prefix berbeda sesuai kebutuhan host. Tujuannya mengurangi pemborosan alamat IPv4.</p><h2>Langkah merencanakan VLSM</h2><ol><li>Catat jumlah host pada tiap ruangan.</li><li>Urutkan kebutuhan host dari yang terbesar ke yang terkecil.</li><li>Untuk setiap ruangan, pilih blok terkecil yang cukup menampung kebutuhan host ditambah alamat network dan broadcast pada subnet biasa.</li><li>Alokasikan blok dari alamat paling rendah yang sesuai batas subnet (<em>network alignment</em>).</li><li>Pastikan setiap blok berada di dalam network induk dan tidak saling tumpang tindih.</li></ol><div class="learning-note"><strong>Studi kasus:</strong> SMK memiliki network induk <code>192.168.10.0/24</code>. Ruang Lab TJKT membutuhkan 60 host, Administrasi 28 host, Perpustakaan 12 host, dan CCTV 6 host. Susun urutan alokasi dengan drag &amp; drop, kemudian isi network address dan prefix masing-masing.</div><h2>Praktikum mandiri</h2><p>Nilai dihitung dari ketepatan prefix, network address, dan validitas keseluruhan rancangan. Tombol contoh solusi dapat digunakan setelah mencoba sendiri.</p>`
  },
  { id: 'network-lab', title: 'Virtual Network Lab', summary: 'Konfigurasi PC, switch, router, ping, dan troubleshooting jaringan dua subnet.', html: `<h2>Praktikum Jaringan Virtual</h2><p>Setelah mempelajari subnetting dan VLSM, sekarang saatnya menerapkan pengalamatan pada topologi dua jaringan. Dua PC terhubung melalui dua switch dan satu router dengan dua interface. Siswa dapat mengubah konfigurasi, melakukan pengujian, lalu memperbaiki gangguan.</p><h2>Menentukan konfigurasi host</h2><p>Setiap PC memerlukan alamat IPv4 dan prefix yang sesuai dengan subnetnya. Jika PC mengirim paket ke alamat di luar subnet lokal, paket diteruskan ke default gateway pada jaringan tersebut.</p><p>Contoh: PC-A <code>192.168.1.10/24</code> menggunakan gateway <code>192.168.1.1</code>; PC-B <code>192.168.2.10/24</code> menggunakan gateway <code>192.168.2.1</code>. Router harus memiliki interface pada kedua subnet dan jalur yang aktif.</p><h2>Menguji dan menelusuri gangguan</h2><ol><li>Periksa link dan status interface.</li><li>Validasi alamat IP, prefix, dan gateway setiap host.</li><li>Uji koneksi lokal sebelum menguji jaringan lain.</li><li>Periksa interface router, rute, dan kemungkinan pemblokiran trafik.</li></ol><div class="learning-note"><strong>Model edukasi:</strong> terminal dan pengiriman paket merupakan simulasi logika di browser, bukan emulator Cisco IOS atau sistem operasi nyata. Simulasi ini tidak mengirim paket ke jaringan fisik.</div>` },
  { id:'games', title:'Subnet Courier — Game Petualangan', summary:'Gerakkan karakter, ambil muatan, aktifkan empat pos dan selesaikan tiga level pengiriman.', html:`<h2>Subnet Courier</h2><p>Rencanakan rute, ambil token kunci, hindari drone, kelola energi, dan antarkan muatan ke gerbang tujuan. Gunakan panah/WASD serta E atau kontrol sentuh.</p>` },
  { id:'posttest', title:'Posttest & Rekap', summary:'Evaluasi akhir 10 soal acak, pembahasan, dan rekap nilai seluruh materi.', html:`<h2>Posttest Akhir Modul</h2><p>Kerjakan sepuluh soal yang dipilih acak dari bank soal. Semua soal wajib dijawab sebelum dikumpulkan. Nilai minimal kelulusan adalah 80/100.</p><div class="learning-note">Setiap percobaan mengambil urutan soal acak baru. Hasil tersimpan pada browser ini dan bukan nilai resmi server sekolah.</div>` }
];


import { readGate, writeGate, markPassed, isUnlocked, isPassed, MIN_SCORE } from './sequential.js?v=completion1';
const ids = lessons.map(x => x.id);
const nav = document.getElementById('lessonNav');
const content = document.getElementById('lessonContent');
const progressText = document.getElementById('progressText');
const progressCount = document.getElementById('progressCount');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');
const completeButton = document.getElementById('completeLesson');
const previousButton = document.getElementById('previousLesson');
const status = document.getElementById('saveStatus');
const gateMessage = document.getElementById('gateMessage');
let progress = readProgress(ids);
let gate = readGate(ids);
const knowledge = {
  pengenalan: {q:'Alamat IPv4 secara teknis diberikan kepada ...', options:['Orang pengguna komputer','Antarmuka jaringan','Nama komputer permanen'], answer:1},
  struktur: {q:'Panjang sebuah alamat IPv4 adalah ...',options:['16 bit','32 bit','64 bit'],answer:1},
  biner: {q:'Bilangan biner 10101000 setara desimal ...',options:['168','192','160'],answer:0},
  mask: {q:'Subnet mask dari prefix /26 adalah ...',options:['255.255.255.0','255.255.255.192','255.255.255.224'],answer:1}
};
function save() {
  const ok = writeProgress(progress) && writeGate(gate);
  status.textContent = ok ? '✓ Progres dan status kelulusan tersimpan di browser ini.' : '⚠ Penyimpanan browser tidak tersedia.';
}
function goTo(id) {
  if (!isUnlocked(gate, ids, id)) return;
  progress.current = id;
  render();
  save();
  window.scrollTo({top:0,behavior:'smooth'});
}
function mountKnowledge(lessonId) {
  const q=knowledge[lessonId];
  if (!q) return;
  const panel=document.createElement('section');
  panel.className='knowledge-gate';
  const h=document.createElement('h2');h.textContent='Cek Pemahaman Wajib';
  const desc=document.createElement('p');desc.textContent=q.q;
  const form=document.createElement('form');
  const field=document.createElement('fieldset');
  const legend=document.createElement('legend');legend.textContent='Pilih satu jawaban';field.append(legend);
  q.options.forEach((option,i)=>{
    const label=document.createElement('label');label.className='gate-option';
    const radio=document.createElement('input');radio.type='radio';radio.name='gateAnswer';radio.value=String(i);radio.required=true;
    label.append(radio,document.createTextNode(' '+option));field.append(label);
  });
  const btn=document.createElement('button');btn.type='submit';btn.className='primary-action';btn.textContent='Periksa Jawaban';
  const result=document.createElement('p');result.setAttribute('role','status');
  form.append(field,btn,result);
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const selected=form.querySelector('input[name="gateAnswer"]:checked');
    if(!selected){result.textContent='Pilih jawaban terlebih dahulu.';return;}
    if(Number(selected.value)===q.answer){
      markPassed(gate,lessonId,100);
      result.textContent='✓ Benar. Materi berikutnya sudah terbuka.';
      save();render();
    } else {
      result.textContent='Jawaban belum tepat. Pelajari kembali materinya dan coba lagi.';
    }
  });
  panel.append(h,desc,form);content.append(panel);
}
function renderNavigation() {
  nav.replaceChildren();
  lessons.forEach((item,i)=>{
    const button=document.createElement('button');button.type='button';
    const unlocked=isUnlocked(gate,ids,item.id),passed=isPassed(gate,item.id);
    button.className=`lesson-nav-item${item.id===progress.current?' active':''}${!unlocked?' locked':''}`;
    button.disabled=!unlocked;
    if(!unlocked)button.title='Selesaikan materi sebelumnya terlebih dahulu';
    if(item.id===progress.current)button.setAttribute('aria-current','step');
    const number=document.createElement('span');number.className='lesson-number';
    number.textContent=passed?'✓':unlocked?String(i+1).padStart(2,'0'):'🔒';
    const title=document.createElement('span');title.textContent=item.title;
    button.append(number,title);
    button.addEventListener('click',()=>goTo(item.id));
    nav.append(button);
  });
}
function render() {
  if (!isUnlocked(gate,ids,progress.current)) progress.current=ids.find(id=>isUnlocked(gate,ids,id))||ids[0];
  const index=ids.indexOf(progress.current), lesson=lessons[index];
  document.getElementById('breadcrumbLesson').textContent=lesson.title;
  document.getElementById('lessonKicker').textContent=`MATERI ${String(index+1).padStart(2,'0')}`;
  document.getElementById('lessonTitle').textContent=lesson.title;
  document.getElementById('lessonSummary').textContent=lesson.summary;
  content.innerHTML=lesson.html; // Konten statis dari pengembang.
  mountInteractive(lesson.id,content);
  if(lesson.id==='vlsm')mountVLSM(content);
  if(lesson.id==='network-lab')mountNetworkLab(content);
  if(lesson.id==='games')mountGames(content);
  if(lesson.id==='posttest'){mountPosttest(content);mountReport(content,gate,ids,lessons);mountCertificate(content,gate,ids);}
  applyLearningFormat(lesson.id,content);
  mountKnowledge(lesson.id);
  if(lesson.id==='subnet'){
    const practice=content.querySelector('.practice-form')?.closest('.lab-widget');
    const summary=content.querySelector('.ip-learning-end');
    if(practice&&summary)summary.after(practice);
  }
  mountLearnerDashboard(document.getElementById('learnerDashboard'),gate,ids,lessons,goTo);
  renderNavigation();
  const count=ids.filter(id=>isPassed(gate,id)).length;
  const percentage=Math.round(count/ids.length*100);
  progressText.textContent=`${percentage}%`;
  progressCount.textContent=`${count} dari ${ids.length} tahap lulus`;
  progressFill.style.width=`${percentage}%`;
  progressBar.setAttribute('aria-valuenow',String(percentage));
  previousButton.disabled=index===0;
  const passed=isPassed(gate,lesson.id);
  completeButton.disabled=!passed || index===ids.length-1;
  completeButton.textContent=passed?(index===ids.length-1?'✓ Seluruh Materi Selesai':'Lanjut Materi →'):'🔒 Selesaikan Evaluasi untuk Lanjut';
  gateMessage.textContent=passed?'✓ Persyaratan materi ini sudah terpenuhi.':lesson.id==='subnet'?`Jawab seluruh soal latihan dan raih minimal ${MIN_SCORE} poin.`:lesson.id==='vlsm'?`Periksa rancangan VLSM dan raih minimal ${MIN_SCORE} poin.`:lesson.id==='network-lab'?`Nilai praktikum jaringan harus minimal ${MIN_SCORE} poin.`:lesson.id==='games'?'Selesaikan tiga level permainan untuk membuka Posttest.':lesson.id==='posttest'?'Jawab semua 10 soal posttest dan raih minimal 80 poin.':'Jawab soal Cek Pemahaman Wajib dengan benar.';
}
previousButton.addEventListener('click',()=>{
  const i=ids.indexOf(progress.current);if(i>0)goTo(ids[i-1]);
});
completeButton.addEventListener('click',()=>{
  const i=ids.indexOf(progress.current);
  if(!isPassed(gate,progress.current))return;
  if(i<ids.length-1)goTo(ids[i+1]);
});
window.addEventListener('tjkt:assessment',event=>{
  const {lessonId,score,answeredAll}=event.detail||{};
  if(!ids.includes(lessonId)||!answeredAll||!Number.isFinite(score))return;
  const required=['games','posttest'].includes(lessonId)?80:MIN_SCORE;
  if(score>=required){
    markPassed(gate,lessonId,score);
    save();
    if(['games','posttest'].includes(lessonId) && progress.current===lessonId){
      renderNavigation();
      completeButton.disabled=lessonId===ids[ids.length-1];
      completeButton.textContent=lessonId===ids[ids.length-1]?'✓ Seluruh Materi Selesai':'Lanjut Materi →';
      gateMessage.textContent='✓ Lulus. Nilai terbaik tersimpan.';
      mountLearnerDashboard(document.getElementById('learnerDashboard'),gate,ids,lessons,goTo);
      if(lessonId==='posttest'){const existing=content.querySelector('.stage9-certificate');if(existing)existing.remove();mountCertificate(content,gate,ids);}
      const count=ids.filter(id=>isPassed(gate,id)).length;
      const percentage=Math.round(count/ids.length*100);
      progressText.textContent=`${percentage}%`;progressCount.textContent=`${count} dari ${ids.length} tahap lulus`;
      progressFill.style.width=`${percentage}%`;progressBar.setAttribute('aria-valuenow',String(percentage));
    } else render();
  } else {
    gateMessage.textContent=`Nilai ${score}/100 belum mencapai ${required}. Perbaiki jawaban dan coba lagi.`;
  }
});
bindThemeToggle(document.getElementById('moduleThemeToggle'));
setupResetProgress(document.getElementById('resetProgressButton'));
render();
