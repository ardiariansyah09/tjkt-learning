# Standar dan validasi modul

Seluruh 26 modul terbit menggunakan kerangka navigasi yang sama: header, tema, sidebar fase/judul, progres, daftar tahap, reset, breadcrumb, materi, evaluasi, dan tombol sebelumnya/berikutnya. Stylesheet `module-standard.css` dimuat terakhir. Keseragaman berlaku pada kerangka dan kontrol, bukan pada bentuk aktivitas setiap materi.

## Aktivitas mengikuti karakter materi

Studio global enam panel dihapus. Tidak ada lagi kewajiban ilustrasi empat node, laboratorium kubus 3D, atau dua salinan game pada setiap tahap. Sembilan modul yang sudah memiliki simulator khusus tetap menggunakan aktivitas aslinya di tahap terkait: perakitan jaringan, topologi/gangguan, fungsi perangkat, media/cable tester, enkapsulasi, subnetting, DHCP/DNS/web, diagnosis, dan VLAN.

Tujuh belas modul pembelajaran mendalam mempunyai aktivitas di dalam tahap laboratorium masing-masing:

| Modul | Bentuk interaksi |
| --- | --- |
| Pemasangan perangkat XI | Draft/running/startup, pemetaan port, PoE, jalur manajemen, penerimaan, dan restart |
| Fiber optik XI | Anggaran rugi/daya, referensi OPM/OLS, pengukuran ulang, dan peta kejadian fiktif |
| VoIP XI | Diagram SIP, codec, media dua arah, bandwidth IP, deadline paket dan loss terpisah |
| Pemeliharaan XI | Tiga tiket, alat diagnosis, perubahan/rollback, bukti terikat versi, dan penutupan setelah verifikasi |
| Wireless LAN XI | Sampel RSSI/SNR fiktif, daya/dinding, ketetanggaan, kanal, dan beban domain |
| Instalasi kabel XI | Terminasi delapan pin, kode A/B, gangguan open/short/split pair, wiremap, dan lingkup panjang link |
| Pengalamatan XI | Alokasi VLSM, pemeriksaan overlap/kapasitas/gateway, dan prefix IPv6 /64 |
| Desain topologi/layout XI | Editor denah berskala, penempatan perangkat, lintasan, penghalang, dan ekspor SVG/JSON |
| Analisis kebutuhan teknis XI | Matriks port/PoE/trafik/biaya dan pembandingan profil peralatan fiktif, dengan status bukti |
| K3LH | Denah inspeksi, temuan bahaya, alur STOP/pelaporan, dan lembar JSA; tanpa pengurangan risiko otomatis |
| Analisis kebutuhan/dokumentasi | Panel switch dengan port terpakai, cadangan, kosong, dan kekurangan |
| IPv6 | Pemeriksa sintaks, delapan hextet, bentuk kanonis, serta penanda bit prefix |
| Proses bisnis | Papan antrean tiket, alokasi ke teknisi, kapasitas agregat dan beban individual |
| Perkembangan teknologi | Aliran sensor–edge–uplink–cloud, volume data, dan skenario uplink putus |
| Profesi/kewirausahaan | Grafik biaya dan pendapatan, volume pekerjaan, kontribusi, dan titik impas fiktif |
| Telekomunikasi | Pulsa satu arah dan balik dengan waktu propagasi/RTT berdasarkan lintasan |
| Alat ukur | Meja sumber–fiber–meter, pembacaan referensi dan setelah link, sensitivitas serta overload |

`topic-activities.js` menyediakan interaksi khusus; `topic-models.js` memisahkan rumus yang dapat diperiksa. `learning-studio.js` menjadi adapter kompatibilitas, bukan pembuat studio global. Jurnal hanya berada pada tahap refleksi. Catatan percobaan dan jurnal lama tetap dibaca dari kunci lokal yang sama; hasil maksimal 30 percobaan dapat diekspor tanpa database.

Simulator media tidak lagi menghasilkan skor kualitas atau keberhasilan paket dari rumus jarak buatan. Visualisasi membandingkan bentuk sinyal dan faktor yang perlu ditinjau, sambil menyatakan data spesifikasi/pengukuran yang belum tersedia. Animasi arah sinyal bukan hasil uji link.

## Game dan penilaian

Game hanya tampil di tahap game. Arena memiliki gerak karakter, tabrakan, muatan, pos, drone, energi, nyawa, jeda, pengulangan, dan tiga level. Tidak ada soal pilihan di area game. Pada modul yang menyediakan sudut pandang 3D, tombol 2D/3D mengganti pandangan pada permainan yang sama dan mempertahankan progres; 3D tidak disisipkan ke pertemuan lain. Tema dan pos mengaitkan cerita pada topik, sedangkan aturan arena tetap merupakan model simbolik, bukan prosedur operasional nyata.

