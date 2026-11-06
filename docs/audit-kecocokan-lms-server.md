# Audit kecocokan LMS server dan penyederhanaan penggunaan

Tanggal: 28 Oktober 2026. Sumber: pemeriksaan baca saja terhadap kode `/var/www/tjkt-learning` di server `172.16.10.6`. Tidak ada perubahan aplikasi, konfigurasi, database, atau akun server pada audit ini. Ini audit struktur kode dan tampilan Blade, bukan pengujian masuk sebagai pengguna atau pengujian perilaku produksi.

## Kesimpulan

Fondasi Laravel layak dipertahankan sebagai calon backend. Integrasi seluruh materi belum siap dilakukan langsung. Perlu menyederhanakan antarmuka dan menjembatani format konten, aktivitas, kelulusan, serta sertifikat. Kecocokan perilaku harus dibuktikan pada lingkungan uji sebelum publikasi.

## Kecocokan dengan proyek materi

| Kebutuhan | Bukti di kode LMS | Keputusan |
|---|---|---|
| Akun, peran dan kelas | Middleware peran, policy, relasi rombel/guru | Gunakan kembali; uji pembatasan akses antar kelas |
| Fase dan kelas modul | ModuleService menyimpan phase dan grade | Dapat dipetakan; pengelompokan ATP dan 53 ID modul perlu pemetaan tetap |
| Urutan materi | LearningSequence mengatur pembukaan submateri | Perlu adaptasi aturan selesai per jenis tahap |
| Konten HTML/CSS/JS yang sudah dibuat | Editor submateri Markdown; renderer memakai html_input=strip | Menempelkan HTML tidak mempertahankan simulasi/game. Buat renderer paket modul tepercaya yang dipasang pengembang, terpisah dari konten editor |
| Game dan simulasi khusus | InteractiveDefinition memakai template dan skenario tertentu | Belum ada kontrak yang terlihat untuk menjalankan dan menyimpan semua model game/simulasi proyek ini |
| Progres | ProgressService menyimpan persentase berbobot, completed_items dan required_items | Tentukan satu definisi progres dan cocokkan dengan tahap lulus proyek materi |
| Nilai | quiz_score adalah rata-rata nilai terbaik kuis; practice_score terpisah | Jangan beri label nilai akhir jika sebenarnya rata-rata kuis. Tambahkan hasil evaluasi akhir secara jelas |
| Jurnal dan bukti | Tersedia pengumpulan/penilaian praktik dan event interaktif | Perlu pemetaan jurnal/refleksi lokal; jangan menghidupkan kembali praktik terbimbing tambahan yang telah dibatalkan |
| Sertifikat TJKT | Tidak ditemukan mekanisme sertifikat pada pencarian app, routes dan views | Perlu integrasi khusus, termasuk kelayakan dan cetak ulang |
| Progres lokal lama | Sistem server memakai record akun/aktivitas | Perlu impor dengan konfirmasi pemilik dan label sumber, bukan otomatis dianggap bukti server |

LearningSequence::states menetapkan submateri wajib belum selesai jika tidak memiliki aktivitas checkpoint wajib, meskipun aktivitas game/lab lainnya selesai. Ini ketidakcocokan aturan, bukan bukti semua materi produksi saat ini macet: contoh yang ada mungkin telah memiliki checkpoint. Untuk materi baru, satu tahap harus bisa selesai berdasarkan aktivitas yang memang relevan, tanpa menambahkan soal hanya demi memenuhi struktur LMS.

ProgressService dapat menghitung ulang progres ketika submateri berubah. Karena itu, integrasi dan penerbitan revisi perlu kebijakan versi agar siswa yang sudah lulus tidak tiba-tiba kehilangan status kelulusan. Jangan menjalankan impor langsung ke data produksi sebelum pemetaan dan uji migrasi selesai.

## Sumber kerumitan yang terlihat

Layout utama menampilkan 8 tautan bagi guru dan 13 bagi admin, termasuk keamanan akun. Guru harus memilih antara Verifikasi pencapaian, Penilaian praktik, Analitik pembelajaran, serta Monitoring & laporan untuk kebutuhan yang saling berdekatan.

Halaman monitoring menampilkan 8 kolom filter sekaligus: pencarian siswa, tahun ajaran, semester, rombel, modul, status, tanggal awal dan tanggal akhir. Ekspor terbagi menjadi empat aksi: rekap utama, aktivitas, riwayat kuis, serta lab/game.

Dashboard menambahkan banner besar, statistik umum, ringkasan progres, aktivitas belajar, progres per rombel, serta riwayat keamanan akun. Riwayat keamanan bersaing dengan informasi pembelajaran pada halaman kerja guru.

Formulir submateri meminta jenis, urutan, status publikasi, kewajiban dan bobot progres. Terdapat teks bantuan yang masih menyebut engine interaktif akan hadir dan engine progres fase berikutnya, padahal layanan tersebut sudah ada. Ini membuat instruksi produk tidak konsisten.

## Rancangan antarmuka yang disarankan

