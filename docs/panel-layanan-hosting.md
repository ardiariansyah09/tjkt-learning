# Control Panel, Shared Hosting, Dedicated Server, dan VPS — Fase F kelas XI

Modul inti Administrasi Sistem Jaringan, prasyarat Web dan Database Server serta Virtualisasi Server Dasar. Urutan, kategori, peran inti dan JP ATP dipertahankan. Halaman `modules/administrasi-server/panel-layanan-hosting/`; sumber `assets/js/course-hosting.js`; metadata `data/panel-layanan-hosting.json`.

## Materi

Dua belas tahap mengikuti kerangka bersama. Enam konsep mencakup model hosting/panel; kebutuhan/resource/tanggung jawab/biaya; instalasi panel; role/provisioning; quota/backup; migrasi/penerimaan. Ada contoh, tugas transfer, miskonsepsi, cek konsep dan proyek dengan rubrik manusia. Referensi primer HestiaCP, cPanel dan Plesk tersedia di modul, bukan rekomendasi pembelian atau jaminan fitur setara.

Materi membedakan panel dari VPS, dedicated IP dari dedicated server, managed dari semua kewajiban, vCPU dari inti fisik eksklusif, quota dari penggunaan host, banyak domain dari akun independen serta provisioning panel dari akses klien aktual. Instalasi memerlukan host bersih berizin, dukungan versi resmi, inventaris, backup, konsol pemulihan dan pemeriksaan hasil; tidak ada installer dijalankan situs. Migrasi mencakup sinkronisasi data, DNS/TTL, Host/SNI/TLS, cutover dan rollback data/traffic.

## Laboratorium panel

Shared mempunyai panel provider siap; VPS/Dedicated mulai tanpa panel pada host bersih. Admin/provider dapat membuat dua akun dan mengubah quota. Pemilik akun A dapat mengelola A, tidak membuat akun, menaikkan quota atau mengubah B. Peran provider pada Shared tidak diklaim sebagai hak OS tenant shared hosting.

Provisioning: buat akun quota 6 GiB model → domain → release web 4/8 → database 2. Panel domain tidak otomatis mengubah DNS dan sertifikat. Uji klien memeriksa kedua kondisi global serta web/database/isi sehat. Resource nyata dibatasi penggunaan web+database per akun dan kapasitas host 16/24/40 GiB untuk Shared/VPS/Dedicated sintetis. Total quota dapat melebihi fisik, tetapi deploy/database/restore tidak boleh melebihi penggunaan aktual yang tersedia. Angka bukan spesifikasi atau harga produk.

Backup akun off-host mencakup domain/release/database/health model, bukan DNS global, sertifikat, quota atau OS. Konten dapat dibuat gagal, diuji, direstore dan diuji kembali. Restore juga memeriksa quota/ruang. Edit pilihan membatalkan bukti; mengganti model hosting atau reset menghapus sesi/akun/backup, bukan jurnal/progres belajar. Tiga percobaan dicatat melalui jurnal bersama.

Tidak ada panel, installer, VM, hosting, billing, database, DNS, TLS, credential atau migrasi nyata. Schema/grant/credential DB dianggap sesuai dataset, melengkapi modul Web dan Database yang menguji lapisan tersebut lebih rinci. Tidak ada login/dashboard guru atau backend baru ditambahkan.

## Hosting Broker

Game kartu workload dengan disk/RAM, kebutuhan daemon khusus dan kebutuhan fisik eksklusif. Pilih kartu lalu host atau drag; Tab/Enter menjadi alternatif. Shared tidak menerima daemon OS khusus pada dataset. Workload fisik eksklusif harus sendirian pada Dedicated. Kapasitas dan biaya host aktif diperiksa; biaya per host, bukan per workload. Memindahkan workload mengembalikan kapasitas host asal dan host kosong tidak ditagih token.

Tiga misi: portal/worker; penambahan workload fisik eksklusif; packing empat workload dengan budget 16 token. Solusi uji memakai biaya 5, 14, 16 dan tindakan 3, 4, 5. Batas tindakan 12/14/16. Ada gagal budget tindakan, ulang level/permainan serta skor 100 setelah tiga rencana diterima. Tidak ada pertanyaan pilihan ganda. Resource/biaya/isolasi adalah aturan puzzle, bukan SLA, benchmark atau harga penyedia nyata.

## Pemeriksaan

`tools/hosting-checks.js` memeriksa panel pada host bersih, larangan instal pada Shared oleh tenant, role/target, quota versus ruang host, DNS/TLS, konten/restore, daemon khusus, fisik eksklusif, kapasitas broker, biaya, drag dan solusi tiga level. Pemeriksaan terdaftar pada harness topik/game bersama. Evaluasi sepuluh soal memakai ambang 80, sertifikat bersama, dan tidak menggantikan penilaian praktik/proyek.

Hasil 26 Oktober 2026: validasi statis 42 modul dan ATP lolos. Browser menguji modul ini serta Web/Database, masing-masing 12 tahap pada desktop/ponsel dan tema terang/gelap, tanpa error dan style parity benar. Alur baru Panel Hosting menyelesaikan 12 tahap melalui kontrol aktual sampai sertifikat, PDF satu halaman, cetak ulang setelah reload serta penolakan sertifikat di bawah ambang nilai. Katalog kini 42 terbit dan 11 belum dibuat. Belum dilakukan deployment.
