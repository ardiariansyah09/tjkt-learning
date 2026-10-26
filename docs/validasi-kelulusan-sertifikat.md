# Audit kelulusan sampai cetak sertifikat

Audit mencakup seluruh modul berstatus `published` di `data/modules.json`. Modul rencana (`planned`) tidak dianggap sudah tersedia atau lulus.

Hasil audit 24 Oktober 2026: **28 modul, 306 tahap lulus dari progres kosong; 28 PDF satu halaman; 28 cetak ulang dari progres tersimpan; 28 penolakan cetak ketika skor akhir uji diturunkan di bawah 80.** Tidak ditemukan kegagalan pada putaran lengkap terakhir.

Regresi tambahan juga selesai: seluruh 306 tahap diperiksa pada desktop 1280×900, ponsel 390×844, dan tema terang/gelap. Kerangka tampilan konsisten, tanpa kesalahan browser, ID ganda, atau luapan halaman. Laporan: `docs/module-validation-browser.json`. Pengujian tata letak sertifikat pada empat mesin lama juga lulus untuk logo asli, A4 mendatar, teks normal/panjang, tema gelap, dan PDF satu halaman; lihat `docs/certificate-validation-browser.json`.

## Masalah dan perbaikan

- Dua puluh empat modul yang menggunakan navigasi bab bersama belum memiliki pintu sertifikat. Seluruh modul terbit sekarang memakai panel sertifikat bersama pada tahap akhir, dengan desain TJKT terbaru.
- Pada IPv4, event kelulusan game memperbarui nilai dan tombol lanjut tetapi belum memperbarui sidebar. Navigasi sekarang diperbarui segera tanpa membongkar permainan atau hasil posttest.
- Formulir penilaian Perangkat Jaringan sebelumnya memasukkan nama kelas sebagai teks. Kelas formulir telah diperbaiki.
- Sertifikat membaca seluruh nilai kelulusan dari kunci penyimpanan yang sudah dipakai setiap modul, termasuk format lama yang memisahkan status dan skor. Semua tahap harus lulus; posttest minimal 80. Nilai sertifikat adalah nilai posttest terbaik yang tersimpan. Progres siswa tidak dimigrasikan, dihapus, atau diluluskan otomatis.
- Jika belum memenuhi syarat, panel menampilkan tahap yang masih kurang beserta nilai minimum. Jika lulus, urutan tindakannya jelas: isi nama → Siapkan sertifikat → Cetak / Simpan PDF. Cetak menunggu logo dan font siap; pembatalan dialog tetap memungkinkan cetak ulang.

## Metode pengujian

`tools/validate-completion-browser.ps1` menjalankan Edge dengan profil sementara tersendiri. Pengosongan penyimpanan hanya dilakukan pada profil uji tersebut, bukan browser siswa/pengguna.

Setiap modul dimulai dari progres kosong. `tools/completion-checks.js` menekan kontrol jawaban, membangun koneksi pada praktik wajib, mengisi rancangan subnet/VLSM, menjalankan ping, menyelesaikan permainan, dan mengumpulkan posttest. Jawaban uji dibaca dari bank materi; skor kelulusan harus disimpan oleh mesin modul melalui interaksi tersebut. Pengujian memastikan tahap berikutnya terbuka sesudah tahap sebelumnya benar-benar lulus. Pengujian ini berbeda dari audit tampilan yang mengisi progres contoh untuk memeriksa semua halaman.

Setelah tahap terakhir, pengujian mengisi nama melalui formulir sertifikat, menunggu kesiapan logo, dan memastikan tombol cetak memanggil API cetak. Browser juga menghasilkan PDF dengan `Page.printToPDF`; jumlah halaman harus satu. Pengujian memuat ulang halaman dengan progres yang sama lalu menyiapkan dan mencetak ulang sertifikat terbaru.

Sebagai pengujian negatif terpisah sesudah alur nyata selesai, skor akhir profil uji sementara diturunkan menjadi 70. Formulir cetak dan kertas sertifikat harus menghilang. Catatan lulus yang semula kemudian dikembalikan. Manipulasi data ini hanya bagian pengujian penolakan, bukan cara meluluskan tahapan.

Hasil per modul: `docs/completion-validation-browser.json`. Laporan mencatat jumlah tahap, alur dari progres kosong, kesiapan logo, desain, PDF satu halaman, cetak ulang, dan penolakan nilai di bawah ambang. Pengujian memastikan keluaran browser/PDF; dialog printer fisik bergantung pada perangkat pengguna.

## Pemakaian setelah pembaruan

Siswa yang sudah lulus cukup membuka tahap akhir, mengisi nama, menyiapkan sertifikat, lalu mencetak. Tidak perlu menghapus atau mengulang progres. Jika browser masih memakai berkas lama, muat ulang paksa dengan Ctrl+F5. Progres tetap memakai penyimpanan browser pada alamat situs yang sama.
