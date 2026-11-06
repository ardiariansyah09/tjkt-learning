# Tema TJKT dari sertifikat

Portal dan modul memakai `assets/css/certificate-brand.css` serta logo lokal
`assets/images/tjkt-wikrama-logo.png`. Path relatif mendukung GitHub Pages
di subdirektori dan hosting lokal tanpa URL/IP yang ditanam dalam tema.

LMS menggunakan logo salinan di `lms/public/assets/images/` dan helper Laravel
`asset()` pada layout login, dashboard, serta pratinjau siswa. Pastikan konfigurasi
APP_URL server tetap sesuai alamat instalasinya.

Untuk mengunggah, sertakan HTML modul/portal, CSS baru, logo, dan perubahan layout
serta certificate-brand.css LMS. GitHub Pages hanya menjalankan portal statis; LMS membutuhkan PHP.

Paket materi LMS dalam `lms/storage/app/learning-pack/releases/` sengaja tidak
ditimpa karena merupakan versi konten tersimpan. Tampilan modul di dalam LMS
versi lama memerlukan rilis konten baru melalui mekanisme pembaruan kompatibel yang sudah ada.
Jangan mengganti manifest atau menghapus rilis lama hanya untuk memperbarui warna.

Pada 6 November 2026, tema diaktifkan melalui SSH di `/var/www/tjkt-learning`
pada server 172.16.10.6. Server memakai NativeLessonRenderer, sehingga CSS khusus
`lms/public/assets/certificate-brand.css` dapat menata materi native tanpa revisi
konten database. Tiga layout server dipatch langsung untuk mempertahankan perubahan
server lainnya. Tidak ada penulisan database, perubahan soal, atau kunci progres.

Validasi: login, CSS, dan logo HTTP 200; seluruh 56 materi native berhasil dirender;
versi penilaian 56 modul tetap sama. Pemeriksaan dilakukan lewat HTTP dan renderer,
tanpa masuk ke akun siswa. Cadangan file dan daftar pemulihan berada di
`/home/adminnazh/tjkt-lms-backups/certificate-brand-20261106-122853`.

Skrip: `tools/deploy-certificate-brand.php` dan `tools/verify-certificate-brand.php`.
Setelah mengganti Blade, gunakan `view:clear` agar PHP-FPM membuat cache sebagai
pengguna web server. GitHub belum diunggah pada pekerjaan ini.
