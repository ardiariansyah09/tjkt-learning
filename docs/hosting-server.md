# Web dan Database Server — Fase F kelas XI

Modul inti Administrasi Sistem Jaringan mengikuti DHCP, DNS, dan Remote Server. Kategori, peran inti, urutan, prasyarat dan JP ATP dipertahankan. Halaman `modules/administrasi-server/hosting-server/`; sumber `assets/js/course-web-db.js`; metadata `data/hosting-server.json`.

## Materi

Dua belas tahap memakai kerangka bersama: orientasi; arsitektur request; vhost/root/TLS; runtime/HTTP/log; database/schema/akun/query; transaksi/konsistensi/retry; backup/penerimaan; proyek; lab; game; refleksi; evaluasi. Tiap konsep mempunyai penjelasan, contoh, tugas transfer, miskonsepsi dan cek konsep. Proyek meminta diagram, config beranotasi, matriks uji, tiga eksperimen dan runbook perubahan/restore dengan rubrik manusia.

Referensi primer Ubuntu, Apache dan PHP. Fragmen Apache HTTP bukan konfigurasi HTTPS lengkap; prasyarat sertifikat/key, path, izin, aktivasi dan validasi dinyatakan. Contoh PDO mengasumsikan koneksi/config secret yang benar dan tidak dijalankan situs. Prepared statement dibedakan dari validasi/otorisasi dan placeholder identifier. Materi membahas batas transaksi terhadap engine, DDL implicit commit, isolation/concurrency serta retry/idempotency tanpa mengklaim semuanya disimulasikan.

Situs TJKT tetap statis tanpa database. Materi instalasi/konfigurasi nyata dikerjakan pada VM berizin; tidak ada backend/database, password, SQL evaluator atau request jaringan baru ditambahkan ke situs.

## Laboratorium

Satu virtual host portal.lab.test, halaman statis, GET status dan POST pinjaman Router lab. State awal stok 2 dan nol baris. Jalur model: DNS → listener → TLS/sertifikat → Host/vhost → document root → runtime → koneksi akun DB → schema/hak → operasi. Status HTTP representatif dipilih aplikasi model, bukan pemetaan wajib semua server. DNS/TCP/TLS gagal tidak diberi status HTTP semu.

Statis tidak bergantung runtime/DB. GET data memerlukan SELECT; POST memerlukan INSERT dan stok. Hak UPDATE stok dianggap tersedia. Setiap klik POST request baru tanpa idempotency key. Invariant skenario tanpa pengembalian: stok + jumlah pinjaman = 2. Suntikan gagal INSERT sesudah penurunan stok menghasilkan rollback state jika unit transaksi model aktif; tanpa unit tersebut stok telanjur berkurang. Ini snapshot state browser, bukan engine SQL atau locking nyata.

Backup/restore mencakup stok/baris model, bukan config, akun, schema atau OS. Restore perlu diikuti pembacaan/verifikasi. Edit config membatalkan bukti, tidak membatalkan data yang sudah berubah. Reset mengembalikan sesi/config/data/backup, bukan jurnal/progres belajar. Tiga percobaan dicatat melalui jurnal bersama.

## Transaction Foundry

Game token stok dengan dua pemohon. Tiap kartu mempunyai reserve, pending insert, commit, rollback dan pengembalian. Pemain harus memenuhi kedua pemohon dengan histori commit sehat, tidak ada pending/fault dan konservasi stok. Semua operasi/uji memakai satu tindakan. Tidak ada pertanyaan pilihan ganda; klik/Tab/Enter tersedia. State token dan pekerjaan ditampilkan pada HUD/kartu.

Level 1 stok 2 untuk dua pemohon. Level 2 stok 1, sehingga peminjaman pertama harus dikembalikan sebelum pemohon lain dilayani. Level 3 suntikan gagal sekali pada pending A: rollback melepas token dan pending, lalu A diulang. Commit tidak dibatalkan dengan rollback; pengembalian adalah operasi bisnis baru dan hanya sekali. Token stok bebas + reservasi + pinjaman aktif selalu diperiksa pada pengujian.

Ada budget 12/15/18, solusi 7/8/10 tindakan, gagal, ulang level/permainan dan skor 100 setelah tiga misi. Model tidak menjalankan transaksi SQL, isolation atau lock database nyata.

## Pemeriksaan

`tools/web-db-checks.js` memeriksa statis/dinamis, runtime/DB/credential/schema/grant, DNS/TCP/TLS tanpa status HTTP, vhost, POST/stock guard, rollback versus partial update, restore, konservasi token tiap langkah, oversell, committed rollback, duplicate return, budget serta solusi tiga game. Pemeriksaan terdaftar pada harness topik/game bersama. Evaluasi sepuluh soal memakai ambang 80 dan sertifikat bersama; penilaian praktik/proyek tetap oleh guru.

Hasil 26 Oktober 2026: validasi statis 41 modul dan ATP lolos. Browser menguji Web/Database serta File Server, masing-masing 12 tahap pada desktop/ponsel dan tema terang/gelap, tanpa error serta style parity benar. Alur baru Web/Database menuntaskan 12 tahap melalui kontrol aktual sampai sertifikat, PDF satu halaman, cetak ulang setelah reload serta penolakan sertifikat di bawah ambang nilai. Katalog kini 41 terbit dan 12 belum dibuat. Belum dilakukan deployment.
