# Administrasi Linux dan Windows Server — Fase F kelas XI

Modul pendukung Administrasi Sistem Jaringan, sesudah Virtualisasi Server Dasar. Kategori, urutan, prasyarat dan JP ATP dipertahankan. Halaman `modules/administrasi-server/administrasi-linux-windows/`; sumber `assets/js/course-os-admin.js`; metadata `data/administrasi-linux-windows.json`.

Dua belas tahap mengikuti kerangka bersama: orientasi, enam konsep, proyek, laboratorium, game, refleksi dan evaluasi. Enam konsep membahas rencana instalasi; shell/identitas/izin; jaringan persisten; disk/partisi/filesystem/volume; paket/role/service; pembaruan/log/penerimaan. Ada contoh, tugas transfer, miskonsepsi, cek pemahaman dan rubrik proyek. Evaluasi akhir 10 soal ambang 80; praktik VM dan kualitas proyek tetap memerlukan penilaian manusia.

Rujukan primer Ubuntu dan Microsoft tersedia di bagian Referensi. Contoh Ubuntu tidak digeneralisasi ke semua distribusi; Server Core dibedakan dari Desktop Experience; APT, role Windows, Windows Update dan nama service tidak dipertukarkan. Instruksi disk nyata meminta identifikasi target dan backup. Situs tidak menerima atau mengeksekusi perintah shell.

## Laboratorium

Dua platform alternatif, dimulai pada VM kosong model. Alur media → OS → filesystem data → akses volume → persistensi → jaringan → sumber paket/role → pemasangan → start/startup. Diagram menunjukkan tiap keadaan; log operasi menampilkan keberhasilan/kegagalan dan sebabnya. Tombol variasi DNS salah memungkinkan eksperimen pembeda.

Volume sekarang berbeda dari volume sesudah boot; active berbeda dari startup otomatis. Instalasi paket sengaja tidak autostart dalam model; perilaku installer nyata bisa berbeda. Persistensi Windows sengaja eksplisit pada model, tidak mengklaim Windows memakai fstab atau memerlukan langkah Linux. Pembaruan sintetis versi 1 ke 2 memerlukan backup config dan reboot; tidak mengklaim semua patch nyata perlu reboot. Sumber Windows hanya abstraksi sumber role, bukan APT di Windows.

Patch terpasang ditandai pending sampai reboot. Transaksi klien memeriksa OS, volume, jaringan dan proses. Asumsi listener/firewall/akun siap dinyatakan; tidak ada layanan HTTP, installer, filesystem, jaringan atau repository nyata. Cadangan hanya config model, bukan OS/data lengkap. Reset/pergantian platform mengembalikan sesi; jurnal dan progres belajar tetap tersimpan. Setiap hasil dapat dicatat melalui jurnal bersama, dengan tiga percobaan dan refleksi berbasis bukti.

## Deployment Relay

Game strategi dua server dan satu anggaran tindakan, tanpa soal pilihan ganda. Pemain memilih kartu Linux/Windows dan mengerjakan dependensi, merencanakan persistensi serta jendela reboot, lalu menguji dan menyerahkan bukti setiap server. Pemilihan kartu gratis; operasi, termasuk yang gagal, memakai tindakan. Bukti sesudah boot harus masih relevan; perubahan membatalkan bukti. Level berikutnya terbuka setelah kedua server lolos.

Level 1 deployment kosong target versi 1, budget 28. Level 2 deployment kosong disertai backup/patch target versi 2, budget 32. Level 3 rekonstruksi volume/persistensi pada OS dan filesystem yang sudah siap, target versi 2, budget 26. Solusi memakai 26, 30 dan 24 tindakan. Anggaran memberi konsekuensi pada pengulangan yang tidak diperlukan. Ada gagal, ulang level, ulang permainan dan kendali klik/Tab/Enter. Skor 100 hanya disimpan setelah ketiga level selesai. Game hanya di tahap game.

## Pemeriksaan

`tools/os-admin-checks.js` menguji prasyarat, penolakan format ulang, volume/layanan sebelum–sesudah boot, DNS/repository, backup, versi pending/berjalan, kedaluwarsa bukti boot, solusi tiga level, kegagalan budget dan kontrol UI dua platform. Pemeriksaan terdaftar pada harness topik/game bersama. Laporan browser focused dan completion focused mencatat hasil pengujian aktual terbaru; cakupan audit lengkap historis tetap terpisah.

Hasil 26 Oktober 2026: validasi statis 36 modul dan ATP lolos. Browser menguji modul ini serta Virtualisasi Server Dasar, masing-masing 12 tahap pada desktop 1280×900 dan ponsel 390×844, terang/gelap, tanpa error; style parity benar. Alur baru modul ini menuntaskan 12 tahap secara berurutan melalui kontrol aktual, skor akhir 100, sertifikat desain `tjkt-circuit-v3` dengan logo, PDF satu halaman, cetak ulang setelah reload, serta penolakan sertifikat pada nilai akhir di bawah 80. Katalog kini 36 terbit dan 17 belum dibuat. Tidak ada deployment dilakukan.
