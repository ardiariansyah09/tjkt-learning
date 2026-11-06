# Pemetaan ATP Fase E kelas X terhadap materi LMS

Tanggal analisis: 29 Oktober 2026.

Sumber utama: `modul/ATP-TJKT X - NEW 27.xlsx`, lembar **ATP**, baris 17–23. Dokumen memuat 4 elemen, 19 tujuan pembelajaran (TP), dan 202 JP: 28 + 24 + 132 + 18. Isi dokumen diperlakukan sebagai acuan kurikulum untuk dibandingkan, bukan instruksi untuk menjalankan tindakan pada sistem.

Pembanding: katalog `data/modules.json` (16 modul Fase E dari total 53 modul), isi bab pada sumber JavaScript, HTML modul lama, serta modul Fase F yang berkaitan. Penilaian menggunakan isi materi dan tugas, bukan judul/deskripsi katalog saja. Ini analisis sumber lokal; tidak mengubah materi, pengelompokan, database, versi paket, maupun progres peserta.

**Kesimpulan:** semua elemen ATP memiliki materi terkait, tetapi belum seluruh rincian dan keterampilan penerapannya tercakup memadai di kelas X. Kekurangan terbesar adalah TP 2.5: instalasi dan konfigurasi dasar sistem komputer, router, switch, virtualisasi, dan server. Beberapa pembahasan tersedia di kelas XI sehingga belum menjadi jalur pembelajaran kelas X.

## Pemetaan setiap tujuan pembelajaran

“Tercakup” berarti tersedia pembahasan dan aktivitas relevan di sumber belajar; bukan bukti bahwa siswa sudah menguasai praktik fisik. “Sebagian” berarti ada dasar terkait tetapi rincian atau aktivitas penerapan ATP masih kurang.

