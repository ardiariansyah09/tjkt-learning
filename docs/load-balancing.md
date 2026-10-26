# Load Balancing dan Failover — Fase F kelas XI

Modul inti pada elemen Konfigurasi Perangkat Jaringan, urutan kesembilan dengan prasyarat Manajemen Bandwidth dan QoS. Lingkup mengikuti ATP: pembagian beban jalur, pemeriksaan kesehatan, failover, pengujian kegagalan, dan dokumentasi. JP elemen tidak diubah.

Halaman: `modules/konfigurasi-jaringan/load-balancing/`. Konten: `assets/js/course-dual-wan.js`. Metadata: `data/load-balancing.json`.

## Struktur materi

Dua belas tahap: orientasi; load balancing/failover/kapasitas; distribusi per sesi/bobot/affinity; health check/target/histeresis; sesi/NAT/failover/failback; konfigurasi dual-WAN; pengujian/penerimaan/rollback; proyek; laboratorium; game Dual-WAN Bridgekeeper; refleksi; evaluasi akhir.

Tiap konsep memuat penjelasan, contoh, tugas transfer, miskonsepsi, serta cek pemahaman. Proyek meminta diagram, kapasitas, bobot, kunci klasifikasi, table rute utama/cadangan, NAT, target/jalur probe, matriks sesi lama/baru, tiga eksperimen, penerimaan berizin, backup/persistensi/rollback, serta batas kesimpulan. Penilaian proyek/refleksi memakai rubrik manusia.

Sumber primer: dokumentasi resmi MikroTik tentang PCC, failover/recursive routing, keputusan rute, serta RFC NAT. Contoh RouterOS 7 secara eksplisit dibatasi pada dua default route dengan pemeriksaan gateway lokal dan NAT alamat tetap. Itu bukan PCC lengkap atau remote health check. Untuk PCC, materi meminta pemetaan classifier/connection mark/table/rute/NAT/pengecualian serta pemeriksaan contoh lengkap resmi sesuai versi. Tidak ada perintah yang dijalankan pada perangkat oleh situs.

## Laboratorium dual-WAN

LAN 192.168.10.0/24, WAN A 203.0.113.2/30 dan WAN B 198.51.100.2/30, target aplikasi/probe memakai alamat dokumentasi 192.0.2.0/24. A/B mempunyai kapasitas awal 12/6 Mbit/s. Seluruh kondisi merupakan dataset browser, bukan jaringan Internet yang diukur.

Pilihan sesi baru: A utama/B cadangan, weighted round robin, atau hash deterministik berbobot. Kunci hash alamat klien atau tuple koneksi dapat dibandingkan. Hash FNV model tidak diklaim sama dengan algoritma PCC vendor. Bobot menentukan kelompok sesi, bukan jaminan pembagian byte/Mbps. Maksimum 12 sesi lab; sesi menyimpan sumber/port, pin WAN, alamat luar, dan permintaan saat dibentuk.

Monitor membandingkan gateway lokal atau dua target remote, probe dipin/tidak dipin, quorum minimal satu/keduanya, serta ambang sukses/gagal 1–3 putaran. Keadaan awal belum UP sebelum memenuhi ambang sukses. Edit kondisi membatalkan bukti tetapi mempertahankan pin, counter, serta health terakhir sehingga jeda deteksi dan false healthy dapat diamati. Putaran bukan detik/ICMP nyata.

Kasus meliputi upstream gagal meskipun gateway merespons; probe tanpa pin tertolong WAN lain; satu target gagal; NAT salah walaupun monitor UP; semua WAN gagal; beban lebih besar daripada kapasitas; serta jalur pulih. Uji sesi menandai sesi yang terbukti gagal sebagai putus pada model. Sesi itu tidak otomatis hidup kembali atau pindah WAN; buat koneksi baru. Sesi B yang sehat tetap di B ketika A pulih. Ini keputusan model yang dinyatakan, bukan simulasi seluruh kemungkinan retransmisi/timeout TCP.

Perkiraan laju dibagi proporsional terhadap permintaan sesi sehat per WAN, dibatasi kapasitas dan permintaan. Satu sesi tidak menjumlahkan kapasitas A+B. Tidak ada overhead, congestion control, bonding, ECMP, DNS/TLS, sinkronisasi NAT, atau migrasi TCP yang dihitung. Hasil health dan hasil layanan sengaja dipisahkan.

Jurnal menyimpan konfigurasi, pilihan klien, observasi monitor, pin sesi, kegagalan, dan hasil uji kapasitas sesuai operasi. Edit membatalkan hasil yang boleh dicatat. Menutup sesi menghapus sesi tersebut; reset mengosongkan state sesi/monitor, mempertahankan konfigurasi, sehingga probe perlu dijalankan lagi.

## Dual-WAN Bridgekeeper

Game strategi graf 2D tiga level dengan dua jembatan, unit kapasitas bersamaan, sesi berbobot/durasi, gelombang baru, kejadian gagal/pulih, hasil probe terakhir, serta anggaran membangun ulang. Kartu dapat dipilih lalu dialokasikan, atau diseret ke tombol WAN. Tombol native mendukung Tab/Enter. Diagram menampilkan sesi aktif dan perbedaan fakta skenario dengan hasil monitor.

Sesi aktif tidak boleh dipindahkan langsung dan tidak boleh menimpa kapasitas penuh. Jalur gagal membuat sesi terkait perlu dibangun ulang; identitas percobaan baru bertambah dan progres dimulai kembali. Ketika WAN lain pulih, sesi sehat tidak dipindahkan. Probe game tidak memajukan waktu dan tidak menerapkan histeresis laboratorium; majukan giliran untuk memproses pekerjaan serta kejadian. Semua sesi harus selesai sebelum batas giliran dan anggaran ulang habis. Ulang level/permainan tersedia. Nilai 100 disimpan hanya setelah tiga misi selesai.

Game bukan kuis dan hanya muncul pada tahap game. Unit kapasitas, giliran, durasi, serta progress sesi merupakan mekanika permainan, bukan Mbit/s atau kelangsungan TCP/NAT nyata.

## Validasi

`tools/dual-wan-checks.js` memeriksa health awal, ambang gagal/pulih, pemilihan utama/cadangan, pin failback, gateway versus upstream, probe tidak dipin, quorum target, urutan RR 2:1, affinity hash klien, kapasitas satu sesi/agregat, NAT gagal saat probe sehat, semua jalur DOWN, serta larangan memindahkan sesi aktif. Solusi tiga level diperiksa terhadap kapasitas, waktu, serta anggaran ulang.

Pengujian UI memeriksa input/putaran, pembatalan bukti, health lama versus kondisi baru, sesi lama/baru, NAT/kapasitas, reset, dan penyimpanan percobaan. Game diuji untuk batas waktu, drag/drop, pin aktif, kapasitas penuh, kegagalan/rekoneksi, ulang level, serta penyimpanan nilai.

Browser terpilih mencakup dual-WAN dan regresi QoS pada desktop/ponsel serta tema terang/gelap. Alur kelulusan dual-WAN berjalan melalui seluruh 12 tahap dari progres kosong hingga formulir sertifikat, PDF satu halaman, cetak ulang setelah reload, dan penolakan skor akhir di bawah 80. Profil sementara tidak mengubah progres siswa.

Laporan: `docs/module-validation-browser-focused.json` dan `docs/completion-validation-focused.json`. Situs tetap statis tanpa database/login; progres dan jurnal disimpan lokal serta jurnal dapat diekspor.
