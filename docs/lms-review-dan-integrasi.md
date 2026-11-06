# Perubahan LMS dan integrasi materi

Status 28 Oktober 2026: perubahan sudah diterapkan ke aplikasi produksi `/var/www/tjkt-learning` dan diperiksa melalui alamat HTTPS LMS. Salinan pengembangan berada dalam `lms/` pada workspace dan `/home/adminnazh/tjkt-lms-review-20261028` di server.

Pembaruan tampilan: seluruh modul kini menggunakan layout halaman LMS native, dengan daftar tahap pada sidebar aplikasi dan rute `/materi/{id}/belajar`. Header portal dan nama TJKT Learning Hub tidak lagi ditampilkan. Lihat [pemeriksaan halaman native LMS](halaman-belajar-native-lms.md).

Audit pembelajaran berikutnya sudah selesai: 53 modul / 606 tahap diuji dari progres kosong melalui kontrol asesmen, simulasi dan game hingga cetak sertifikat. Koreksi cakupan evaluasi tiga modul sudah aktif tanpa mengubah record progres lama. Rincian dan batas pemeriksaan ada di [audit pembelajaran](audit-pembelajaran-2026-10-28.md).

Pembaruan berikutnya, 28 Oktober 2026: seluruh 53 modul sudah terbit dan ditugaskan ke 10 kelas aktif sesuai tingkatnya. Dua materi lama dihapus dari katalog melalui penghapusan lunak; satu catatan progres lama tetap disimpan. Akun contoh tidak disalin ke produksi. Akses materi prasyarat lintas kelas ikut ditugaskan tanpa memberikan nilai atau kelulusan otomatis.

Seluruh isi materi sekarang tersimpan dan dilayani dari database: 53 definisi modul, 53 halaman modul, dan total 326 aset HTML/JavaScript/CSS/JSON/gambar, sebanyak 3.980.444 byte sebelum pengodean penyimpanan. Tabel `learning_package_definitions` menyimpan definisi versi; `learning_package_assets` menyimpan isi aset beserta hash SHA-256. Aset biner dikodekan base64 dan didekodekan kembali saat dilayani. Berkas rilis pada disk tetap menjadi sumber impor/cadangan, bukan satu-satunya tempat penyimpanan isi.

Backup sebelum publikasi dan penghapusan materi lama: `/home/adminnazh/tjkt-lms-backups/publication-20261028-024412`. Pemeriksaan produksi memastikan 53 modul terbit, 606 tahap, seluruh isi database utuh, tidak ada prasyarat yang tidak ditugaskan, dan login HTTPS HTTP 200.

Backup sebelum aktivasi tersimpan privat di server pada `/home/adminnazh/tjkt-lms-backups/20261028-022730`, berisi database, kode yang berubah dan manifest rilis. Kredensial aplikasi tidak diubah. Konfigurasi Nginx dan layanan PHP produksi tidak diganti.

## Hasil pemeriksaan

- PHP 8.3 dan database khusus pengujian pada instance MySQL/MariaDB port 3307: 160 tes, 1.889 assertions, seluruhnya lulus. Pemeriksaan terfokus penyimpanan database dan integrasi paket juga lulus, 12 tes dan 188 assertions.
- Browser: 53 pratinjau guru, 606 tahap; pemulihan progres dan formulir sertifikat untuk 53 modul. Nilai fixture digunakan untuk memeriksa integrasi, bukan pengulangan seluruh asesmen.
- Tiga PDF contoh diperiksa satu halaman.
- Browser tambahan: antrean offline, pemulihan setelah terhubung, konflik dua perangkat, cadangan hasil yang konflik, pengambilan data server secara eksplisit, data lokal lama tetap utuh, sesi berakhir, dan pemisahan akun.
- Kendali game yang benar-benar dijalankan: 16 mekanisme, 48 level, termasuk seret objek.
- Tampilan akhir guru/admin diperiksa pada desktop 1366 px dan ponsel 390 px.
- Aktivasi awal memeriksa seluruh hash berkas rilis dan memastikan akun contoh tidak disalin. Publikasi berikutnya memeriksa 53 modul aktif, nol materi lama dalam katalog, keutuhan 326 aset database, dan akses prasyarat pada seluruh kelas aktif.
- Penyimpanan database diuji dengan aset yang tidak memiliki berkas sumber pada disk. Pemeriksaan browser tambahan membuka 53 halaman terautentikasi dan memasang enam varian mesin modul dari isi database tanpa error runtime.

Laporan berada di [folder hasil pemeriksaan](lms-review/). Pratinjau: [beranda guru](lms-review/guru-beranda-1366.png), [beranda admin](lms-review/admin-beranda-1366.png), [monitoring ponsel](lms-review/guru-monitoring-390.png), [penugasan materi kelas](lms-review/guru-materi-kelas-1366.png).

## Tampilan yang disederhanakan

- Guru: Beranda, Progres & Nilai, Materi.
- Admin: Beranda, Pengguna, Kelas, Materi.
- Siswa: Beranda, Progres & Nilai, Materi.
- Pengguna menggabungkan tab siswa/guru. Impor tetap berada di daftar terkait.
- Pengaturan akun pindah ke tombol profil; audit dan rayon tetap tersedia melalui Administrasi tambahan.
- Monitoring menonjolkan kelas, modul, dan pencarian siswa. Filter periode/arsip/status/tanggal serta variasi unduhan dibuka saat diperlukan.
- Banner besar dan riwayat keamanan tidak lagi memenuhi beranda. Penilaian praktik dan tindakan verifikasi tersedia melalui konteks hasil.
- Paket materi cukup diatur kelas penerima dan publikasinya; guru tidak harus mengatur bobot atau menyusun ulang setiap tahap.

## Integrasi materi

