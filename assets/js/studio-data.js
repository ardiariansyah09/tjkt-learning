// Topic-specific objects, explanations and missions; shared interaction structure.
const node = (label, role, prompt) => ({ label, role, prompt });
export const studioPacks = {
  'proses-bisnis-tjkt': {
    title:'Alur Layanan Pelanggan',simulation:'workload',
    nodes:[node('Survei','Klarifikasi kebutuhan dan kriteria penerimaan sebelum menentukan solusi.','Apa bukti masalah pengguna?'),node('Rencana','Tetapkan lingkup, tanggung jawab, jadwal, dan pengendalian perubahan.','Siapa menyetujui perubahan?'),node('Implementasi','Laksanakan pekerjaan terkontrol dan dokumentasikan hasil uji.','Apa bukti pelaksanaan?'),node('Penerimaan','Konfirmasikan kriteria dan tindak lanjut bersama penerima.','Apa yang membuktikan kebutuhan terpenuhi?')],edges:[[0,1],[1,2],[2,3],[3,0]],
  },
  'wawasan-tjkt': {
    title:'Ekosistem Sensor, Edge, dan Cloud',simulation:'iot',
    nodes:[node('Sensor','Data membutuhkan nilai, satuan, waktu, dan identitas sumber.','Data apa yang benar-benar diperlukan?'),node('Edge','Pengolahan dekat sumber dapat mengurangi pengiriman dan mendukung operasi lokal.','Apa yang terjadi saat Internet putus?'),node('Jaringan','Media dan protokol membawa data dengan kapasitas serta batas yang berbeda.','Apa kebutuhan konektivitas?'),node('Cloud','Pengolahan terpusat memerlukan pengaturan akses, retensi, dan pemulihan.','Siapa bertanggung jawab atas data?')],edges:[[0,1],[1,2],[2,3]],
  },
  'profesi-kewirausahaan-tjkt': {
    title:'Rancangan Layanan dan Titik Impas',simulation:'business',
    nodes:[node('Kompetensi','Buktikan kemampuan dan batas kewenangan melalui portofolio yang aman.','Tugas apa yang sudah mampu dikerjakan?'),node('Pelanggan','Validasi masalah dan permintaan dengan pengalaman nyata.','Apa bukti permintaan?'),node('Nilai layanan','Jelaskan manfaat, lingkup, keluaran, dan kriteria penerimaan.','Apa yang dijanjikan?'),node('Operasi','Hubungkan biaya, kapasitas, mitra, mutu, dan pencatatan kas.','Apakah operasi mampu memenuhi janji?')],edges:[[0,1],[1,2],[2,3],[3,0]],
  },
  'sistem-telekomunikasi-dasar': {
    title:'Lintasan dan Propagasi Sinyal',simulation:'propagation',
    nodes:[node('Sumber','Informasi direpresentasikan sebelum dikirim.','Apa informasi yang dibawa?'),node('Pemancar','Sinyal dibentuk sesuai karakter kanal dan sistem.','Bagaimana data menjadi sinyal?'),node('Kanal','Lintasan memiliki redaman, derau, delay, dan kapasitas.','Apa batas fisik lintasannya?'),node('Penerima','Sinyal dideteksi dan informasi dipulihkan untuk tujuan.','Apa kriteria mutu penerimaan?')],edges:[[0,1],[1,2],[2,3]],
  },
  'alat-ukur-tjkt': {
    title:'Pemeriksaan dan Anggaran Daya Optik',simulation:'optical',
    nodes:[node('Inspeksi','Pastikan objek dan alat aman; hentikan bila kondisi atau izin tidak jelas.','Kapan harus berhenti?'),node('Pilih alat','Pilih besaran, mode, rentang, dan instrumen sesuai pertanyaan ukur.','Apa yang dapat dibuktikan alat?'),node('Pengukuran','Catat satuan, referensi, kondisi, hasil asli, dan batasnya.','Apakah hasil dapat ditelusuri?'),node('Laporan','Bandingkan kriteria dan nyatakan ketidakpastian serta tindak lanjut.','Apa kesimpulan yang didukung bukti?')],edges:[[0,1],[1,2],[2,3]],
  },
  'k3-budaya-kerja': {
    title:'Audit Keselamatan Ruang Kerja', simulation:'risk',
    nodes:[node('Sumber listrik','Hentikan penggunaan sumber yang rusak; pengamanan energi dilakukan petugas berwenang.','Temukan area yang perlu diisolasi oleh pihak berwenang ketika kabel daya rusak.'),node('Jalur kerja','Jaga akses berjalan dan evakuasi bebas hambatan.','Temukan area yang harus tetap bebas dari kabel melintang.'),node('Meja fiber','Cegah paparan optik dan tangani serpihan melalui prosedur lab.','Temukan tempat yang membutuhkan wadah serpihan dan larangan menatap konektor.'),node('Stasiun ESD','Lindungi komponen melalui prosedur antistatis setelah perangkat aman ditangani.','Temukan area perlindungan komponen terhadap pelepasan elektrostatik.')],
    edges:[[0,1],[1,2],[1,3]],
  },
  'perencanaan-jaringan': {
    title:'Ruang Rancangan Jaringan', simulation:'capacity',
    nodes:[node('Pengguna','Kebutuhan aplikasi dan jumlah perangkat menjadi dasar rancangan.','Temukan sumber kebutuhan layanan dan pola penggunaan.'),node('Switch akses','Kecukupan port perlu diperiksa bersama uplink, fitur, dan daya.','Temukan perangkat tempat kebutuhan koneksi berkabel dihitung.'),node('Gateway','Hubungan antarjaringan memerlukan jalur dan kebijakan yang direncanakan.','Temukan titik yang menghubungkan LAN ke jaringan lain.'),node('Dokumen','Matriks kebutuhan, diagram, as-built, dan hasil uji menjaga keterlacakan.','Temukan bukti yang menghubungkan kebutuhan dengan hasil penerimaan.')],edges:[[0,1],[1,2],[1,3]],
  },
  'ipv6-dasar': {
    title:'Jelajah Komunikasi IPv6', simulation:'ipv6',
    nodes:[node('Host IPv6','Satu interface dapat mempunyai beberapa alamat dengan lingkup serta lifetime berbeda.','Temukan endpoint yang membentuk/menggunakan alamat IPv6.'),node('Router RA','RA membantu host menemukan default router dan informasi prefix.','Temukan sumber penemuan default router melalui RA.'),node('Resolver AAAA','DNS AAAA menyediakan informasi alamat IPv6; jalurnya tetap perlu diuji.','Temukan layanan pencarian informasi alamat IPv6 dari nama.'),node('Tetangga link','NS/NA membantu penemuan tetangga dan alamat link-layer dalam satu link.','Temukan objek yang berkaitan dengan resolusi tetangga dalam satu link.')],edges:[[0,1],[0,2],[0,3]],
  },
  'pengenalan-jaringan': {
    title:'Perjalanan Data di Sekolah',simulation:'path',
    nodes:[node('PC klien','Menghasilkan permintaan dan menggunakan layanan.','Temukan perangkat akhir yang memulai permintaan.'),node('Switch','Menghubungkan perangkat pada jaringan lokal.','Temukan penghubung Ethernet dalam LAN.'),node('Router','Meneruskan paket antarjaringan melalui rute yang sesuai.','Temukan perangkat untuk menuju jaringan lain.'),node('Server','Menyediakan layanan yang diminta klien.','Temukan penyedia berkas atau halaman web.')],edges:[[0,1],[1,2],[2,3]],
  },
  'topologi-jaringan': {
    title:'Topologi dan Titik Kegagalan',simulation:'topology',
    nodes:[node('PC A','Perangkat akhir pada salah satu cabang.','Temukan endpoint pertama pada cabang jaringan.'),node('Switch pusat','Titik pusat Star; kegagalannya memengaruhi banyak cabang.','Temukan titik kegagalan bersama pada Star.'),node('PC B','Cabang terpisah; kerusakan kabelnya tidak selalu mengganggu cabang lain.','Temukan endpoint pada cabang kedua.'),node('Jalur cadangan','Pada model mesh tersedia koneksi alternatif; protokol nyata perlu dirancang.','Temukan objek yang membantu membahas redundansi.')],edges:[[0,1],[1,2],[1,3]],
  },
  'perangkat-jaringan': {
    title:'Fungsi Perangkat dalam Alur Paket',simulation:'path',
    nodes:[node('NIC host','Antarmuka jaringan perangkat akhir.','Temukan antarmuka pada host.'),node('Switch L2','Mempelajari MAC sumber dan meneruskan frame dalam VLAN.','Temukan perangkat yang belajar MAC sumber.'),node('Router L3','Meneruskan paket IP antarjaringan.','Temukan fungsi routing antarsubnet.'),node('Firewall','Mengizinkan atau membatasi trafik sesuai kebijakan.','Temukan fungsi yang menegakkan kebijakan trafik.')],edges:[[0,1],[1,2],[2,3]],
  },
  'media-transmisi': {
    title:'Lintasan Sinyal dan Pengujian Media',simulation:'media',
    nodes:[node('Twisted pair','Membawa sinyal listrik; perhatikan kategori dan kualitas instalasi.','Temukan media Ethernet yang membawa sinyal listrik.'),node('Fiber optik','Membawa cahaya; kompatibilitas transceiver dan redaman perlu dicek.','Temukan media yang tahan interferensi elektromagnetik.'),node('Radio Wi-Fi','Membawa sinyal melalui radio; kualitas dipengaruhi kondisi lokasi.','Temukan media yang dipengaruhi kanal dan penghalang.'),node('Alat uji','Jenis alat disesuaikan: wiremap, pengukuran optik, atau pengamatan radio.','Temukan fungsi untuk memperoleh bukti hasil instalasi.')],edges:[[0,3],[1,3],[2,3]],
  },
  'osi-tcpip': {
    title:'Lapisan dan Enkapsulasi Data',simulation:'layers',
    nodes:[node('Aplikasi','Membuat pesan layanan seperti HTTP atau DNS.','Temukan pembuat pesan aplikasi.'),node('Transport','TCP/UDP menyediakan fungsi komunikasi antaraplikasi dan port.','Temukan fungsi port TCP/UDP.'),node('Internet/IP','Pengalamatan logis dan routing paket.','Temukan lapisan yang membawa alamat IP.'),node('Akses link','Framing dan representasi sinyal pada media.','Temukan bagian yang berkaitan dengan frame serta media.')],edges:[[0,1],[1,2],[2,3]],
  },
  'ipv4-subnetting': {
    title:'Jaringan, Host, dan Default Gateway',simulation:'subnet',
    nodes:[node('Host A','Alamat host bersama prefix menentukan subnet lokal.','Temukan perangkat sumber yang membandingkan prefix tujuan.'),node('Subnet lokal','Network diperoleh dari IP AND mask.','Temukan ruang alamat lokal yang ditentukan prefix.'),node('Gateway','Next-hop untuk tujuan di luar subnet menurut rute host.','Temukan jalur keluar dari subnet lokal.'),node('Host tujuan','Alamat dan prefixnya harus sesuai rencana jaringan.','Temukan endpoint penerima paket.')],edges:[[0,1],[1,2],[2,3]],
  },
  'protokol-layanan': {
    title:'Konfigurasi, Nama, dan Layanan Web',simulation:'services',
    nodes:[node('Klien','Meminta konfigurasi dan menggunakan layanan.','Temukan pemulai permintaan layanan.'),node('DHCP','Menyewakan konfigurasi alamat beserta opsi sesuai rancangan.','Temukan pemberi konfigurasi otomatis DHCPv4.'),node('DNS','Resolver menyediakan jawaban record untuk nama.','Temukan layanan pencarian informasi nama.'),node('Web HTTPS','Pertukaran pesan web yang dilindungi TLS pada skenario ini.','Temukan penyedia halaman web melalui koneksi terlindungi.')],edges:[[0,1],[0,2],[0,3]],
  },
  'troubleshooting': {
    title:'Investigasi dari Bukti ke Pemulihan',simulation:'diagnosis',
    nodes:[node('Link klien','Periksa adaptor, kabel, port, dan status koneksi.','Temukan pemeriksaan pertama ketika media terputus.'),node('Konfigurasi IP','Validasi alamat, prefix, gateway, dan sumber konfigurasi.','Temukan bukti pengalamatan host.'),node('Jalur gateway','Bandingkan koneksi lokal dan tujuan antarsubnet.','Temukan jalur menuju jaringan di luar subnet.'),node('Resolver DNS','Pisahkan gangguan nama dari konektivitas IP.','Temukan pemeriksaan ketika IP berhasil tetapi nama gagal.')],edges:[[0,1],[1,2],[2,3]],
  },
  'switching-vlan': {
    title:'Segmentasi, Trunk, dan Routing',simulation:'vlan',
    nodes:[node('Host VLAN 10','Port access mengaitkan host dengan VLAN yang sesuai.','Temukan endpoint pada domain broadcast VLAN 10.'),node('Trunk 802.1Q','Membawa VLAN yang diizinkan melintasi link antarswitch.','Temukan link yang membawa beberapa VLAN bertag.'),node('Host VLAN 20','Domain broadcast berbeda dari VLAN 10.','Temukan endpoint pada VLAN yang berbeda dari 10.'),node('Router L3','Routing antarsubnet/VLAN memerlukan interface dan kebijakan yang sesuai.','Temukan fungsi yang diperlukan untuk komunikasi antar-VLAN.')],edges:[[0,1],[1,2],[1,3]],
  }
};
