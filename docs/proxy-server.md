# Proxy Server — Fase F kelas XI

Modul inti pada elemen Konfigurasi Perangkat Jaringan, urutan ketujuh setelah Internet Gateway dan NAT. Prasyarat NAT dan Protokol/Layanan Jaringan dipertahankan. ID katalog `proxy-load-balancing` dipakai untuk kompatibilitas; materi berfokus pada proxy sesuai ATP, sedangkan load balancing/failover tetap modul tersendiri. JP elemen tidak diubah.

Halaman: `modules/konfigurasi-jaringan/proxy-server/`. Konten: `assets/js/course-proxy.js`. Metadata: `data/proxy-load-balancing.json`.

## Struktur

Dua belas tahap: orientasi; peran forward/reverse proxy versus routing/NAT; explicit proxy dan pemeriksaan jalur; ACL/urutan akses; cache HTTP/freshness/validasi; HTTPS CONNECT; konfigurasi/log/diagnosis/pemulihan; proyek; laboratorium; game Cache Runner; refleksi; rangkuman/evaluasi akhir.

Setiap konsep memuat penjelasan, contoh, transfer, miskonsepsi, serta cek pemahaman. Proyek meminta rancangan listener/sumber, urutan kebijakan, bukti diizinkan/ditolak, matriks cache/CONNECT, tiga eksperimen, konfigurasi berizin, backup/reload/rollback, dan batas kesimpulan. Rubrik proyek/refleksi diperiksa manusia.

Rujukan primer: dokumentasi Squid untuk http_access/http_port/HTTPS/logformat dan RFC 9111. Kerangka Squid memakai pola versi 6/7 dan secara eksplisit meminta pemeriksaan dukungan versi serta konfigurasi bawaan. Tidak mengaktifkan TLS interception, tidak menjanjikan inspeksi path HTTPS, dan tidak mengklaim kerangka akses mencakup seluruh penyimpanan, autentikasi, keamanan, atau pengelolaan sistem.

## Laboratorium

Dataset .test berjalan sepenuhnya dalam browser. Kontrol meliputi pemakaian proxy klien, listener, kelompok sumber, DNS proxy, koneksi origin, cache, izin CONNECT, dan loop forwarding. Tiga aturan dapat dinaikkan/diturunkan: deny domain, allow LAN, deny all. Trace menampilkan kecocokan pertama. Pemeriksaan ACL mendahului penggunaan cache; sumber atau tujuan yang ditolak tidak mendapatkan objek meskipun cache fresh.

Tiga objek public HTTP dapat memaksa eviksi cache dua-slot LRU. Respons private/no-store dan POST tidak disimpan pada model; batas cache POST dijelaskan sebagai keputusan model, bukan larangan universal HTTP. Freshness memakai max-age 60 detik manual serta validator versi sederhana. Fresh HIT dapat menyajikan versi lama yang masih sah menurut metadata meskipun origin berubah. Setelah stale, origin yang tidak berubah menghasilkan 304; request klien model tanpa kondisi menerima body tersimpan sebagai 200. Versi berubah memperoleh 200/body baru. Model tidak menyediakan stale-if-error sehingga origin gagal tidak otomatis membolehkan body stale.

Hasil CONNECT hanya menyatakan pembentukan tunnel menuju authority TCP 443. Tidak ada body/path aplikasi HTTPS dibuka atau disimpan di cache. HTTP status hasil model bukan tangkapan paket atau log Squid nyata. Listener tidak terjangkau dibedakan dari respons HTTP proses proxy; konfigurasi klien yang tidak memakai proxy diberi hasil DIRECT dan akses langsung tidak diuji.

Perubahan kondisi/aturan membatalkan bukti hasil tanpa menghapus cache agar ACL-versus-HIT dan fresh-versus-origin-offline dapat diuji. Majukan waktu dan perubahan versi origin juga meminta request baru. Pilihan resource/metode tercatat bersama konfigurasi, versi, trace, serta isi cache ketika percobaan disimpan pada jurnal. Reset mengembalikan waktu/cache/versi, mempertahankan pilihan konfigurasi.

Tidak menghitung autentikasi 407, Vary/Authorization, Range, heuristic freshness, stale-if-error, DNS cache, handshake TCP/TLS, atau trafik jaringan nyata. Domain .test memerlukan origin/DNS lab tersendiri jika praktik nyata dilakukan.

## Cache Runner

Game kurir grid 7×5 tiga level dengan gerak panah/WASD, E untuk ambil/simpan/salin/antar, dan Q untuk eviksi bay. Origin O menyediakan muatan request kini dengan biaya 2 WAN; klien C menerima objek; dua bay menyimpan salinan public fresh; T membuang muatan. PRIVATE/no-store dan tunnel HTTPS tidak boleh dimasukkan ke bay. Cache stale tidak boleh diambil sebagai fresh.

Antrean dan anggaran mendorong penggunaan ulang cache, bukan mengunduh setiap request. Level 3 meloncatkan waktu 250 setelah empat request dan mengubah origin A/B sehingga cache lama kedaluwarsa. Pemain mengosongkan bay serta mengambil objek baru. Nyawa, batas langkah, dinding, anggaran, dan pengulangan memberi kondisi gagal/pemulihan yang jelas. Game bukan kuis dan tidak muncul pada tahap lain. Angka WAN/waktu adalah mekanika permainan, bukan byte/latensi nyata. Proses 304 tidak disimulasikan oleh papan; validasi dipelajari di laboratorium.

## Validasi

`tools/proxy-checks.js` memeriksa MISS/HIT, versi lama ketika fresh, validasi 304 versus respons klien, pembaruan body, ACL sebelum HIT, perubahan urutan, private/no-store/POST, CONNECT tanpa cache, DNS/origin versus freshness, direct/listener, loop, LRU, penolakan benda privat/stale pada game, dan solusi tiga level dengan batas anggaran. Pengujian UI memeriksa kontrol, pembatalan bukti, penyimpanan eksperimen, gerak keyboard, anggaran habis, ulang level, event kedaluwarsa, dan penyimpanan nilai 100 setelah tiga level selesai.

Validasi statis mencakup katalog, dependency lokal, prasyarat, fase/kelas/peran ATP, dan JP. Browser terpilih menguji Proxy Server dan regresi NAT pada desktop/ponsel serta tema terang/gelap. Uji kelulusan Proxy Server menjalankan 12 tahap dari progres kosong hingga formulir sertifikat, PDF satu halaman, cetak ulang setelah reload, dan penolakan nilai akhir di bawah 80. Profil browser sementara tidak mengubah progres siswa.

Laporan: `docs/module-validation-browser-focused.json` dan `docs/completion-validation-focused.json`. Situs tetap statis tanpa database atau login; progres/jurnal lokal dapat diekspor.
