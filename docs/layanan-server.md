# DHCP, DNS, dan Remote Server — Fase F kelas XI

Modul inti Administrasi Sistem Jaringan mengikuti Manajemen Pengguna dan Hak Akses. Kategori, urutan, prasyarat, peran inti dan JP ATP dipertahankan. Halaman `modules/administrasi-server/layanan-server/`; sumber `assets/js/course-services.js`; metadata `data/layanan-server.json`.

Dua belas tahap memakai kerangka bersama. Enam konsep mencakup scope/exclusion/reservasi; DORA/lease/renew/relay; zona/resolver/record; TTL/cache/diagnosis nama; SSH berlapis; implementasi/uji/rollback. Ada contoh konfigurasi scope Kea dan zona forward BIND, perintah query klien, validasi konfigurasi SSH, tugas transfer, miskonsepsi, cek pemahaman dan proyek dengan rubrik. Konfigurasi produk nyata hanya contoh untuk VM berizin terisolasi, bukan perintah yang dieksekusi situs. Referensi primer RFC 2131/2308, Ubuntu dan Microsoft tersedia pada modul.

## Laboratorium

LAN 192.168.10.0/24, gateway .1, resolver .2 dan server SSH .10. Pool dinamis .100–.101 atau .100–.102, reservasi Printer .102 terpisah; model nama klien tidak dianggap identitas reservasi pada produk nyata. A/B/Printer memperoleh lease 120 detik. Server/relay, pool habis, release, renew manual, opsi resolver tersimpan pada lease dan expiry bisa dibandingkan. Lease yang masih valid tetap ada jika renew gagal; pada expiry alamat model dihapus. Gateway hanya ditampilkan, bukan diuji.

Satu cache positif A bersama untuk lab, satu nama admin.lab.test dan TTL 60. Waktu hanya maju dengan tombol 60 detik; tidak memakai jam nyata. Record berubah tidak menghapus cache. Resolver salah/tidak merespons menghasilkan timeout, nama hilang menghasilkan NXDOMAIN setelah cache tidak dipakai. Model tidak menyimpan negative cache atau mengimplementasikan DNS rekursif penuh; konsep negative caching dan NOERROR-empty/SERVFAIL dibahas pada teks.

SSH memeriksa lease, tujuan hasil DNS, listener, jalur TCP 22, host key tepercaya, autentikasi dan peran operasi baca terbatas. Ini bukan autentikasi, kriptografi, koneksi atau shell nyata. Tidak menghapus known_hosts atau menyarankan menonaktifkan pemeriksaan identitas. Input berubah membatalkan hasil tetapi tidak menulis ulang lease/cache yang masih valid. Reset mengembalikan sesi model, bukan jurnal/progres belajar. Tiga eksperimen dicatat melalui jurnal bersama.

Batas lain: satu scope, tidak menghitung T1/T2 otomatis, giaddr rinci, NAK, konflik IP statis, beberapa server, IPv6, DNSSEC atau routing/firewall penuh. Kondisi remote DHCP hanya menguji kebutuhan relay, bukan seluruh topologi jaringan. Praktik VM harus melengkapi pemeriksaan port, konfigurasi produk, rute dan bukti klien aktual.

## Service Dispatch

Puzzle tiga klien dan persediaan kartu alamat .100–.103. Pemain memilih atau menyeret IP ke kartu klien, melepas alamat sebelum pemindahan, memenuhi reservasi/exclusion, mengarahkan record serta cache ke target dan membatasi SSH hanya Admin. Setiap operasi/uji memakai tindakan, pemilihan kartu gratis. Tidak ada soal pilihan ganda. Ada kendali Tab/Enter sebagai alternatif drag, status/matriks, gagal budget, ulang level/permainan dan skor setelah tiga misi.

Level 1 membangun alokasi dari kosong. Level 2 memperbaiki alamat .101 yang harus menjadi milik Printer serta hak remote berlebih. Level 3 memigrasikan DNS/cache ke .20 dan mengecualikan .103. Model game berbeda dari lab: IP reservasi .101 dan dua tujuan DNS .10/.20 merupakan dataset tantangan, bukan perubahan pada alamat lab. Solusi uji memakai 5, 7 dan 9 tindakan dari budget 12, 16 dan 18.

## Validasi

`tools/services-checks.js` memeriksa pool/reservasi, relay, lease valid saat renew gagal, expiry, opsi lama/baru setelah renew, cache/TTL, timeout versus NXDOMAIN, listener/firewall/host key/autentikasi/peran, pembatalan bukti, alokasi unik/reservasi/exclusion, drag dan solusi tiga level. Pemeriksaan terdaftar pada harness topik/game bersama.

Hasil 26 Oktober 2026: validasi statis 38 modul dan ATP lolos. Browser menguji modul ini dan Manajemen Pengguna, masing-masing 12 tahap pada desktop/ponsel dan tema terang/gelap, tanpa error serta style parity benar. Alur modul baru menyelesaikan 12 tahap melalui kontrol aktual hingga sertifikat, PDF satu halaman, cetak ulang setelah reload serta penolakan sertifikat di bawah ambang. Evaluasi akhir sepuluh soal ambang 80; skor otomatis tidak menggantikan penilaian praktik/proyek. Katalog 38 terbit, 15 belum dibuat; belum dideploy.
