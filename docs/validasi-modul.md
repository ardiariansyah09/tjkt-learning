# Standar dan validasi modul

Seluruh 53 modul terbit menggunakan kerangka navigasi yang sama: header, tema, sidebar fase/judul, progres, daftar tahap, reset, breadcrumb, materi, evaluasi, dan tombol sebelumnya/berikutnya. Stylesheet `module-standard.css` dimuat terakhir. Keseragaman berlaku pada kerangka dan kontrol, bukan pada bentuk aktivitas setiap materi.

Penguatan terbaru: konteks keseharian spesifik pada 53 modul, praktik layanan dan pengamanan terintegrasi pada20 modul ASJ/keamanan/proyek, replay log login pada dua modul SSH/dasar server, serta peta loker alamat interaktif pada CIDR Explorer. Simulator khas setiap topik dan game pada tahapnya tetap dipertahankan. Lihat `docs/simulasi-dan-pengamanan-terintegrasi.md` dan `docs/inventaris-simulasi-kontekstual.md`.

Seluruh sembilan modul terakhir kini tersedia: Backup/Pemulihan dan Mail kelas XI; Ancaman/Keamanan, Autentikasi/Kriptografi, Host Hardening, DMZ, Pengujian Keamanan, IDS/Respons Insiden dan Proyek Integrasi kelas XII. Rincian cakupan, batas model dan laporan akhir ada di `docs/penyelesaian-sembilan-modul.md`. Hasil historis di bawah tetap dilabeli menurut waktu/cakupannya.

Audit terbaru 26 Oktober 2026 mencakup seluruh 53 modul/606 tahap pada desktop, ponsel, tema terang dan gelap: tanpa error, style parity benar. Sembilan modul terakhir juga lulus penyelesaian dari progres kosong sampai sertifikat PDF satu halaman, cetak ulang dan pemeriksaan ambang nilai. Lihat laporan module-validation-browser.json dan completion-validation-focused.json.

## Aktivitas mengikuti karakter materi

Penambahan terbaru: Monitoring XI mempunyai timeline probe/alert/data stale/ONU serta game Incident Shift tiga level. Audit historis sebelum penambahan terakhir mencakup 43 modul/486 tahap; penambahan Monitoring diuji focused bersama VPN dan DHCP/DNS/Remote, lalu penyelesaian baru sampai PDF/cetak ulang. Cakupan katalog kini53 modul/606 tahap. Audit lengkap sebelumnya mencakup 28 modul/306 tahap; masing-masing tambahan 12 tahap OSPF, NAT, Proxy Server, QoS, dual-WAN, dasar server, virtualisasi, administrasi Linux/Windows, manajemen pengguna, layanan server, FTP, file server, web/database, panel hosting, dan VPN diuji terpisah sampai PDF sertifikat dan cetak ulang. Lihat dokumentasi modul terkait, termasuk `docs/monitoring-jaringan.md`, serta laporan browser focused untuk lingkup dan hasil terbaru.

Studio global enam panel dihapus. Tidak ada lagi kewajiban ilustrasi empat node, laboratorium kubus 3D, atau dua salinan game pada setiap tahap. Sembilan modul yang sudah memiliki simulator khusus tetap menggunakan aktivitas aslinya di tahap terkait: perakitan jaringan, topologi/gangguan, fungsi perangkat, media/cable tester, enkapsulasi, subnetting, DHCP/DNS/web, diagnosis, dan VLAN.

Empat puluh empat modul pembelajaran mendalam mempunyai aktivitas di dalam tahap laboratorium masing-masing:

