# Halaman belajar menyatu dengan LMS

Status 28 Oktober 2026: sudah diterapkan ke `/var/www/tjkt-learning` pada server `172.16.10.6`.

Seluruh 53 modul memakai halaman Blade `learning.package-lesson` yang mewarisi layout aplikasi `layouts.app`. Materi tidak lagi disajikan sebagai dokumen HTML mandiri atau iframe. Daftar tahap berada dalam sidebar LMS yang sama dengan menu Beranda, Progres & Nilai, dan Materi. Header akun, navigasi, tema, dan footer berasal dari LMS.

Alamat halaman belajar: `/materi/{id}/belajar`. Alamat paket lama `/paket/{id}/buka` dan alamat HTML paket sebelumnya diarahkan ke halaman native tersebut setelah pemeriksaan akses. Nama TJKT Learning Hub, header portal lama, dan tombol Kembali ke Portal tidak dirender ke halaman belajar. Tautan kembali menuju katalog Materi sesuai peran pengguna.

Isi materi dan aset tetap dibaca dari database. Renderer mengambil konten pembelajaran, daftar tahap, serta skrip aktivitas dari paket tepercaya; kerangka halaman lama tidak diterbitkan. CSS materi dibatasi pada area konten dan daftar tahap agar tidak mengubah tampilan menu, akun, atau komponen LMS. CSS sertifikat mempertahankan aturan cetak khusus agar dokumen tetap A4 satu halaman.

Tema terang/gelap mengikuti pengaturan LMS dan tetap berlaku saat berpindah halaman. Identitas akun menjadi nama awal pada formulir sertifikat. Pada ponsel, tombol Daftar tahap membuka sidebar LMS yang sama. Menu utama dan identitas LMS tetap terlihat ketika daftar tahap digulir.

Versi paket, ID tahap, kunci progres, endpoint hasil, dan record pembelajaran tidak diganti. Pemeriksaan sebelum/sesudah aktivasi memastikan hash record `package_snapshots`, `module_progress`, `module_assignments`, dan `learning_package_definitions` tetap sama. Tidak ada nilai kelulusan yang dibuat untuk siswa produksi selama pengujian.

## Bukti pemeriksaan

- Seluruh fitur: 162 tes, 1.911 assertions, lulus pada PHP 8.3 dan database pengujian MySQL/MariaDB.
- Browser guru: 53 modul / 606 tahap, tanpa header/merek portal, tanpa iframe, satu area main, sidebar LMS, tema bersama, dan navigasi ponsel.
- Browser siswa: progres yang telah ada tetap terbaca dan formulir sertifikat tersedia pada 53 modul yang sudah lulus dalam fixture pengujian. Ini pemeriksaan kompatibilitas progres, bukan pemberian nilai pada siswa produksi.
- Tiga contoh PDF tetap satu halaman setelah layout LMS diterapkan.
- Sinkronisasi offline, pemulihan koneksi, konflik perangkat, cadangan, sesi berakhir, dan pemisahan akun tetap lulus.
- Interaksi permainan: 16 mekanisme dan 48 level dijalankan menggunakan kontrol nyata di dalam area materi LMS.
- Produksi: 53 halaman dirender baca saja menggunakan layout native; tidak ditemukan merek portal, tombol kembali ke portal, atau iframe. Rute belajar baru dikenali dan tetap mewajibkan login.

Backup sebelum aktivasi: `/home/adminnazh/tjkt-lms-backups/native-lms-20261028-030916`.

Pratinjau menggunakan akun contoh: [desktop](lms-review/native-final-desktop.png), [ponsel](lms-review/native-final-mobile.png). Laporan: [browser](lms-review/native-lms-browser.json), [sinkronisasi](lms-review/native-browser-sync-checks.json), [game](lms-review/native-browser-games.json), [produksi](lms-review/native-lms-production.json), [keutuhan data](lms-review/native-lms-activation.json).

Kode antarmuka native berada di `lms/public/assets/lms-course.css` dan `lms-course-bridge.js`. Berkas HTML sumber pada proyek statis tetap merupakan sumber konten dan tidak menjadi halaman mandiri dalam LMS. Perubahan ini tidak menerbitkan ulang situs GitHub Pages.
