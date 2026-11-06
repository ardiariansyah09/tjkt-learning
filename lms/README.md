# Salinan sumber LMS TJKT

Direktori ini adalah salinan pengembangan Laravel dari server, beserta penyederhanaan antarmuka dan adaptor 53 modul interaktif. Website statis di root workspace tetap terpisah dan tidak diubah menjadi aplikasi PHP.

Perubahan sudah aktif pada `/var/www/tjkt-learning` di server `172.16.10.6`: 53 modul terbit untuk 10 kelas aktif, isi paket dan hasil belajar tersimpan di database. Dua materi lama dihapus dari katalog dengan riwayat tetap disimpan. Konfigurasi `.env`, kredensial, vendor dan database produksi tidak disalin ke workspace ini. Laravel memerlukan PHP minimal 8.3; PHP XAMPP lokal yang lebih lama tidak dapat menjalankan LMS ini.

Paket materi dibangun dari root workspace dengan `node tools/build-lms-package.cjs`. Definisi versi dan aset rilis disimpan terpisah sehingga rilis baru tidak menimpa aset yang dipakai versi lama. Importir menolak penggantian versi diam-diam. Paket baru didaftarkan dengan `php artisan learning:import-packages --author=ID_ADMIN`; `php artisan learning:store-packages` menyimpan seluruh definisi dan isi aset ke database. Publikasi/penugasan berikutnya dapat dilakukan melalui antarmuka admin. Versi terdaftar pada database dilayani dari database; fallback berkas hanya untuk pratinjau yang belum diimpor.

Lihat [catatan perubahan, pengujian dan aktivasi](../docs/lms-review-dan-integrasi.md). Skrip dalam `scripts/` untuk review memakai path dan database uji khusus; jangan menjalankan seed/reset review pada aplikasi produksi. Kredensial akun contoh tetap berada di direktori review privat pada server.

Halaman belajar memakai `learning.package-lesson` di dalam `layouts.app`, bukan halaman HTML terpisah. Navigasi tahap menyatu dengan sidebar LMS. Penyesuaian antarmuka dan sinkronisasi native ada di `public/assets/lms-course.css` serta `lms-course-bridge.js`; lihat [catatan integrasi tampilan](../docs/halaman-belajar-native-lms.md).
