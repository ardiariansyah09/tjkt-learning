// Lapisan pedagogis tambahan; tidak mengganti materi atau aktivitas interaktif asli.
const guide = {
 pengenalan:{goal:'Menjelaskan fungsi alamat IPv4 dan membedakan alamat logis dari alamat fisik.',hook:'Mengapa dua komputer yang sudah tersambung kabel belum tentu dapat berkomunikasi?',case:'Dua komputer pada switch yang sama memiliki IP 192.168.10.10/24 dan 192.168.20.10/24. Apakah keduanya langsung satu subnet?',answer:'Tidak. Prefix /24 menunjukkan network 192.168.10.0 dan 192.168.20.0 yang berbeda. Diperlukan routing atau perubahan konfigurasi agar dapat berkomunikasi.',points:['IPv4 adalah alamat logis pada antarmuka jaringan.','IPv4 memuat alamat sumber dan tujuan paket.','Konektivitas juga memerlukan link dan konfigurasi yang benar.']},
 struktur:{goal:'Mengenali empat oktet IPv4 dan membedakan alamat private, network, serta host.',hook:'Mengapa angka 300 tidak bisa menjadi satu oktet alamat IPv4?',case:'Seorang siswa menulis alamat 192.168.1.300 untuk PC laboratorium. Identifikasi masalahnya.',answer:'Oktet IPv4 hanya memiliki 8 bit, sehingga rentang desimalnya 0–255. Nilai 300 tidak valid.',points:['IPv4 terdiri dari 32 bit atau empat oktet.','Setiap oktet bernilai 0–255.','Prefix menentukan pembagian network dan host.']},
 biner:{goal:'Mengonversi oktet desimal dan biner menggunakan bobot 128 hingga 1.',hook:'Mengapa angka 192 dapat ditulis 11000000 dalam biner?',case:'Konversikan oktet 172 menjadi biner delapan bit.',answer:'172 = 128 + 32 + 8 + 4, sehingga binernya 10101100.',points:['Satu oktet terdiri dari delapan bit.','Bobot bit adalah 128, 64, 32, 16, 8, 4, 2, 1.','Perubahan satu bit dapat mengubah nilai alamat.']},
 mask:{goal:'Menafsirkan prefix CIDR dan subnet mask untuk mengetahui bit network dan host.',hook:'Apa perbedaan alamat /24 dan /26 jika keduanya sama-sama IPv4?',case:'Tentukan subnet mask desimal untuk prefix /26.',answer:'Prefix /26 berarti 26 bit network: 255.255.255.192. Enam bit tersisa untuk bagian host.',points:['Prefix CIDR menyatakan banyaknya bit network.','Subnet mask memiliki bit 1 berurutan diikuti bit 0.','Semakin panjang prefix, semakin kecil kapasitas alamat subnet.']},
 subnet:{goal:'Menentukan network address, broadcast, dan rentang host dari IP/prefix.',hook:'Mengapa 192.168.10.64/26 tidak digunakan sebagai host biasa?',case:'Tentukan network dan broadcast untuk 192.168.10.70/26.',answer:'Ukuran blok /26 adalah 64 alamat. Alamat 70 berada di blok 64–127: network 192.168.10.64 dan broadcast 192.168.10.127; host lazim 65–126.',points:['Network address mengidentifikasi subnet.','Broadcast IPv4 menandai seluruh host dalam subnet terkait.','Hitung batas subnet sebelum menetapkan alamat host.']},
 vlsm:{activity:true,goal:'Membagi ruang IPv4 sesuai kebutuhan host dengan VLSM secara efisien.',hook:'Mengapa semua ruangan sekolah tidak harus diberi subnet berukuran sama?',case:'Tersedia 192.168.10.0/24. Ruang A membutuhkan 60 host dan ruang B 25 host. Tentukan alokasi awal.',answer:'Urutkan kebutuhan terbesar dahulu. Ruang A dapat memakai 192.168.10.0/26 (62 host usable); ruang B memakai 192.168.10.64/27 (30 host usable).',points:['Urutkan kebutuhan host dari terbesar ke terkecil.','Pilih prefix yang memenuhi kapasitas host.','Pastikan subnet tidak saling tumpang tindih.']},
 'network-lab':{activity:true,goal:'Menerapkan alamat IP dan routing pada simulasi dua subnet.',hook:'Mengapa ping ke jaringan lain memerlukan gateway?',case:'PC di 192.168.1.0/24 ingin mengakses server 192.168.2.0/24. Apa yang harus tersedia?',answer:'Antarmuka PC harus memiliki alamat dan subnet mask benar, default gateway menuju router, serta router yang mengetahui jalur ke kedua subnet. Konektivitas fisik dan firewall juga harus sesuai.',points:['Host mengirim trafik di luar subnet menuju gateway.','Router menghubungkan subnet berbeda.','Troubleshooting dimulai dari link, alamat, gateway, lalu layanan.']},
 games:{activity:true,goal:'Merencanakan rute dan mengelola sumber daya dalam tiga level petualangan pengiriman.',hook:'Bagaimana mencapai empat pos dan tujuan tanpa kehabisan energi atau bertabrakan dengan drone?',case:'Gerbang terkunci memisahkan rute menuju tujuan. Token kunci berada pada cabang lain. Bagaimana menyesuaikan jalur perjalanan?',answer:'Periksa peta, ambil muatan dan token kunci, aktifkan pos secara berurutan, lalu antarkan muatan ke gerbang tujuan sambil menghindari gangguan.',points:['Gerakkan karakter dengan panah/WASD atau kontrol sentuh.','Gunakan E / Aksi untuk mengambil, mengaktifkan pos, dan menyerahkan muatan.','Nyawa, kunci, dan energi adalah mekanik game, bukan ukuran operasi jaringan fisik.']},
 posttest:{activity:true,goal:'Mendemonstrasikan pemahaman IPv4 melalui evaluasi akhir dan meninjau materi yang masih perlu dipelajari.',hook:'Sebelum mengirim jawaban, dapatkah kamu menjelaskan langkah perhitungan dan alasan pemilihan prefix?',case:'Hasil evaluasi menunjukkan kesalahan pada network address dan ukuran subnet. Konsep apa yang perlu ditinjau kembali?',answer:'Tinjau operasi AND atau ukuran blok, jumlah bit host, batas network, alamat broadcast, dan rentang host yang dapat digunakan; periksa pula pengecualian untuk prefix khusus.',points:['Posttest memuat 10 soal acak dan semua soal wajib dijawab.','Nilai minimal kelulusan adalah 80/100.','Rekap nilai tersimpan di browser dan bukan nilai resmi server sekolah.']}
};
const safe = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const courseObjectives = [
 'Menjelaskan fungsi dan struktur alamat IPv4 serta representasi binernya.',
 'Menafsirkan subnet mask dan prefix CIDR untuk menentukan batas jaringan.',
 'Menghitung network, broadcast, rentang host, dan alokasi VLSM.',
 'Menerapkan pengalamatan dan routing pada simulasi serta memeriksa hasil konfigurasi.'
];
export function applyLearningFormat(id, container){
 const g=guide[id];if(!g)return;
 if(g.activity)return;
 const intro=document.createElement('section');intro.className='ip-learning-intro';
 if(id==='pengenalan'){
  const objectives=document.createElement('section');objectives.className='ip-format-objectives';
  const title=document.createElement('h2');title.textContent='🎯 Tujuan Pembelajaran';
  const list=document.createElement('ul');
  courseObjectives.forEach(item=>{const point=document.createElement('li');point.textContent=item;list.append(point)});
  objectives.append(title,list);intro.append(objectives);
 }
 const prompt=document.createElement('section');prompt.className='ip-format-prompt';
 const promptTitle=document.createElement('h2');promptTitle.textContent='💡 Pertanyaan Pemantik';
 const promptText=document.createElement('p');promptText.textContent=g.hook;
 prompt.append(promptTitle,promptText);intro.append(prompt);
 container.prepend(intro);
 const ending=document.createElement('section');ending.className='ip-learning-end';
 ending.innerHTML=`<h2>🔎 Studi Kasus dan Analisis</h2><p>${safe(g.case)}</p><details class="ip-format-details"><summary>Lihat contoh pembahasan</summary><p>${safe(g.answer)}</p></details><h2>📝 Rangkuman</h2><ul>${g.points.map(p=>`<li>${safe(p)}</li>`).join('')}</ul>`;
 container.append(ending);
}
