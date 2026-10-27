# Audit fungsi dan cakupan pembelajaran TJKT

Tanggal tinjauan: 26 Oktober 2026. Objek: workspace lokal, bukan situs GitHub Pages yang sedang tayang.

## Kesimpulan

Katalog memuat 53 modul tersedia: 16 Fase E/X, 30 Fase F/XI dan 7 Fase F/XII. Bidang utama nasional terwakili. Namun, ketersediaan semua judul dan kelulusan otomatis aplikasi belum cukup untuk menyatakan seluruh kompetensi praktik telah dikuasai atau setiap rincian materi sudah mendalam.

Prioritas pengembangan berikutnya adalah penguatan kecakapan kerja dasar Fase E serta paket praktik implementasi dan asesmen kinerja Fase F. Tidak perlu menambah banyak judul yang mengulang materi yang telah ada. IoT, cloud, dan otomasi dapat menjadi pengayaan terarah setelah fondasi dan praktik inti kuat.

## Dasar penilaian

- Katalog, metadata tahap, konten course, petunjuk aktivitas, model simulasi, permainan, prasyarat dan laporan pengujian dalam repository.
- ATP XI/XII pengguna sebagaimana tersimpan pada `data/atp-fase-f.json` dan `pemetaan-atp-fase-f.md`. Audit ini menggunakan hasil pemetaan yang tersedia; tidak mengklaim membaca ulang berkas DOCX asli pada putaran ini.
- [Keputusan Kepala BSKAP 046/H/KR/2025](https://kurikulum.kemendikdasmen.go.id/file/1753929861_manage_file.pdf). Pengambilan PDF penuh melalui layanan web terkendala ukuran berkas; bagian TJKT/TKJ ditelusuri melalui hasil indeks pada URL resmi tersebut, bukan menganggap seluruh dokumen berhasil diunduh.
- [Muatan TJKT pada Pusmendik](https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-pilihan/sma/teknik-jaringan-komputer-dan-telekomunikasi-smk-mak), sebagai penjelas lingkup dasar, bukan pengganti CP atau seluruh kurikulum.
- [Penjelasan resmi perubahan CP 2026](https://www.kemendikdasmen.go.id/siaran-pers/15636-capaian-pembelajaran-baru-telah-terbit-yang-berubah-hanya-mata-pelajaran-agama-dan-budi-pekerti): perubahan 020/2026 terbatas pada Agama dan Budi Pekerti; acuan mata pelajaran lain tetap 046/H/KR/2025.

Pemetaan berikut merupakan analisis repository terhadap elemen nasional, bukan kutipan rumusan CP. Nama kelompok pada beranda boleh lebih rinci daripada elemen CP. Kelas XI/XII dan JP tetap mengikuti ATP sekolah; tidak diubah menjadi alokasi nasional baru.

## Pemetaan seluruh katalog

| Elemen / posisi | Modul yang tersedia | Penilaian cakupan |
| --- | --- | --- |
| E — Wawasan dunia kerja | Proses Bisnis dan Pelayanan Pelanggan; Perkembangan Teknologi dan Isu Global; Profesi dan Kewirausahaan (3) | Proses layanan, profesi, usaha dan pertimbangan teknologi sudah ada. IoT/cloud pada tingkat pengantar, bukan implementasi layanan lengkap. |
| E — Kecakapan kerja dasar, K3LH dan budaya kerja | K3LH; Pengenalan Jaringan; Perangkat Jaringan; Topologi; Analisis Kebutuhan dan Dokumentasi (5) | K3 dan fondasi jaringan tersedia. Latihan penggunaan OS, terminal, VM dan konfigurasi awal perangkat belum menjadi satu alur kelas X yang utuh; pembahasan rinci terutama baru muncul pada XI. Perlu diperkuat. |
| E — Media dan jaringan telekomunikasi | Media Transmisi; OSI/TCP-IP; IPv4/Subnetting; IPv6 Dasar; Protokol/Layanan; Dasar Sistem Telekomunikasi; Troubleshooting (7) | Berbagai media, protokol dan diagnosis terwakili. Seluler, microwave dan VSAT dibahas pada sistem telekomunikasi; tidak perlu dianggap hilang hanya karena tidak mempunyai judul modul sendiri. |
| E — Penggunaan alat ukur | Penggunaan dan Pemeliharaan Alat Ukur TJKT (1) | Pemilihan alat, satuan, rentang, redaman, keterbatasan, kalibrasi dan perawatan tersedia. Kinerja memakai alat fisik tetap memerlukan observasi praktik. |
| F — Perencanaan dan pengalamatan | Kebutuhan Teknis/Peralatan; Desain Topologi/Arsitektur/Layout; Pengalamatan Lanjut CIDR/VLSM (3) | Kebutuhan, desain, skala dan pengalamatan terwakili; dasar IPv4/IPv6 menjadi prasyarat dari E. |
| F — Teknologi kabel dan nirkabel | Instalasi Kabel; WLAN; Perawatan/Perbaikan Kabel/Nirkabel; VoIP; Fiber Optik (5) | Instalasi, pengujian, perbaikan dan komunikasi tersedia. Praktik terminasi, survei dan pengukuran fisik tidak dapat digantikan game. |
| F — Konfigurasi perangkat | Pemasangan; Penggantian; Switching/VLAN; Routing Statis; OSPF; NAT; Proxy; QoS; Load Balancing/Failover (9) | Lingkup konfigurasi terwakili. RADIUS sudah dikenalkan dalam QoS; bukan materi yang sama sekali belum ada. Penguatan loop prevention dan diagnosis paket dapat ditambahkan di modul terkait. |
| F — Administrasi sistem | Dasar Server; Virtualisasi; Linux/Windows; Pengguna/Hak Akses; DHCP/DNS/Remote; FTP; File Server; Web/Database; Panel/Model Hosting; VPN; Monitoring; Backup/Pemulihan; Mail (13) | Layanan inti dan pendukung tersedia. Pengamanan terintegrasi tidak menggantikan pendalaman keamanan XII. Mail tetap bagian lingkup nasional meskipun label ATP lokal adalah pengayaan. |
| F — Keamanan | Ancaman/Sistem Keamanan; Autentikasi/Kriptografi; Host Hardening; DMZ; Pengujian Keamanan; IDS/IPS/Respons Insiden (6) | Seluruh rumpun tersebut terwakili. Identitas dan kriptografi bukan server autentikasi yang sudah berjalan; perlu praktik lintas modul, bukan hanya model keputusan akses. |
| F — Pengayaan lintas elemen | Proyek Integrasi Jaringan (1) | Menghubungkan rancangan, layanan, keamanan, bukti uji dan serah terima. Ini bukan elemen CP keenam dan tidak menambah JP ATP. |

Jumlah pemetaan: 16 + 37 = 53 modul; setiap entri mendapat satu posisi utama. Beberapa kompetensi tetap dipelajari lintas elemen.

## Penguatan yang perlu didahulukan

| Prioritas | Kebutuhan dan bukti yang ditemukan | Bentuk penambahan yang disarankan | Bukti keberhasilan belajar |
| --- | --- | --- | --- |
| 1 — fondasi E | OS, VM dan konfigurasi awal perangkat belum disusun menjadi praktik dasar yang utuh di kelas X. Materi operasional rinci tersedia pada modul XI. | Satu unit/praktikum terpadu Kecakapan Kerja Dasar TJKT: mengenali OS dan antarmuka, berkas/direktori, membaca konfigurasi IP, menyiapkan VM terisolasi, menyambung dua host melalui switch, mengatur alamat dan menguji jalur. Gunakan bagian dasar materi XI tanpa memindahkan seluruh administrasi server ke E. | Siswa mampu menunjukkan baseline, mengubah satu variabel, menguji hasil, menjelaskan kegagalan dan memulihkan keadaan. |
| 1 — praktik F | Banyak model browser sengaja menyederhanakan OS/layanan/perangkat. Contoh kode dan tugas proyek tersedia, tetapi hasil game tidak membuktikan konfigurasi nyata. | Lengkapi LKPD berurutan untuk satu platform/versi lab yang ditetapkan: persiapan, konfigurasi, verifikasi lokal/klien, uji penolakan, gangguan, rollback dan dokumentasi. Prioritaskan rantai VLAN/routing/DHCP/DNS, web/database, autentikasi dan DMZ. | Konfigurasi, log/hasil perintah, uji positif-negatif dan pemulihan ditinjau guru; bukan checklist tanpa bukti. |
| 1 — K3 kontekstual | Modul K3 menyebut batas pekerjaan di ketinggian dan eskalasi, tetapi kegiatan utamanya berpusat pada lab meja. | Tambahkan studi kasus pra-kerja di ketinggian/luar ruang: mengenali kondisi tidak aman, memeriksa kewenangan dan rencana penanganan darurat, lalu menentukan berhenti atau eskalasi. Praktik berisiko memerlukan fasilitas, pendampingan dan kewenangan sekolah. | Analisis risiko dan alasan keputusan yang ditinjau guru; tidak meminta siswa mencoba penyelamatan atau bekerja di ketinggian melalui petunjuk web. |
| 2 — diagnosis paket | Model alur protokol tersedia; pembacaan tangkapan paket belum menjadi latihan lintas modul yang utuh. | Dataset pcap lokal terkurasi untuk ARP/ND, DHCP, DNS, TCP dan metadata TLS; prediksi alur sebelum membaca bukti. Lengkapi latihan korelasi timestamp/log di layanan dan monitoring. | Siswa menunjuk frame/field atau log yang mendukung diagnosis dan membedakan indikasi dari kepastian. |
| 2 — switching dan identitas | VLAN dan profil RADIUS telah dibahas. Pencegahan loop switching serta penerapan AAA menyeluruh belum mempunyai rangkaian aktivitas khusus setara modul utama. | Pengayaan STP/RSTP dan proteksi loop di Switching/VLAN; praktik AAA/FreeRADIUS dengan NAS pada lab terisolasi, merujuk pengantar QoS dan Autentikasi. | Gangguan tidak diselesaikan dengan membuka semua akses; jalur sah dan penolakan diuji, profil benar-benar diterapkan pada perangkat yang menegakkan kebijakan. |

Usulan unit Kecakapan Kerja Dasar dapat dijadikan satu modul baru jika navigasi memerlukannya. Penguatan lain lebih tepat menambah submateri/LKPD dalam modul yang sudah ada agar tidak mengulang isi. Usulan dalam tabel ini belum dinyatakan sebagai modul yang telah dibuat.

Tindak lanjut tahap awal: [praktikum dasar di dalam platform](praktikum-dasar-platform.md) kini ditambahkan pada laboratorium Analisis Kebutuhan dan Dokumentasi kelas X. Siswa membaca rencana, menyiapkan konfigurasi PC dan lingkungan VM model, melakukan pemeriksaan berlapis, serta menangani tiga jenis gangguan dan pemulihan setelah restart. Ini memperkuat bagian konfigurasi/pengujian dasar; instalasi OS nyata, seluruh keterampilan dasar dan paket praktik Fase F belum dinyatakan tuntas melalui tambahan tersebut. Katalog tetap 53 modul.

## Pengayaan pilihan setelah fondasi

- IoT jaringan: sensor–gateway–broker–dashboard pada dataset/lab lokal, putus sambung, identitas perangkat dan isolasi jaringan. Materi pengantar IoT sudah ada pada Wawasan TJKT.
- Cloud dan container dasar: bedakan VM/container, image, jaringan, volume, tanggung jawab layanan dan pemulihan. Cloud dan virtualisasi sudah dikenalkan; orkestrasi lanjut tidak perlu menjadi prasyarat inti.
- Otomasi administrasi: skrip sederhana, inventaris/config berversi, pemeriksaan sebelum perubahan dan rollback. Mulai dari pekerjaan berulang yang sudah dipahami secara manual.

Ketiganya rekomendasi pengembangan untuk konteks sekolah/industri, bukan klaim bahwa tiga judul tersebut wajib menjadi modul CP nasional tersendiri. Tidak perlu memperluas portal TKJ ini menjadi seluruh konsentrasi lain dalam program TJKT tanpa ATP konsentrasi terkait.

## Fungsi aplikasi dan batas pemeriksaan

Validasi statis terbaru memastikan 53 halaman terbit, aset/import lokal, graf prasyarat, kelas, peran dan total JP. Audit browser tampilan terakhir mencakup 53 modul/606 tahap, desktop/ponsel dan tema terang/gelap, tanpa error serta style parity benar (`module-validation-browser.json`). Kerangka bersama konsisten; sembilan modul lama memiliki 8–9 tahap sedangkan 44 modul berikutnya memiliki 12 tahap. Perbedaan jumlah tahap tidak disamakan dengan kerusakan struktur.

Uji penyelesaian ulang pada putaran ini selesai: **53 modul/606 tahap lulus dari progres kosong; 53 sertifikat PDF satu halaman; 53 cetak ulang dari progres tersimpan; 53 penolakan cetak ketika nilai akhir di bawah ambang**. Seluruh hasil menggunakan desain sertifikat `tjkt-circuit-v3`. Tidak ditemukan kegagalan pada putaran lengkap terakhir. Bukti per modul: `completion-validation-browser.json`.

Tes otomatis memeriksa kondisi yang ditulis dalam harness dan model: tahap berurutan, pencatatan nilai, sertifikat dan penolakan nilai kurang. Tes tidak membuktikan semua kemungkinan interaksi manusia, akurasi setiap kalimat, kualitas pedagogik melalui uji siswa, kecakapan alat fisik atau implementasi jaringan nyata. Penilaian pembelajaran mendalam tetap memerlukan kualitas alasan, transfer konteks, praktik, refleksi dan umpan balik guru.

Tidak ada penambahan tautan "baca analisis cakupan" pada halaman siswa. Catatan ini untuk pemeliharaan proyek. Progres dan sertifikat yang sudah tersimpan tidak dihapus.


Tindak lanjut berikutnya: [praktik layanan server terbimbing](praktik-layanan-server-terbimbing.md) memperkuat DHCP/DNS/remote kelas XI dengan tiga kasus diagnosis, bukti berurutan, penerimaan versi terbaru dan laporan. Ini penambahan pada model browser yang sudah ada; bukan klaim implementasi LKPD perangkat nyata untuk semua modul Fase F.


## Koreksi arah pengembangan — 26 Oktober 2026

Atas permintaan pengguna, dua tambahan praktik terbimbing dilepas kembali karena dianggap terlalu rumit. Catatan implementasinya bersifat historis; kelanjutan penambahan praktik sejenis tidak dijalankan. Simulasi utama dan penilaian yang sebelumnya sudah ada tetap menjadi dasar modul. Fokus sekarang memperjelas game 2D dan petunjuk singkat, dengan data kelulusan lama dipertahankan.
