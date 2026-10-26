# Desain sertifikat TJKT

Renderer bersama: assets/js/tjkt-certificate.js dan assets/css/tjkt-certificate.css, versi desain tjkt-circuit-v3.

Logo asli yang diberikan pengguna disalin utuh ke assets/images/tjkt-wikrama-logo.png. Logo ditempatkan di kepala kiri berdampingan dengan identitas platform dan sekolah, dengan ruang bebas serta rasio asli; tidak dipotong, diwarnai ulang, atau dijadikan stempel/tanda tangan. Penempatan ini merupakan keputusan tata letak, bukan klaim adanya pengesahan sertifikat resmi.

Palet mengikuti logo: navy #071c3d, biru #075a8c, sian #00b9e8, merah #ed1424, putih. Bingkai geometris dan garis sirkuit adalah SVG lokal agar tetap tercetak sebagai elemen grafis. Nama peserta menjadi fokus utama. Judul modul, tanggal penerbitan zona Asia/Jakarta, nilai posttest, dan atribusi pengembang tetap tersedia. Tidak ditambahkan tanda tangan, nomor verifikasi, atau jabatan yang tidak memiliki sumber.

Cetak memakai A4 mendatar satu halaman. Nama panjang menyesuaikan ukuran huruf dan dapat membungkus; judul modul panjang juga menyesuaikan. Fungsi cetak bersama menunggu logo dan font lokal siap. Keterangan sertifikat belajar mandiri dan tidak memverifikasi identitas tetap dipertahankan. Syarat kelulusan dan data progres tidak diubah.

Pratinjau interaktif: docs/pratinjau-sertifikat.html. Contoh gambar/PDF: docs/pratinjau-sertifikat.png dan docs/pratinjau-sertifikat.pdf. Data contoh bukan catatan capaian siswa.

Validasi desain: tools/validate-certificate-browser.ps1 menguji logo asli, waktu pemuatan sebelum cetak, A4, teks normal/panjang, tema gelap, pratinjau ponsel, serta PDF satu halaman. Hasil tercatat di docs/certificate-validation-browser.json.

Audit alur kelulusan berikutnya menyambungkan semua 28 modul terbit ke assets/js/module-certificate.js melalui module-shell.js. Panel bersama membaca catatan kelulusan masing-masing mesin tanpa mengubah progres siswa. Semua tahap wajib lulus dan posttest minimal 80 sebelum cetak tersedia. Pengujian dari progres kosong, cetak, PDF, dan cetak ulang dicatat di docs/completion-validation-browser.json; metode dan perbaikan ada di docs/validasi-kelulusan-sertifikat.md.