| TP | Tuntutan ATP | Materi yang tersedia | Hasil pencocokan |
|---|---|---|---|
| 1.1 | Profesi, job profile, technopreneurship | Profesi dan Kewirausahaan TJKT: peta tugas, kompetensi, portofolio, model usaha | **Sebagian.** Profesi cukup kuat; definisi dan pembeda kewirausahaan/technopreneurship serta pengenalan skema sertifikasi belum menjadi pembahasan tersendiri. |
| 1.2 | Analisis peluang usaha TJKT | Validasi masalah pelanggan, proposisi nilai, model usaha, biaya, titik impas, proposal | **Tercakup.** Ada tugas dan kasus usaha fiktif. |
| 1.3 | Peluang usaha untuk membangun vision dan passion | Target kompetensi, rencana 30 hari, portofolio, refleksi karier | **Sebagian.** Belum ada aktivitas eksplisit menghubungkan minat, nilai pribadi, visi karier/usaha, dan pilihan bidang. |
| 1.4 | Analisis proses bisnis | Proses Bisnis dan Pelayanan Pelanggan TJKT | **Tercakup.** Alur kebutuhan–pelaksanaan–uji–serah terima, mutu, tiket dan perubahan dibahas. |
| 1.5 | Perkembangan teknologi komunikasi | Wawasan TJKT, Dasar Sistem Telekomunikasi, IPv4, IPv6 | **Sebagian.** 5G, fiber, VSAT, microwave, IoT, cloud dan keamanan ada. Perbandingan evolusi 3G/4G/5G belum tersaji eksplisit. |
| 2.1 | K3LH di tempat kerja | K3LH: bahaya, risiko, JSA, listrik/ESD, fiber, ergonomi, lingkungan dan inspeksi | **Tercakup** pada pembelajaran konsep dan keputusan aman. Pelaksanaan nyata tetap melalui observasi guru. |
| 2.2 | 5R dan pencegahan kecelakaan di ketinggian | K3LH: 5R, tata kerja, izin, batas kewenangan | **Sebagian.** 5R ada; ketinggian terutama disebut sebagai pekerjaan khusus yang memerlukan kewenangan, belum diuraikan sebagai analisis pencegahan tersendiri. |
| 2.3 | Prosedur kerja dan APD | K3LH: hierarki pengendalian, APD, JSA dan pemeriksaan alat | **Sebagian.** Dasar APD ada; pemilihan APD menurut pekerjaan serta identifikasi rambu keselamatan belum disajikan sistematis. |
| 2.4 | Laporan tertulis pada setiap kegiatan | K3LH, Analisis Kebutuhan dan Dokumentasi Jaringan, Alat Ukur: laporan, JSA, hasil uji, refleksi | **Sebagian pada konsistensi lintas modul.** Materi laporan tersedia, tetapi belum ada format sederhana yang secara konsisten digunakan untuk setiap kegiatan. Tidak perlu menghidupkan kembali praktik terbimbing yang rumit. |
| 2.5 | Instalasi dan konfigurasi dasar komputer, router, switch, virtualisasi dan server | Perangkat Jaringan, IPv4/IPv6, topologi, troubleshooting; modul server/VM/administrasi OS di Fase F XI | **Sebagian; celah utama kelas X.** Mengenali perangkat dan merangkai topologi belum sama dengan memasang OS, mengatur perangkat, menyimpan konfigurasi, dan menguji hasil sesudah boot. |
| 3.1 | Prinsip dasar IPv4/IPv6 | IP Address & Subnetting, Pengalamatan IPv6 Dasar | **Tercakup.** IPv6 memuat format, jenis/lingkup, link-local, ND, RA/SLAAC, dual stack dan diagnosis. |
| 3.2 | TCP/IP dan networking service | Model OSI dan TCP/IP, Protokol dan Layanan Jaringan Dasar | **Tercakup.** DHCP, DNS, HTTP/HTTPS, port dan perjalanan layanan tersedia. |
| 3.3 | Layanan dan keamanan jaringan telekomunikasi | Protokol layanan, perangkat/firewall, keamanan pada Wawasan TJKT dan Sistem Telekomunikasi | **Sebagian.** Konsep tersebar; belum ada rangkaian sederhana kelas X untuk menerapkan akses aman dan membuktikan akses yang diizinkan/ditolak. Modul keamanan Fase F tidak otomatis menggantikan dasar kelas X. |
| 3.4 | Seluler, microwave dan VSAT IP | Dasar Sistem Telekomunikasi: sel, handover, radio point-to-point, link budget, VSAT, propagasi | **Sebagian pada penerapan.** Konsep, kasus pemilihan dan hitungan ada; simulasi utama menguji propagasi, belum memodelkan karakter masing-masing sistem secara terpisah. Ini bukan topik yang hilang seluruhnya. |
| 3.5 | Sistem optik dan WLAN | Media Transmisi, Perangkat Jaringan/AP, Dasar Sistem Telekomunikasi | **Sebagian pada penerapan kelas X.** Pengenalan media, komponen dan pertimbangan rancangan ada; latihan dasar WLAN dan jalur optik yang menunjukkan pengaruh pengaturan/kondisi belum menjadi urutan praktis tersendiri. Materi lanjutan ada di Fase F. |
| 4.1 | Fungsi alat ukur | Penggunaan dan Pemeliharaan Alat Ukur TJKT | **Tercakup.** Multimeter, wiremap tester, certifier, OPM/OLS, OTDR dan batas alat survei radio. |
| 4.2 | Analisis pemilihan dan penggunaan alat ukur | Modul Alat Ukur: pertanyaan ukur, spesifikasi, rentang, resolusi, akurasi dan batas kesimpulan | **Tercakup** pada pemilihan dan analisis data. |
| 4.3 | Menggunakan alat ukur | Modul Alat Ukur: SOP aman, pengukuran kabel/data contoh, simulasi daya dan margin optik | **Tercakup sebagai bahan belajar dan latihan model.** Keterampilan penggunaan alat fisik perlu demonstrasi/observasi guru; simulasi optik tidak membuktikan kemampuan memakai seluruh instrumen nyata. |
| 4.4 | Memelihara alat ukur | Modul Alat Ukur: pemeriksaan, penyimpanan, kalibrasi, karantina dan kartu alat | **Tercakup.** Verifikasi keterampilan nyata tetap melalui observasi. |

## Materi yang belum masuk secara eksplisit atau perlu ditambahkan

