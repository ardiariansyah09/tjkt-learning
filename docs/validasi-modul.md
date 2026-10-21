# Standar dan validasi modul

Seluruh 17 modul terbit menggunakan kerangka navigasi yang sama: header, tema, sidebar fase/judul, progres, daftar tahap, reset, breadcrumb, materi, evaluasi, dan tombol sebelumnya/berikutnya. Stylesheet `module-standard.css` dimuat terakhir. Keseragaman berlaku pada kerangka dan kontrol, bukan pada bentuk aktivitas setiap materi.

## Aktivitas mengikuti karakter materi

Studio global enam panel dihapus. Tidak ada lagi kewajiban ilustrasi empat node, laboratorium kubus 3D, atau dua salinan game pada setiap tahap. Sembilan modul yang sudah memiliki simulator khusus tetap menggunakan aktivitas aslinya di tahap terkait: perakitan jaringan, topologi/gangguan, fungsi perangkat, media/cable tester, enkapsulasi, subnetting, DHCP/DNS/web, diagnosis, dan VLAN.

Delapan modul pembelajaran mendalam mempunyai aktivitas di dalam tahap laboratorium masing-masing:

| Modul | Bentuk interaksi |
| --- | --- |
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

Delapan modul pembelajaran mendalam masing-masing mempunyai 12 tahap: orientasi, enam konsep, kasus, laboratorium, game, refleksi, dan evaluasi. Tahap berisi tujuan, konsep, contoh beralasan, tugas transfer, miskonsepsi, dan umpan balik. Proyek menggunakan rubrik guru/teman. Evaluasi akhir mempunyai 10 soal dengan ambang 80; kelulusan otomatis dan skor game tidak menggantikan penilaian praktik.

## Pemeriksaan

Jalankan dari akar proyek:

```powershell
./tools/validate-modules.ps1
./tools/validate-modules-browser.ps1
```

Pemeriksaan statis mencakup 17 kerangka halaman, stylesheet terakhir, aset/import lokal, ID katalog, dan graf prasyarat. Pemeriksaan browser memakai Edge headless dengan profil sementara terpisah dan situs XAMPP di `http://localhost/tjkt-learning/`.

Cakupan browser: 174 tahap, desktop 1280×900, ponsel 390×844, tema terang/gelap, overflow, ID ganda, error JavaScript, serta kesamaan properti style 18 komponen kerangka. Evaluasi, persistensi, dan reset diperiksa pada delapan modul mendalam. Simulator asli cable tester, enkapsulasi, layanan, diagnosis, VLAN, dan client–server tetap diperiksa.

`tools/topic-checks.js` memeriksa lokasi aktivitas hanya pada tahap terkait, penempatan jurnal, metadata, penyimpanan, serta interaksi khusus delapan topik. Vektor meliputi kelebihan beban individual walau agregat cukup, kekurangan port, IPv6 tidak valid, uplink putus, kontribusi nol, propagasi satu arah/RTT, referensi optik, sensitivitas, overload, dan batas penerima tidak valid. `tools/studio-checks.js` memeriksa hilangnya studio global, serta integrasi game. `tools/action-game-checks.js` memainkan tiga level melalui keyboard dan memeriksa gerak, tabrakan, jeda, kondisi gagal, penyerahan, serta ketiadaan kontrol soal. Tampilan 3D yang tersedia turut diuji tanpa mereset progres saat pergantian pandangan.

Hasil tersedia pada `docs/module-validation-browser.json`; pengujian terpilih pada `docs/module-validation-browser-focused.json`. Pemeriksaan tidak menggantikan audit setiap kalimat, pengujian perangkat fisik, dan observasi praktik oleh guru.

Pendekatan memahami–mengaplikasi–merefleksi mengacu pada [Pembelajaran Mendalam Kemendikdasmen](https://kurikulum.kemendikdasmen.go.id/pembelajaran-mendalam). Referensi teknis tercantum pada materi masing-masing.