Tujuh belas modul pembelajaran mendalam masing-masing mempunyai 12 tahap: orientasi, enam konsep, kasus, laboratorium, game, refleksi, dan evaluasi. Tahap berisi tujuan, konsep, contoh beralasan, tugas transfer, miskonsepsi, dan umpan balik. Proyek menggunakan rubrik guru/teman. Evaluasi akhir mempunyai 10 soal dengan ambang 80; kelulusan otomatis dan skor game tidak menggantikan penilaian praktik.

## Pemeriksaan

Jalankan dari akar proyek:

```powershell
./tools/validate-modules.ps1
./tools/validate-modules-browser.ps1
```

Pemeriksaan statis mencakup 26 kerangka halaman, stylesheet terakhir, aset/import lokal, ID katalog, dan graf prasyarat. Pemeriksaan browser memakai Edge headless dengan profil sementara terpisah dan situs XAMPP di `http://localhost/tjkt-learning/`.

Cakupan browser: 282 tahap, desktop 1280×900, ponsel 390×844, tema terang/gelap, overflow, ID ganda, error JavaScript, serta kesamaan properti style 18 komponen kerangka. Evaluasi, persistensi, dan reset diperiksa pada tujuh belas modul mendalam. Simulator asli cable tester, enkapsulasi, layanan, diagnosis, VLAN, dan client–server tetap diperiksa.

`tools/topic-checks.js` memeriksa lokasi aktivitas hanya pada tahap terkait, penempatan jurnal, metadata, penyimpanan, serta interaksi khusus tujuh belas topik. Vektor meliputi kelebihan beban individual walau agregat cukup, kekurangan port, IPv6 tidak valid, uplink putus, kontribusi nol, propagasi satu arah/RTT, referensi optik, sensitivitas, overload, dan batas penerima tidak valid. `tools/studio-checks.js` memeriksa hilangnya studio global, serta integrasi game. `tools/action-game-checks.js` memainkan tiga level melalui keyboard dan memeriksa gerak, tabrakan, jeda, kondisi gagal, penyerahan, serta ketiadaan kontrol soal. Tampilan 3D yang tersedia turut diuji tanpa mereset progres saat pergantian pandangan.

Hasil tersedia pada `docs/module-validation-browser.json`; pengujian terpilih pada `docs/module-validation-browser-focused.json`. Pemeriksaan tidak menggantikan audit setiap kalimat, pengujian perangkat fisik, dan observasi praktik oleh guru.

