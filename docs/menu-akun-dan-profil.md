# Menu akun dan profil

Sudah aktif pada LMS produksi, 28 Oktober 2026. Header sekarang memakai satu tombol akun berisi avatar/foto; Edit profil, Ganti password dan Keluar berada dalam dropdown. Nama panjang dipotong pada header dan tetap terbaca penuh dalam menu. Pada ponsel, identitas ditampilkan melalui avatar untuk menghemat ruang.

Profil dapat mengubah nama tampilan, email opsional, serta foto JPG/PNG/WebP. Foto dibatasi 2 MB dan 2.000 × 2.000 piksel, dipotong persegi dan dikodekan ulang ke JPEG 256 × 256 untuk membuang metadata. Foto tersimpan privat di tabel profile_photos dan hanya bisa dibaca pemilik akun melalui rute terautentikasi. Username, peran, NIS dan kelas tidak dapat diubah melalui formulir profil.

Halaman ganti password biasa memakai layout LMS. Pengguna yang wajib mengganti password awal tetap mengikuti alur pengamanan awal. Perubahan profil tidak mengubah ID akun, nilai, jurnal, atau kelulusan modul.

Pemeriksaan: 168 tes fitur / 1.988 assertions lulus pada database pengujian. Browser akun contoh admin, guru dan siswa menguji menu, edit nama/email, unggah foto, pergantian password dan pengembaliannya, keyboard, ponsel dan logout. Data akun produksi tidak digunakan untuk tes perubahan profil.

Setelah aktivasi, seluruh 53 halaman modul dirender kembali menggunakan layout LMS, 606 tahap dan 326 aset database diperiksa, 10 kelas memiliki akses prasyarat lengkap, login HTTPS memberi HTTP 200. Hash record progres, snapshot, penugasan dan definisi materi sama sebelum/sesudah aktivasi.

Backup: `/home/adminnazh/tjkt-lms-backups/account-profile-20261028-040206`.

Pratinjau menggunakan akun contoh: [desktop](lms-review/account-menu-1366.png), [ponsel](lms-review/account-menu-390.png). Laporan: [browser](lms-review/account-profile-browser.json), [aktivasi dan keutuhan data](lms-review/account-profile-activation.json), [tes fitur](lms-review/account-profile-feature-tests.xml).