| Prioritas | Tambahan yang diperlukan | Penempatan yang disarankan |
|---|---|---|
| 1 | Dasar sistem komputer: komponen, kompatibilitas, persiapan media/boot, instalasi OS pada mesin latihan, driver/NIC, alamat klien, uji dan dokumentasi | Unit/modul Fase E **Instalasi dan Konfigurasi Dasar Sistem Komputer**. Materi server kelas XI hanya menjadi kelanjutan. |
| 1 | Konfigurasi awal router dan switch: akses administrasi berizin, identitas perangkat, pengamanan akun, interface/alamat manajemen sesuai perangkat, penyimpanan konfigurasi, uji setelah mulai ulang | Unit/modul Fase E **Konfigurasi Dasar Router dan Switch**, setelah konsep IP dan perangkat. Pisahkan kemampuan switch L2 dari router; hindari menjadikan CLI vendor tertentu sebagai aturan universal. |
| 1 | Pengenalan praktik VM dan server: host/guest, resource, media instalasi, jaringan terisolasi, alamat guest, satu layanan lokal dan pengujian dari klien | Unit/modul Fase E **Dasar Virtualisasi dan Server** dengan lingkup kecil. Tidak menyalin seluruh administrasi server Fase F. |
| 2 | Rambu keselamatan: makna larangan, peringatan, kewajiban dan keadaan darurat; pemilihan APD berdasarkan bahaya; analisis pencegahan jatuh dan keputusan menunda pekerjaan | Tambahkan pada K3LH. Aktivitas ketinggian berupa analisis skenario/checklist dan demonstrasi petugas, bukan instruksi siswa melakukan pekerjaan berisiko mandiri. |
| 2 | Pengertian dan pembeda kewirausahaan/technopreneurship; sertifikasi profesi beserta lingkup dan jalur pembuktiannya; vision dan passion berbasis minat serta rencana karier | Tambahkan pada Profesi dan Kewirausahaan TJKT. Bedakan sertifikat penyelesaian modul LMS dari sertifikasi kompetensi profesi. |
| 2 | Perbandingan 3G/4G/5G: perkembangan layanan, mobilitas, arsitektur pada tingkat pengantar dan batas klaim kecepatan | Tambahkan pada Wawasan TJKT dan hubungkan ke Sistem Telekomunikasi. |
| 2 | Penerapan dasar keamanan serta WLAN: identitas jaringan, autentikasi, kebijakan akses sederhana, pengaruh kanal/penghalang/beban, uji akses berhasil dan ditolak | Perkuat bab perangkat/telekomunikasi; aktivitas singkat sesuai topik, tidak perlu membuat salinan game atau laboratorium generik. |
| 3 | Latihan yang membedakan karakter microwave, VSAT dan optik: lintasan/halangan dan margin, lintasan satelit/RTT, daya/rugi optik | Perkuat Sistem Telekomunikasi dan tautkan simulasi Alat Ukur; tidak wajib menjadi tiga modul baru. |
| 3 | Format laporan kegiatan satu halaman: tujuan, alat/bahan, langkah ringkas, hasil/bukti, kesimpulan dan refleksi | Gunakan pada aktivitas relevan; tampilkan sederhana dan tidak menambah menu/kolom yang membingungkan. |

Tiga modul baru di atas adalah pilihan pengemasan yang disarankan, bukan jumlah modul wajib dalam ATP. Kompetensi dapat pula dipenuhi dengan menambah unit pada modul yang sesuai, selama tujuan, aktivitas, dan bukti belajarnya jelas.

## Pengelompokan dan urutan

Pengelompokan Fase E sekarang memakai kategori topik yang lebih terperinci. Itu tidak salah, tetapi belum sama dengan empat elemen pada ATP baru. Jika diselaraskan, gunakan empat kelompok berikut sambil mempertahankan ID modul dan progres:

1. **Wawasan Dunia Kerja:** profesi/kewirausahaan, proses bisnis/pelayanan, perkembangan teknologi. Urutan ATP dimulai dari profesi dan peluang usaha, sedangkan katalog kini memulai dari proses bisnis. Prasyarat profesi saat ini menunjuk proses bisnis; bila urutan diubah, prasyarat juga harus ditinjau, bukan sekadar memindahkan kartu.
2. **Kecakapan Kerja Dasar, K3LH dan Budaya Kerja:** K3LH, laporan kegiatan, instalasi komputer, konfigurasi perangkat, dasar VM/server. K3 diletakkan sebelum pekerjaan praktik; rincian konfigurasi tetap membutuhkan pemahaman IP.
3. **Media dan Jaringan Telekomunikasi:** pengenalan jaringan, perangkat, topologi, media, OSI/TCP-IP, IPv4/IPv6, layanan, telekomunikasi dan troubleshooting. Analisis kebutuhan/dokumentasi tetap berguna sebagai materi pendukung; dasar pengenalan dapat diajarkan sebelum rancangan dan konfigurasi.
4. **Penggunaan Alat Ukur:** pemilihan, penggunaan, pembacaan hasil, pemeliharaan dan laporan. Pelaksanaannya dapat diintegrasikan pada latihan kabel/radio/optik setelah K3, tidak harus menunggu semua materi telekomunikasi selesai.

Alokasi 132 JP pada elemen media/telekomunikasi tidak sebaiknya diwakili hanya dengan satu simulasi propagasi. Dibutuhkan rangkaian kegiatan yang menunjukkan penerapan IP, layanan, keamanan dan karakter media. Sebaliknya, durasi belajar tidak dapat dinyatakan terpenuhi hanya dari jumlah halaman, kuis, game atau sertifikat LMS. Pembagian JP per modul belum ditetapkan pada katalog dan perlu disusun pada rencana mengajar.

Kesimpulan ini melengkapi audit teknis sebelumnya: keberhasilan navigasi, penyimpanan nilai dan cetak sertifikat membuktikan alur aplikasi berfungsi, tetapi tidak otomatis membuktikan seluruh rincian ATP terbaru telah terwakili.