Manifest di `lms/storage/app/learning-pack/manifest.json` dipetakan dari DOM modul yang benar-benar diinisialisasi browser: 53 modul, 606 tahap. Aset sumber disalin sebagai paket tepercaya di direktori penyimpanan aplikasi, tidak dimasukkan sebagai HTML mentah ke editor Markdown.

Rute paket memeriksa akun, status aktif, peran, penugasan kelas, dan prasyarat. Satu navigator materi dipakai selama belajar; tombol kembali menuju katalog LMS. Pratinjau guru membuka semua tahap tanpa mengirim hasil siswa. Mode instruktur lokal tidak otomatis berlaku bagi siswa yang belajar melalui LMS.

Impor CLI `php artisan learning:import-packages --author=ID_ADMIN` mendaftarkan paket sebagai draft, tidak mengganti dua contoh materi lama atau menugaskan kelas otomatis. Fase E/F, kelas, urutan tahap dan prasyarat mengikuti manifest. Publikasi dan penugasan dilakukan melalui Materi → Atur kelas. Paket yang sudah memiliki progres tidak boleh diperbarui versinya diam-diam; gunakan rilis/siklus yang ditinjau terlebih dahulu.

## Hasil dan penyimpanan

Snapshot dipisahkan per akun, modul dan versi. `module_progress` menyimpan jumlah tahap lulus dan nilai evaluasi akhir dalam kolom terpisah dari rata-rata kuis. Halaman hasil siswa menampilkan nilai tiap tahap, ambang, kelulusan, jurnal, jumlah catatan percobaan, sumber data dan waktu sinkronisasi.

Antrean lokal tetap tersedia saat koneksi terganggu. Hasil yang gagal terkirim tidak langsung dibuang. Konflik antar perangkat menampilkan instruksi mengunduh cadangan dan mengambil hasil server secara eksplisit. Pengiriman ulang payload yang sama tidak membuat duplikat. Pergantian akun tidak memindahkan antrean akun sebelumnya ke akun berikutnya.

Cadangan lama dapat diekspor dari `export-progres.html` yang perlu dipasang pada alamat website lama. Pengguna harus memakai browser/profil yang menyimpan hasil tersebut. Impor ke LMS memerlukan konfirmasi pemilik dan ditandai sebagai data lama; hasil yang sudah ada pada akun tidak ditimpa otomatis. Website baru tidak dapat membaca localStorage milik domain GitHub lama secara langsung.

Nilai masih dihitung oleh aktivitas browser. Validasi server memeriksa akses, versi, bentuk data dan aturan progres, bukan membuktikan keaslian jawaban/aksi siswa. Dashboard menandai hasil sebagai laporan aktivitas browser. Penilaian resmi tetap membutuhkan validasi server khusus atau penilaian guru. Belum ada pengubahan seluruh permainan menjadi engine penilaian server.

Kelayakan sertifikat mengikuti semua tahap dan ambangnya; desain/cetak ulang memakai komponen TJKT yang ada. Status ini bukan bukti bahwa siswa telah menyimpan PDF atau mencetak kertas. Belum ada nomor sertifikat bertanda tangan digital atau verifikasi daring publik.

## Lingkungan review

Review memakai SQLite terpisah dari database produksi, kelas contoh, dan akun contoh. Ekstensi database serta browser QA berada di direktori runtime review; paket PHP/Nginx sistem tidak diubah. SQLite dipakai untuk pengujian terisolasi; produksi tetap memakai konfigurasi database yang sudah ada.

Kredensial contoh dihasilkan acak dan disimpan privat pada server dalam `review-access.json`. Kredensial tidak dimasukkan ke workspace, repositori, atau paket publikasi. Pengujian browser membaca berkas ini langsung di server.

Untuk membuka review dari komputer instruktur, jalankan terowongan SSH pada terminal sendiri:

```sh
ssh -N -L 18087:127.0.0.1:18087 adminnazh@172.16.10.6
```

Buka `http://127.0.0.1:18087`. Akun contoh memakai username `review.guru`, `review.admin`, dan `review.siswa`. Password dapat dilihat oleh pemilik server pada berkas privat `review-access.json`; jangan menyalin berkas tersebut ke direktori publik. Hasil akun contoh berasal dari fixture pengujian, bukan hasil siswa sungguhan.

## Publikasi produksi

Paket perubahan disiapkan terpisah dengan manifest hash sebelum/sesudah. Sebelum aktivasi: tinjau hasil, pastikan kode produksi belum berubah, buat backup kode dan database di server, jalankan migrasi tambahan, pasang paket materi, lalu impor sebagai draft. Konfigurasi `.env`, data siswa, vendor, dan database review tidak disalin ke produksi. Pengujian dan akun contoh tidak ikut diterbitkan.

Migrasi tambahan bersifat menambahkan kolom/tabel. Jika rollback kode diperlukan, pertahankan tabel hasil baru agar data belajar tidak ikut terhapus. Jangan menjalankan migrate:fresh, seeder review, atau tes terhadap database produksi.

Pemeriksaan migrasi dan seluruh tes fitur juga sudah lulus pada database MySQL/MariaDB pengujian dengan PHP 8.3 sebelum aktivasi. Instance aplikasi memakai port 3307; perintah mysql tanpa port sebelumnya mengarah ke instance berbeda. Tidak perlu memberikan izin baru pada instance port 3306.

Skrip `prepare-lms-ui.cjs`, `wire-lms-packages.cjs`, dan `finish-lms-ui.cjs` merupakan transformasi awal yang sudah dijalankan; jangan digunakan untuk menimpa hasil akhir. Perubahan berikutnya dilakukan langsung pada berkas LMS. `build-lms-package.cjs` digunakan untuk membangun ulang paket dari materi sumber yang telah ditinjau.