Pendekatan memahami–mengaplikasi–merefleksi mengacu pada [Pembelajaran Mendalam Kemendikdasmen](https://kurikulum.kemendikdasmen.go.id/pembelajaran-mendalam). Referensi teknis tercantum pada materi masing-masing.

Modul Analisis Kebutuhan Teknis dan Peralatan Jaringan (XI) mempunyai game gudang tersendiri: mengambil/mengeluarkan barang, tiga kontrak kapasitas dan anggaran, port antarswitch, persediaan terbatas, kesempatan pengiriman, kondisi gagal, serta reset. Permainan tidak memakai kuis atau arena generik. Pengujian model dan game terdapat pada tools/requirements-checks.js.


Desain Topologi, Arsitektur, dan Layout Jaringan (XI) memakai editor SVG dengan koordinat, grid 1 m, penempatan rack/endpoint/AP, segmen sumbu, area terlarang, estimasi jalur, serta ekspor SVG berukuran fisik dan JSON. Skala layar tidak dianggap skala cetak; model tidak menyimulasikan cakupan AP. Game Cable Route Builder memakai gerak ujung kabel, gulungan terbatas, penghalang, undo, kegagalan, dan tiga level. Model, solvabilitas, dan UI diuji pada tools/layout-checks.js.


Perancangan Pengalamatan XI menggunakan model IPv4 berbasis rentang bilangan dan IPv6 BigInt. Perubahan kebutuhan membatalkan hasil lama hingga dialokasi ulang; gateway, alignment, overlap, kapasitas, dan cakupan induk diuji. Game Subnet Block Builder menggunakan petak /28, blok berlainan ukuran, batas prefix, alokasi lama, perpindahan/pengembalian blok, tiga kesalahan, dan tiga level. Pengujian terdapat pada tools/address-plan-checks.js.


Instalasi dan Pengujian Jaringan Kabel (XI) memakai baki konduktor, dua ujung bernomor, dan wiremap yang dihitung dari identitas konduktor. Split pair simetris dibedakan dari kontinuitas, kode A/B tidak dianggap otomatis kegagalan perangkat, dan panjang tidak disamakan dengan sertifikasi. Game Patch Cord Assembly memakai tiga pesanan rakitan, pemindahan konduktor, kesempatan pengiriman, kondisi gagal, dan reset. Pengujian ada pada tools/cabling-checks.js.


Wireless LAN (XI) memakai profil RSSI fiktif, perubahan daya downlink relatif referensi, rugi dinding asumsi, SNR, serta beban kanal berdasarkan input kapasitas efektif. Tidak menghasilkan radius cakupan atau throughput nyata dari jarak/RSSI. Game Channel Planner menempatkan token kanal pada graf AP, mempertahankan radio terkunci, dan memeriksa konflik. Vektor rumus, batas asumsi, serta tiga level dan progres diuji pada tools/wlan-checks.js.


Pemeliharaan dan Perbaikan XI menggunakan dataset tiga insiden, kronologi uji, perubahan tunggal, rollback, serta verifikasi link/aplikasi pascaperubahan. Game Bengkel Jalur Data merupakan puzzle putaran konektor dengan aliran paket, anggaran, kondisi gagal, reset, dan tiga papan. Pengujian model dan UI ada pada tools/maintenance-checks.js. Jumlah 282 tahap adalah cakupan kumulatif modul terbit; pengujian terbaru terpilih dicatat pada laporan focused.


Layanan Komunikasi VoIP XI memisahkan registrasi, negosiasi codec, jalur RTP dua arah, kapasitas per arah di lapisan IP, serta network loss dan paket terlambat pada trace deterministik. Game Jitter Buffer Rescue memakai antrean kedatangan, buffer dua tempat, pemindahan paket, jam manual, tenggat putar, kegagalan, pengulangan, dan tiga trace. Tidak memakai kuis. Pengujian model dan UI ada pada tools/voip-checks.js.


## Petunjuk aktivitas

Petunjuk tampil terbuka sebelum kontrol setiap aktivitas yang didaftarkan pada assets/js/activity-instructions.js: laboratorium kontekstual, simulator lama, praktik perakitan/pengalamatan, proyek kasus, jurnal, dan seluruh arena game aktif. Formatnya memuat tujuan, langkah bernomor dengan nama kontrol, tanda selesai, serta cara mengulang/memperbaiki. Isi mengikuti karakter aktivitas; eksperimen eksploratif tidak diberi klaim lulus perangkat nyata. Praktik manual menjelaskan produk dan penilaian guru, sedangkan praktik yang dinilai otomatis menjelaskan tombol penyimpanan/nilainya.

Pengujian tools/instruction-checks.js dijalankan pada tiap tahap dalam audit browser: petunjuk harus sudah dipasang halaman, hadir sebelum kontrol, tidak tersembunyi pada aktivitas aktif, tidak terduplikasi saat pembaruan, dan tidak mengubah isian siswa. Kontrol serta mekanika diuji kembali oleh pemeriksaan simulator/game yang telah ada. Audit tidak menggantikan uji keterpahaman langsung bersama siswa.


Fiber Optik XI memakai anggaran dengan koefisien serta loss komponen sebagai asumsi, referensi yang batal saat sumber/panjang gelombang berubah, dan hasil ukur yang batal saat input link berubah. Dataset putus tidak menampilkan daya terima terhingga. Peta kejadian bukan trace OTDR. Game Splice Tray Puzzle mempunyai pemetaan pasangan, pelepasan, anggaran pemasangan, uji kontinuitas sebelum penyerahan, tiga tray, gagal, dan pengulangan. Pengujian ada pada tools/fiber-checks.js. Jumlah 282 tahap adalah cakupan kumulatif yang tersedia; pengujian terbaru modul terpilih dicatat pada laporan focused.


Pemasangan Perangkat XI memisahkan draft, running, dan startup sebagai snapshot. Edit draft membatalkan pencatatan hasil lama; penerapan/restart memerlukan uji versi baru dan startup hanya disimpan setelah versi berjalan lulus. Uji memeriksa pemetaan, bukan layanan nyata. Game Port Commissioning Challenge memakai alokasi media/port, PoE, persediaan adaptor tunggal, anggaran pemasangan, penolakan, pelepasan, pengulangan, dan tiga chassis. Pengujian ada pada tools/installation-checks.js. Jumlah 282 tahap adalah cakupan kumulatif modul terbit, bukan klaim seluruhnya diuji ulang pada penambahan ini.