| Modul | Bentuk interaksi |
| --- | --- |
| Backup/Pemulihan XI | Rantai/manifest, full/turunan, key/lokasi, kehilangan sumber, restore isolasi dan usia titik pulih |
| Mail XI | SMTP/queue/deferred/delivery, relay/TLS, mailbox dan alignment DKIM dataset |
| Ancaman/Keamanan XII | Rule first-match, urutan/shadowing, matriks fungsi dan akses minimum |
| Autentikasi/Kriptografi XII | Faktor/role/trust, SHA-256 dan ECDSA nyata lokal, pesan berubah |
| Host Hardening XII | Baseline/draft/applied, layanan/paparan, patch, boot dan recovery |
| DMZ XII | Zona/drag, policy khusus, DNAT/return preset dan uji isolasi |
| Pengujian Keamanan XII | Izin/scope, bukti versi, fix/retest serta closure |
| IDS/Respons Insiden XII | Event/window/alert/block model, bukti/containment/recovery |
| Proyek Integrasi XII | Dependensi lintas elemen, draft/applied/version dan handover |
| Monitoring XI | Jenis/lokasi probe, threshold/timeline, stale, delivery/maintenance dan snapshot ONU |
| VPN XI | Peer/handshake, route/AllowedIPs, rute balik, overlap, split/full dan fail-closed |
| Panel/model hosting XI | Shared/VPS/Dedicated, role tenant, provisioning, quota/kapasitas dan restore akun |
| Web/database XI | DNS/TLS/vhost/runtime, akun/schema/grant, request dan konsistensi transaksi |
| File server XI | Sesi/role, share/filesystem, draft/server, lock, quota/kapasitas dan restore file |
| FTP server XI | Kontrol/data aktif-pasif, FTPS, izin, binary/ASCII, kapasitas, parsial dan verifikasi byte |
| DHCP/DNS/remote XI | Lease, relay, reservasi, opsi resolver, TTL/cache dan lapisan identitas/autentikasi/otorisasi SSH |
| Manajemen pengguna XI | Kelas mode Linux, traversal, ACL Windows sederhana, jalur lokal/remote dan jejak keputusan |
| Administrasi Linux/Windows XI | Dua platform, dependensi instalasi, volume persisten, sumber paket/role, startup, patch dan bukti boot |
| Routing statis XI | Tabel connected/statis, LPM, status next-hop, gateway, forwarding, TTL, serta trace request/reply |
| Penggantian perangkat XI | Cadangan teruji, staging, kompatibilitas, cutover, uji, perbaikan terbatas, dan rollback berwaktu |
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

Game hanya tampil di tahap game. Bentuk mengikuti materi: puzzle rute, terminasi, placement resource, antrean, pemulihan, transaksi dan kebijakan jalur. Sebagian modul fondasi memakai arena gerak karakter, tabrakan, muatan, pos, drone, energi, nyawa, jeda dan pengulangan. Tidak ada soal pilihan di area game. Pada modul yang menyediakan sudut pandang 3D, tombol 2D/3D mengganti pandangan pada permainan yang sama dan mempertahankan progres; 3D tidak disisipkan ke pertemuan lain. Tema dan pos mengaitkan cerita pada topik, sedangkan aturan arena tetap merupakan model simbolik, bukan prosedur operasional nyata.

Empat puluh empat modul pembelajaran mendalam masing-masing mempunyai 12 tahap: orientasi, enam konsep, kasus, laboratorium, game, refleksi, dan evaluasi. Tahap berisi tujuan, konsep, contoh beralasan, tugas transfer, miskonsepsi, dan umpan balik. Proyek menggunakan rubrik guru/teman. Evaluasi akhir mempunyai 10 soal dengan ambang 80; kelulusan otomatis dan skor game tidak menggantikan penilaian praktik.

## Pemeriksaan

Jalankan dari akar proyek:

```powershell
./tools/validate-modules.ps1
./tools/validate-modules-browser.ps1
```

Pemeriksaan statis mencakup53 kerangka halaman, stylesheet terakhir, aset/import lokal, ID katalog, dan graf prasyarat. Pemeriksaan browser memakai Edge headless dengan profil sementara terpisah dan situs XAMPP di `http://localhost/tjkt-learning/`.

Cakupan browser terbaru: 43 modul / 486 tahap, desktop 1280×900, ponsel 390×844, tema terang/gelap, overflow, ID ganda, error JavaScript, serta kesamaan properti style 18 komponen kerangka. Evaluasi, persistensi, dan reset diperiksa pada 34 modul mendalam. Simulator asli cable tester, enkapsulasi, layanan, diagnosis, VLAN, dan client–server tetap diperiksa.