### Guru: tiga tujuan utama

1. Beranda: ringkasan kelas, siswa yang perlu dibantu, hasil yang menunggu penilaian, dan pintasan melanjutkan pemantauan. Tidak menampilkan banner besar atau riwayat login.
2. Progres & Nilai: pilih kelas lalu modul; tabel siswa memuat progres, evaluasi akhir, status dan aktivitas terakhir. Detail siswa menampung nilai tahap, hasil game/simulasi yang tercatat, jurnal, bukti, dan penilaian guru.
3. Materi: katalog per fase/kelas, pratinjau sebagai guru, dan penugasan ke kelas. Pengaturan penyuntingan hanya ditampilkan bagi yang berhak dan saat dibutuhkan.

Gabungkan verifikasi dan penilaian pada detail hasil terkait. Analitik menjadi ringkasan pada halaman Progres & Nilai, bukan menu terpisah. Bank soal ditempatkan di dalam penyuntingan evaluasi. Sediakan satu tombol Unduh rekap; pilihan tambahan hanya muncul ketika dibuka.

Default periode adalah periode aktif; jika guru hanya memiliki satu kelas, pilih otomatis. Filter awal cukup Kelas dan Modul, ditambah pencarian nama jika perlu. Tahun/semester arsip, rentang tanggal dan pilihan lain berada dalam Filter lainnya yang tertutup. Hindari tahun dan semester berulang jika kelas yang dipilih sudah menentukan periodenya. Gunakan label Belum ada nilai untuk nilai kosong; nol tetap ditampilkan sebagai nol.

### Admin: empat tujuan utama

1. Beranda: akun/kelas yang perlu ditangani dan masalah operasional yang dapat ditindaklanjuti.
2. Pengguna: tab Siswa dan Guru; impor serta reset password ditempatkan pada daftar terkait.
3. Kelas: rombel, penugasan guru dan anggota; rayon menjadi data tambahan di dalam pengelolaan data sekolah, bukan menu utama.
4. Materi: katalog dan publikasi. Pemantauan pembelajaran lintas kelas dapat diakses dari ringkasan beranda/kelas jika diperlukan.

Keamanan akun ditempatkan pada menu profil. Riwayat audit dan pengaturan teknis tersedia sebagai utilitas admin yang dibuka saat perlu. Penyederhanaan tidak menghapus audit, pembatasan akses, atau catatan hasil yang sudah ada. Jangan menggabungkan izin admin dan guru hanya karena menunya dibuat lebih pendek.

## Pola integrasi

Pertahankan backend akun, kelas dan record hasil. Sajikan paket materi tepercaya melalui renderer khusus yang mempertahankan CSS/JS dan interaksi tiap materi. Tentukan satu navigasi tahap agar siswa tidak menghadapi sidebar LMS dan navigator modul yang bersaing atau dua aturan pembukaan tahap yang berbeda.

Jembatan aktivitas harus memetakan ID modul/tahap tetap ke aktivitas LMS dan mengirim record percobaan melalui endpoint yang memeriksa akun, akses kelas, versi dan aturan kelulusan. Jangan menerima hasil dari modul lain hanya berdasarkan ID yang dikirim klien. Jangan mengaktifkan HTML/JavaScript mentah untuk semua input editor demi menjalankan paket materi.

Jika penilaian masih dihitung klien, tandai sebagai hasil aktivitas yang dilaporkan browser. Autentikasi dan validasi format tidak membuktikan skor benar. Penilaian resmi memerlukan pemeriksaan server atau verifikasi guru sesuai jenis aktivitas.

## Urutan pelaksanaan

1. Siapkan salinan LMS dan database uji terpisah; jangan menjalankan fixture/seeder/test terhadap database produksi.
2. Sederhanakan navigasi, beranda dan monitoring dalam salinan tersebut, sambil mempertahankan aturan akses.
3. Integrasikan satu modul umum dan satu modul lama sebagai percontohan, tanpa mengganti dua contoh materi yang sudah ada.
4. Buktikan alur siswa login → tahap berurutan → simulasi/game → evaluasi → sertifikat; guru melihat progres/nilai/hasil yang sama.
5. Uji lintas akun/kelas, nilai belum lulus, pengulangan, koneksi terputus, pengiriman ganda, versi materi, impor data lama dan cetak ulang.
6. Setelah percontohan sesuai, petakan dan integrasikan seluruh 53 modul; publikasi produksi dilakukan setelah hasil tinjauan konkret tersedia.

## Berkas sumber audit utama

- resources/views/layouts/app.blade.php
- resources/views/dashboard.blade.php
- resources/views/assessment/_dashboard.blade.php
- resources/views/assessment/reports/index.blade.php
- resources/views/learning/manage/section.blade.php
- resources/views/learning/_content.blade.php
- app/Services/ModuleService.php
- app/Services/LearningSequence.php
- app/Services/ProgressService.php
- app/Services/InteractiveDefinition.php
- app/Policies/ModulePolicy.php
- routes/web.php
