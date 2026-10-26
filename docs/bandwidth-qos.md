# Manajemen Bandwidth dan QoS — Fase F kelas XI

Modul inti pada elemen Konfigurasi Perangkat Jaringan, urutan kedelapan, dengan prasyarat NAT. Cakupan ATP mencakup pembagian bandwidth/QoS serta pengenalan RADIUS Linux untuk profil pengguna. Alokasi JP elemen tidak diubah.

Halaman: `modules/konfigurasi-jaringan/bandwidth-qos/`. Konten: `assets/js/course-qos.js`. Metadata: `data/bandwidth-qos.json`.

## Dua belas tahap

Orientasi; kapasitas/throughput/bottleneck; klasifikasi/DSCP/trust; FIFO/prioritas/WRR; token bucket/policing/shaping; profil pengguna/RADIUS Linux; konfigurasi/uji/pemulihan; proyek; laboratorium; game Queue Pilot; refleksi; evaluasi akhir.

Setiap konsep mempunyai penjelasan, contoh, tugas transfer, miskonsepsi, serta cek pemahaman. Proyek meminta lokasi/arah bottleneck, kebutuhan tiap kelas, kepercayaan marking, scheduler/meter/buffer, tiga eksperimen, rancangan profil pengguna/NAS, penerimaan, backup/persistensi/rollback, serta batas kesimpulan. Proyek/refleksi dinilai dengan rubrik manusia.

Rujukan primer: RFC 2474, dokumentasi Cisco tentang policing/shaping, RFC 2865, serta dokumentasi FreeRADIUS/radtest. Kerangka MQC dinyatakan bergantung dukungan platform dan bukan salinan algoritma browser. Pengenalan FreeRADIUS menggunakan pola versi 3, membedakannya dari versi 4, serta menjelaskan bahwa Filter-Id harus dipetakan NAS. Access-Accept bukan bukti pembatas trafik aktif. Tidak ada server RADIUS, akun/login, atau database yang dijalankan oleh situs ini.

## Model antrean

Satu egress, 24 slot masing-masing 1 ms, semua paket 1000 byte. Kapasitas satu/dua/tiga paket per slot merepresentasikan 8/16/24 Mbit/s pada batas model. Semua aliran dikirim berdasarkan trace deterministik ringan, padat, burst, atau suara terus-menerus. Ukuran paket dan ambang tunggu suara >3 ms adalah data latihan, bukan parameter codec/target VoIP nyata.

Dua antrean kelas memiliki batas paket masing-masing dan tail drop saat kelas penuh. FIFO memilih kepala paling tua; strict priority memilih suara dahulu; WRR memakai pola dua suara:satu data dengan melewati kelas kosong/tidak eligible. Pada FIFO, kepala data yang ditahan shaper tidak dilompati. Urutan pipeline ini dinyatakan sebagai keputusan model, bukan implementasi universal vendor.

Token data bertambah 0,5 paket/ms (4 Mbit/s untuk ukuran paket lab); bucket 1–6 paket. Policer memakan token saat kedatangan dan membuang kelebihan. Shaper menunggu token saat layanan; paket dapat tetap terbuang jika buffer penuh. Pengisian awal bucket, replenishment, layanan, dan drop tercatat per slot.

Klasifikasi tepercaya memisahkan suara dari data. Jika dimatikan, suara masuk kelas data; jika data ikut ditandai tinggi, data masuk kelas suara. Statistik tetap menurut aliran asli sehingga salah klasifikasi terlihat. Model tidak membaca DSCP paket nyata atau mengautentikasi endpoint.

Ringkasan memisahkan datang/kirim/sisa, drop buffer/policer, rerata/maksimum waktu tunggu, suara terkirim yang menunggu >3 ms, dan throughput. Throughput memakai jendela penuh 24 ms termasuk drain, bukan hanya saat kedatangan aktif. Konservasi paket diperiksa: datang = terkirim + drop buffer + drop policer + pending. Paket pending tidak dihitung sebagai sukses atau drop. Waktu tunggu bukan latency/jitter end-to-end.

Slider dan tombol slot memutar ulang keadaan antrean/token serta layanan setelah slot yang dipilih. Edit input membatalkan hasil lama; percobaan baru baru dapat dicatat setelah simulasi dijalankan lagi. Jurnal menyimpan konfigurasi, ringkasan, dan jejak slot.

Tidak ada overhead link, paket berukuran bervariasi, TCP adaptif, codec, WRED/ECN, per-user admission, algoritma WFQ/LLQ vendor, atau layanan RADIUS yang disimulasikan.

## Queue Pilot

Game penjadwalan 2D tiga level dengan antrean kartu, slot transmisi, gelombang mendatang, deadline suara, kewajiban menyelesaikan data, batas antrean, serta batas giliran. Pemain memilih kartu atau menyeret ke slot lalu menjalankan giliran. Pilihan dapat dilepas atau dipindahkan antarslot sebelum waktu maju; paket yang sama tidak dapat dikirim dua kali.

Suara boleh dikirim pada giliran deadline, tetapi sisa suara sesudahnya menggagalkan misi. Data tidak mempunyai deadline suara namun tetap harus selesai sebelum batas misi. Level ketiga hanya menyediakan satu slot pada t2/t3. Giliran kosong tetap memajukan waktu. Ulang level/permainan memulihkan keadaan yang sesuai. Tiga level selesai baru menyimpan nilai 100.

Game bukan kuis dan hanya muncul pada tahap game. Deadline, kapasitas/giliran, paket seragam, serta delapan tempat antrean adalah mekanik permainan, bukan ukuran jaringan nyata. Tombol native mendukung Tab/Enter; drag/drop dan perpindahan kartu antarslot diuji.

## Validasi

`tools/qos-checks.js`: 36 kombinasi trace/scheduler/meter diperiksa untuk konservasi paket, kapasitas layanan, dan token. Kasus tambahan memeriksa satuan/jendela throughput, starvation versus pembagian berbobot, shaping/policing, classifier/trust, data bertanda tinggi, kapasitas lebih besar, dan buffer tidak valid. Pengujian UI memeriksa pembatalan bukti, playback slot, metrik, serta penyimpanan percobaan. Solusi game memeriksa deadline, kebutuhan layanan data, drag/drop, fokus/toggle, pemindahan antarslot, penyempitan kapasitas, pengulangan, dan persistensi nilai.

Browser terpilih menguji QoS dan regresi Proxy Server di desktop/ponsel serta tema terang/gelap. Kelulusan QoS diuji melalui seluruh 12 tahap dari progres kosong hingga formulir sertifikat, PDF satu halaman, cetak ulang setelah reload, serta penolakan skor akhir di bawah 80. Profil sementara tidak mengubah progres siswa.

Laporan: `docs/module-validation-browser-focused.json` dan `docs/completion-validation-focused.json`. Situs tetap HTML/CSS/JS statis dengan progres/jurnal lokal yang dapat diekspor.