`tools/topic-checks.js` memeriksa lokasi aktivitas hanya pada tahap terkait, penempatan jurnal, metadata, penyimpanan, serta interaksi khusus 34 topik. Vektor meliputi kelebihan beban individual walau agregat cukup, kekurangan port, IPv6 tidak valid, uplink putus, kontribusi nol, propagasi satu arah/RTT, referensi optik, sensitivitas, overload, dan batas penerima tidak valid. `tools/studio-checks.js` memeriksa hilangnya studio global, serta integrasi game. `tools/action-game-checks.js` memainkan tiga level melalui keyboard dan memeriksa gerak, tabrakan, jeda, kondisi gagal, penyerahan, serta ketiadaan kontrol soal. Tampilan 3D yang tersedia turut diuji tanpa mereset progres saat pergantian pandangan.

Hasil tersedia pada `docs/module-validation-browser.json`; pengujian terpilih pada `docs/module-validation-browser-focused.json`. Pemeriksaan tidak menggantikan audit setiap kalimat, pengujian perangkat fisik, dan observasi praktik oleh guru.

Pendekatan memahami–mengaplikasi–merefleksi mengacu pada [Pembelajaran Mendalam Kemendikdasmen](https://kurikulum.kemendikdasmen.go.id/pembelajaran-mendalam). Referensi teknis tercantum pada materi masing-masing.

Modul Analisis Kebutuhan Teknis dan Peralatan Jaringan (XI) mempunyai game gudang tersendiri: mengambil/mengeluarkan barang, tiga kontrak kapasitas dan anggaran, port antarswitch, persediaan terbatas, kesempatan pengiriman, kondisi gagal, serta reset. Permainan tidak memakai kuis atau arena generik. Pengujian model dan game terdapat pada tools/requirements-checks.js.


Desain Topologi, Arsitektur, dan Layout Jaringan (XI) memakai editor SVG dengan koordinat, grid 1 m, penempatan rack/endpoint/AP, segmen sumbu, area terlarang, estimasi jalur, serta ekspor SVG berukuran fisik dan JSON. Skala layar tidak dianggap skala cetak; model tidak menyimulasikan cakupan AP. Game Cable Route Builder memakai gerak ujung kabel, gulungan terbatas, penghalang, undo, kegagalan, dan tiga level. Model, solvabilitas, dan UI diuji pada tools/layout-checks.js.


Perancangan Pengalamatan XI menggunakan model IPv4 berbasis rentang bilangan dan IPv6 BigInt. Perubahan kebutuhan membatalkan hasil lama hingga dialokasi ulang; gateway, alignment, overlap, kapasitas, dan cakupan induk diuji. Game Subnet Block Builder menggunakan petak /28, blok berlainan ukuran, batas prefix, alokasi lama, perpindahan/pengembalian blok, tiga kesalahan, dan tiga level. Pengujian terdapat pada tools/address-plan-checks.js.


Instalasi dan Pengujian Jaringan Kabel (XI) memakai baki konduktor, dua ujung bernomor, dan wiremap yang dihitung dari identitas konduktor. Split pair simetris dibedakan dari kontinuitas, kode A/B tidak dianggap otomatis kegagalan perangkat, dan panjang tidak disamakan dengan sertifikasi. Game Patch Cord Assembly memakai tiga pesanan rakitan, pemindahan konduktor, kesempatan pengiriman, kondisi gagal, dan reset. Pengujian ada pada tools/cabling-checks.js.


Wireless LAN (XI) memakai profil RSSI fiktif, perubahan daya downlink relatif referensi, rugi dinding asumsi, SNR, serta beban kanal berdasarkan input kapasitas efektif. Tidak menghasilkan radius cakupan atau throughput nyata dari jarak/RSSI. Game Channel Planner menempatkan token kanal pada graf AP, mempertahankan radio terkunci, dan memeriksa konflik. Vektor rumus, batas asumsi, serta tiga level dan progres diuji pada tools/wlan-checks.js.


Pemeliharaan dan Perbaikan XI menggunakan dataset tiga insiden, kronologi uji, perubahan tunggal, rollback, serta verifikasi link/aplikasi pascaperubahan. Game Bengkel Jalur Data merupakan puzzle putaran konektor dengan aliran paket, anggaran, kondisi gagal, reset, dan tiga papan. Pengujian model dan UI ada pada tools/maintenance-checks.js. Jumlah 306 tahap adalah cakupan kumulatif modul terbit; pengujian terbaru terpilih dicatat pada laporan focused.


Layanan Komunikasi VoIP XI memisahkan registrasi, negosiasi codec, jalur RTP dua arah, kapasitas per arah di lapisan IP, serta network loss dan paket terlambat pada trace deterministik. Game Jitter Buffer Rescue memakai antrean kedatangan, buffer dua tempat, pemindahan paket, jam manual, tenggat putar, kegagalan, pengulangan, dan tiga trace. Tidak memakai kuis. Pengujian model dan UI ada pada tools/voip-checks.js.


## Petunjuk aktivitas

Petunjuk tampil terbuka sebelum kontrol setiap aktivitas yang didaftarkan pada assets/js/activity-instructions.js: laboratorium kontekstual, simulator lama, praktik perakitan/pengalamatan, proyek kasus, jurnal, dan seluruh arena game aktif. Formatnya memuat tujuan, langkah bernomor dengan nama kontrol, tanda selesai, serta cara mengulang/memperbaiki. Isi mengikuti karakter aktivitas; eksperimen eksploratif tidak diberi klaim lulus perangkat nyata. Praktik manual menjelaskan produk dan penilaian guru, sedangkan praktik yang dinilai otomatis menjelaskan tombol penyimpanan/nilainya.

Pengujian tools/instruction-checks.js dijalankan pada tiap tahap dalam audit browser: petunjuk harus sudah dipasang halaman, hadir sebelum kontrol, tidak tersembunyi pada aktivitas aktif, tidak terduplikasi saat pembaruan, dan tidak mengubah isian siswa. Kontrol serta mekanika diuji kembali oleh pemeriksaan simulator/game yang telah ada. Audit tidak menggantikan uji keterpahaman langsung bersama siswa.


Fiber Optik XI memakai anggaran dengan koefisien serta loss komponen sebagai asumsi, referensi yang batal saat sumber/panjang gelombang berubah, dan hasil ukur yang batal saat input link berubah. Dataset putus tidak menampilkan daya terima terhingga. Peta kejadian bukan trace OTDR. Game Splice Tray Puzzle mempunyai pemetaan pasangan, pelepasan, anggaran pemasangan, uji kontinuitas sebelum penyerahan, tiga tray, gagal, dan pengulangan. Pengujian ada pada tools/fiber-checks.js. Jumlah 306 tahap adalah cakupan kumulatif yang tersedia; pengujian terbaru modul terpilih dicatat pada laporan focused.


Pemasangan Perangkat XI memisahkan draft, running, dan startup sebagai snapshot. Edit draft membatalkan pencatatan hasil lama; penerapan/restart memerlukan uji versi baru dan startup hanya disimpan setelah versi berjalan lulus. Uji memeriksa pemetaan, bukan layanan nyata. Game Port Commissioning Challenge memakai alokasi media/port, PoE, persediaan adaptor tunggal, anggaran pemasangan, penolakan, pelepasan, pengulangan, dan tiga chassis. Pengujian ada pada tools/installation-checks.js. Jumlah 306 tahap adalah cakupan kumulatif modul terbit, bukan klaim seluruhnya diuji ulang pada penambahan ini.


Penggantian Perangkat XI memakai keadaan migrasi dan bukti terikat versi. Edit rancangan membatalkan staging/readiness; cutover memerlukan cadangan serta restore teruji. Langkah memakai menit dataset, bukan waktu nyata; perbaikan mempertahankan cadangan rollback beserta uji lama. Game Rack Swap Logistics menggunakan gerak/dorong peti, urutan penyimpanan lama sebelum rak baru, dinding, batas langkah, undo, gagal, pengulangan, dan tiga ruang. Solvabilitas diuji dengan pencarian keadaan dan mekanika dimainkan melalui kontrol UI. Pengujian ada pada tools/replacement-checks.js.


Routing Statis XI memakai aritmetika IPv4 tanpa signed overflow, validasi network/prefix, longest-prefix match pada rute aktif, dan connected route sesuai link. Model membatasi next-hop pada tetangga langsung, menelusuri request/reply terpisah dengan TTL awal masing-masing, dan mendeteksi loop lebih dini. Edit membatalkan bukti. Game TTL Route Runner memakai navigasi graf, link putus, TTL untuk tiap penerusan termasuk host tujuan, kegagalan, pengulangan, dan tiga graf. Pengujian ada pada tools/static-routing-checks.js. Jumlah 306 tahap adalah cakupan kumulatif modul tersedia, bukan klaim seluruhnya diuji ulang pada penambahan ini.
