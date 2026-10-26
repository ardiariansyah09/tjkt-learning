# Sistem Kontrol, Monitoring, dan Pemeliharaan Jaringan — Fase F kelas XI

Modul inti Administrasi Sistem Jaringan dengan prasyarat DHCP/DNS/Remote serta Fiber Optik. Kategori, urutan, peran inti dan JP ATP dipertahankan. Halaman `modules/administrasi-server/monitoring-jaringan/`; sumber `assets/js/course-monitoring.js`; metadata `data/monitoring-jaringan.json`.

## Materi dan praktik

Dua belas tahap mengikuti kerangka bersama. Enam konsep meliputi kebutuhan/dependensi/titik observasi; probe/timing/ambang; timeline/log/alert/stale; Uptime Kuma/resource/akses; OLT/ONU/SmartOLT; triage/maintenance/verifikasi. Ada contoh, tugas transfer, miskonsepsi, cek konsep dan proyek dengan rubrik manusia. Referensi primer Uptime Kuma, Ubuntu dan SmartOLT tersedia pada modul.

Rencana instalasi mencakup metode/release yang didukung, VM berizin, data persisten, backup, bind, proxy/WebSocket/TLS dan role admin/status page. Fragmen Nginx hanya contoh location ke backend loopback 3001, bukan konfigurasi produksi lengkap. Instruksi pemeriksaan resource/log memakai nama unit placeholder yang harus diganti berdasarkan inventaris; browser tidak menciptakan hasil ukur CPU/disk palsu.

Konteks keseharian: portal tugas sebelum bel masuk. Indikator hijau lama tidak cukup jika data berhenti atau alert tidak diterima operator. Profil keamanan tambahan menguji operator sah tetap dapat membaca dashboard, sumber luar ditolak pada port admin, status publik tidak membocorkan secret/topologi, akun monitoring read-only tidak boleh reboot ONU. Tujuan, proyek, refleksi dan bukti praktik akhir dipadukan dengan pengamanan melalui integrator bersama.

## Timeline monitoring

Mulai UNKNOWN, interval30/60 detik model dan ambang1/2/3 kegagalan berturut. Tombol sampel memajukan waktu satu interval, mengambil probe dan mencatat heartbeat. Jenis probe Ping, TCP443 dan HTTPS+marker; lokasi LAN/local/remote. Kondisi dataset sehat, HTTP503, HTTP200-isi salah, listener mati, jalur remote gagal, DNS, sertifikat, daya ONU atau LOS.

Ping/TCP dapat lolos saat aplikasi gagal. Gangguan jalur remote tidak dianggap server pasti mati ketika LAN sehat. Pada ambang2, gagal pertama PENDING dan kedua DOWN; sukses pertama kembali UP sesuai penyederhanaan. Alert hanya pada transisi UP/DOWN setelah status awal, bukan setiap sampel gagal. Delivery channel dapat gagal walau event ada. Maintenance menahan pengiriman transisi tanpa menghapus observasi; tidak ada pengiriman catch-up otomatis. Uji channel tidak mengirim pesan nyata.

Lewati tiga interval memajukan jam tanpa probe. Status historis tetap tetapi diberi STALE bila umur melebihi dua interval. Persentase hanya jumlah sampel sukses pada maksimal24 terakhir, bukan uptime durasi/SLA. Jenis/lokasi/interval/ambang baru memulai seri dan alert history baru; perubahan kondisi lapangan mempertahankan histori. Edit membatalkan pencatatan bukti lama. Reset mengembalikan config/timeline/alert/ONU sesi, bukan jurnal/progres. Tiga eksperimen dicatat melalui jurnal bersama.

Tidak menjalankan Uptime Kuma, ping, HTTP, TLS, SNMP, log OS, API, webhook atau notifikasi nyata. Threshold bukan parameter retries yang identik pada semua versi produk. Tidak menghitung RTT, scheduler timeout/retry nyata, CPU/disk atau availability durasi. Hal-hal tersebut dibahas sebagai kebutuhan implementasi dan batas model.

## Dataset ONU

Snapshot awal t0 online RX−19dBm merupakan angka dataset, bukan spesifikasi universal. Baca snapshot memperbarui timestamp; kondisi power memberi petunjuk dying-gasp dan null RX, kondisi fiber memberi petunjuk LOS dan null RX. Missing tidak dikonversi ke nol; nilai lama tidak dianggap pengukuran baru. Status/event adalah petunjuk yang perlu korelasi lapangan, bukan lokasi kerusakan pasti. Identitas, arah/wavelength/reference point, dukungan perangkat/akses dan umur data dijelaskan. Tidak ada query SmartOLT, credential/API token atau provisioning/reboot ONU nyata.

## Incident Shift

Game penjadwalan dua teknisi dengan skill Jaringan/Sistem. Satu teknisi satu tiket, dua teknisi dapat bekerja paralel per ronde. Tiap tiket memiliki durasi dan dependensi; dependensi harus terverifikasi dua probe sebelum pekerjaan lanjutan. Probe dan backup menghabiskan satu ronde tanpa menjalankan pekerjaan teknisi. Pilih/assign gratis, kerja memakai ronde. Ini model waktu turn-based, bukan game soal pilihan ganda.

Level1 tiga tiket independen (AP/web/DNS); level2 uplink mendahului portal/DNS; level3 fiber mendahului database dan portal, dengan backup sebelum DB. Solusi uji9/13/14 ronde dalam tenggat11/15/16. Menutup tiket dini ditolak; lewat tenggat gagal. Ada ulang level/permainan, klik/Tab/Enter dan skor100 hanya setelah tiga shift. Ronde/durasi/dua probe merupakan aturan game, bukan SLA/perbaikan perangkat nyata.

## Pengujian

`tools/monitoring-checks.js` menguji unknown/pending/down/up, deduplikasi alert, delivery gagal, maintenance, gap/stale, Ping/TCP versus HTTP, lokasi, marker, null RX/daya/LOS, skill, dependensi, backup, deadline, solusi dan kontrol UI. Pemeriksaan terdaftar pada harness topik/game bersama. Evaluasi sepuluh soal ambang80 dan sertifikat bersama; praktik produk/diagnosis nyata tetap dinilai guru.

Hasil 26 Oktober 2026: validasi statis44 modul dan ATP lolos. Browser focused menguji Monitoring bersama VPN dan DHCP/DNS/Remote, masing-masing12 tahap, desktop1280×900/ponsel390×844, tema terang/gelap, tanpa error dan style parity benar. Monitoring menuntaskan12 tahap dari progres kosong melalui kontrol aktual sampai sertifikat, PDF satu halaman, cetak ulang serta penolakan sertifikat ketika nilai akhir di bawah ambang. Audit lengkap historis43 modul/486 tahap tetap dipisahkan dari focused tambahan ini. Katalog44 tersedia,9 belum dibuat; belum dideploy.
