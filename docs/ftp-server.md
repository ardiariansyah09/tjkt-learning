# FTP Server dan Pengujian Transfer Berkas — Fase F kelas XI

Modul inti Administrasi Sistem Jaringan mengikuti DHCP, DNS, dan Remote Server. Kategori, peran, urutan, prasyarat dan JP ATP dipertahankan. Halaman `modules/administrasi-server/ftp-server/`; sumber `assets/js/course-ftp.js`; metadata `data/ftp-server.json`.

## Materi dan struktur

Dua belas tahap mengikuti kerangka bersama: orientasi; protokol FTP/FTPS/SFTP; kontrol/data aktif-pasif; akun/path/policy/permission; konfigurasi vsftpd dan uji klien; representasi/parsial/integritas; diagnosis/pemulihan; proyek; lab; game; refleksi; evaluasi. Ada contoh, tugas transfer, miskonsepsi, cek konsep, rubrik proyek dan referensi primer RFC 959/4217, Ubuntu serta Microsoft.

Materi membedakan FTPS explicit dari SFTP, TLS kontrol dari PROT P data, sertifikat FTPS dari host key SSH, login dari kanal data, policy daemon dari filesystem, respons protokol dari kesesuaian byte. Fragmen vsftpd diberi konteks versi, sertifikat/key, akun/path, chroot, listener dan firewall, bukan konfigurasi produksi lengkap. Private key dan credential nyata tidak disimpan di situs. FTP biasa hanya untuk demonstrasi lab terisolasi; alternatif transfer aman dibahas sesuai kebutuhan.

## Laboratorium

Sumber tetap enam byte `[0,255,10,13,65,66]`; state file server/unduhan ditampilkan agar hasil dapat diperiksa. Alur Hubungkan kontrol → Login → LIST/STOR/RETR → Verifikasi. FTPS explicit default, kontrol TCP 21 dan data pasif port 50000; mode aktif memakai koneksi server menuju port klien 51000 sebagai angka dataset. Sertifikat tepercaya, jalur kontrol, credential, mode/alamat/port data, permission, policy, kapasitas, representasi dan interupsi dapat divariasikan.

Setiap edit menutup sesi model, membatalkan bukti serta snapshot transfer terbaru; berkas tersimpan tetap ada. Hubungkan/Login harus diulang. Ini aturan model yang dinyatakan, bukan sifat semua klien FTP. Data pasif terhalang tidak menghapus login yang sudah berhasil. Respons representatif 425/530/550/552/426/226 disertai alasan serta jejak tahap, bukan dianggap seluruh daemon menghasilkan kode identik.

Binary mempertahankan byte. ASCII ilustratif mengganti LF menjadi CRLF sehingga enam byte dapat menjadi tujuh meskipun operasi selesai 226; model tidak meniru seluruh konversi platform. Putus transfer menyimpan separuh hasil dan 426. Kapasitas per file model 4/16 byte; kegagalan kapasitas mempertahankan file lama pada penyederhanaan ini. PROT P diwajibkan kebijakan FTPS model. Hasil hanya ditandai data terlindungi ketika operasi data terlindungi benar-benar berlangsung pada model, bukan sekadar pilihan konfigurasi.

Verifikasi membandingkan setiap byte dan panjang terhadap snapshot sumber transfer itu; bukan hash kriptografis. Unduh yang cocok dengan server tidak otomatis membuktikan kesamaan terhadap sumber awal jika upload sudah salah. Materi meminta manifest sumber dan hash seperti SHA-256 pada praktik VM sebenarnya. Tiga eksperimen dicatat melalui jurnal bersama. Reset menghapus file/sesi model, bukan jurnal/progres belajar.

Tidak ada transfer file pengguna, socket, FTP/TLS, login, credential, chroot, NAT/ALG penuh, resume, filesystem atau server nyata yang dijalankan. Praktik instalasi, konfigurasi produk dan hash aktual tetap dinilai pada VM berizin.

## Transfer Dock

Game antrean dua slot dengan beberapa file, urutan blok, pengiriman batch, verifikasi dan reset per file. Pemain boleh mencampur file dalam satu batch tetapi urutan dalam setiap file harus tepat. Setiap enqueue, kirim, verifikasi dan reset file memakan tindakan. Tidak ada soal pilihan ganda. Klik/Tab/Enter tersedia untuk semua tombol; status antrean, sumber dan hasil terlihat.

Level 1 dua file masing-masing dua blok; level 2 dua file dengan satu byte rusak pada file pertama; level 3 tiga file dengan gangguan pada file kedua. Gangguan sekali per misi, sehingga file rusak dapat direset dan diulang tanpa mengulang file sehat. Reset level mengembalikan seluruh file/gangguan/budget, reset file hanya membersihkan file terkait. Kegagalan budget, ulang level/permainan dan skor 100 setelah tiga misi tersedia. Solusi uji memakai 8, 17 dan 21 tindakan dari budget 12, 18 dan 24. Blok game bukan model paket TCP atau format FTP nyata.

## Pemeriksaan

`tools/ftp-checks.js` memeriksa prasyarat sesi, baseline binary upload/download, data pasif/aktif, PASV address, PROT P, permission/policy, kapasitas, ASCII/integritas, transfer parsial/retry, autentikasi, sertifikat, kontrol, antrean penuh, urutan salah, solusi tiga misi dan kegagalan budget. Pemeriksaan terdaftar pada harness topik serta game bersama. Evaluasi sepuluh soal memakai ambang 80 dan sertifikat bersama; skor otomatis tidak menggantikan penilaian praktik/proyek.

Hasil 26 Oktober 2026: validasi statis 39 modul serta ATP lolos. Browser menguji FTP dan DHCP/DNS/Remote, masing-masing 12 tahap pada desktop/ponsel dan tema terang/gelap, tanpa error dan style parity benar. Alur baru FTP menuntaskan 12 tahap melalui kontrol aktual hingga sertifikat, PDF satu halaman, cetak ulang setelah reload serta penolakan sertifikat ketika nilai akhir di bawah ambang. Katalog kini 39 terbit dan 14 belum dibuat. Belum dilakukan deployment.
