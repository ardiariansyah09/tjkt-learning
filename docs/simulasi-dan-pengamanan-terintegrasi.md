# Simulasi kontekstual dan pengamanan layanan terintegrasi

## Cakupan perubahan

Penyesuaian berlaku pada 43 modul yang telah terbit, tanpa menambah modul katalog atau mengubah pengelompokan ATP. Sepuluh modul berstatus belum dibuat tetap belum memiliki aktivitas siap pakai. Inventaris per modul ada di `docs/inventaris-simulasi-kontekstual.md`.

Semua modul terbit sudah mempunyai aktivitas topik: 34 modul memakai laboratorium khusus dan jurnal, sembilan modul memakai simulator native. Simulator tersebut dipertahankan, bukan diganti panel yang sama. Penguatan kali ini menambahkan konteks keseharian spesifik pada orientasi seluruh 43 modul, peta subnetting baru, pengamanan layanan khusus pada sepuluh modul ASJ serta replay log login pada dua modul yang membahas SSH. Game tetap hanya di tahap game.

Contoh keseharian berbeda menurut topik: tiket Wi-Fi kantin, sensor lemari makanan, port komputer kelas, kabel antargedung, loker alamat, panggilan antar-ruang, dua editor laporan, pinjaman perangkat dan pemilihan tempat hosting. Setiap konteks menyebut tindakan pada simulator utama dan pertanyaan mengenai batas analogi. Konteks berupa pengantar/petunjuk; bukan diklaim sebagai simulator baru pada semua modul.

## Acuan yang dibaca

- Portal ASJ pengguna: https://ardiariansyah07.github.io/asj/ — pola layanan, pengamanan dan pengujian klien, bukan penyalinan stack Debian ke seluruh materi.
- Contoh subnetting: https://walidumar.my.id/konsep-subnetting.html — hubungan input/prefix dan visual alamat sebagai acuan prinsip interaksi. Implementasi peta loker ditulis sendiri, tidak menyalin kode/aset/desain situs tersebut.
- Ubuntu firewall: https://ubuntu.com/server/docs/firewalls/
- Fail2ban konfigurasi resmi: https://github.com/fail2ban/fail2ban/blob/master/config/jail.conf

Materi tetap memakai sumber primer masing-masing modul dan menyebut perbedaan platform/versi. Model browser tidak menjalankan server, paket jaringan, firewall, VPN, login, serangan, key, installer atau database nyata.

## ASJ: layanan dan keamanan dinilai bersama

`assets/js/service-security.js` memiliki sepuluh profil. Kontrol serta target sesuai karakter layanan:

| Modul | Percobaan pengamanan |
| --- | --- |
| Dasar server | Akses SSH manajemen tetap tersedia, sumber luar ditolak, portal tetap melayani siswa |
| Virtualisasi | Konsol berizin, batas jaringan VM, secret pada template/clone |
| Linux/Windows | Layanan tetap tersedia, akun layanan terbatas, gerbang uji patch staging |
| Manajemen pengguna | Reader/Editor aktif, Tamu ditolak, grup lama/sesi baru setelah perpindahan tugas |
| DHCP/DNS/SSH | DHCP resmi, recursion DNS terbatas, host key berubah ditahan, key operator sah |
| FTP | Data pasif sah, TLS login, PROT P dan penolakan upload anonim |
| File server | Editor sah, guest ditolak, sumber TCP 445 dibatasi, verifikasi ACL saat restore |
| Web/database | HTTPS publik, DB hanya untuk aplikasi, privilege minimum, secret di luar root publik |
| Panel hosting | Tenant mengelola akun sendiri, batas antar-akun, port admin dan akses backup |
| VPN | Layanan kerja, batas jaringan sensitif, pencabutan peer dan fallback saat tunnel down |

Matriks tambahan berada di laboratorium, setelah/damping simulator topik utama. Kondisi awal sengaja memuat paparan yang tidak sesuai; uji positif tidak boleh hilang ketika kontrol diperketat. Menolak semua akses tidak dianggap memenuhi target. Siswa mengubah satu kontrol, menjalankan uji, menelusuri tiap permintaan, menyimpan baseline dan perbaikan, lalu menjelaskan bukti pada refleksi. Kontrol ditulis sebagai kebijakan model; tidak diklaim mengubah konfigurasi OS nyata.

Setiap edit membatalkan hasil terakhir. Catatan terpisah pada localStorage `tjkt:MODULE:security-evidence:v1`, maksimal sepuluh, memuat kontrol dan matriks saat uji, tanpa credential. Reset kebijakan tidak menghapus bukti; Hapus catatan hanya menghapus catatan aktivitas tersebut. Penyimpanan gagal memberi pesan agar hasil disalin. Penambahan tidak menulis kunci progres/nilai atau mengubah ambang/kelulusan sertifikat.

Tujuan pembelajaran, produk kasus, refleksi dan bukti praktik akhir sepuluh modul ASJ juga diperkaya. Produk memerlukan konfigurasi layanan, pengamanan minimum, akses sah/tidak sah, log/jejak serta pemulihan pada VM berizin. Quiz/stage ID dan jumlah tahap tidak berubah; kualitas hardening nyata tetap dinilai guru.

## Replay log login

`assets/js/login-defense.js` dipasang pada Dasar Administrasi Server dan DHCP/DNS/Remote, bukan seluruh materi. Siswa menambahkan event satu per satu dari sumber luar/operator, mengaktifkan jail/filter/action, mengubah maxretry 2–5, memajukan waktu per 30 detik dan melakukan unban sumber terpilih.

Findtime 60 detik memakai jendela `(t−60,t]`, bantime 120. Hitungan dan ban per sumber. Filter tidak cocok tidak menghitung event; action gagal tidak memblokir meski ambang tercapai. Login valid pada sumber terban ditahan sebelum autentikasi. Keberhasilan login tidak menghapus histori gagal pada model. Ban yang sudah ada tetap sampai expiry/unban meskipun kontrol event berikutnya berubah. Unban menghapus counter sumber pada model. Ini penyederhanaan eksplisit, bukan klaim seluruh backend/filter/action Fail2ban mempunyai perilaku persis sama. Tidak ada brute force atau ban nyata.

## Peta loker subnetting

`assets/js/subnet-classroom.js` menambah aktivitas di CIDR Explorer yang sudah ada. Jaringan induk tetap 192.168.10.0/24; slider /24–/30 membagi seluruh 256 alamat tanpa overlap/gap. Slider perangkat 1–80 memperlihatkan kekurangan kapasitas. Pilih ruang/subnet, klik alamat network/host/broadcast dan lihat alokasi/cadangan dengan label selain warna.

Uji pesan mengirim dari host pertama ke oktet tujuan. Network/broadcast tidak dapat menjadi host biasa; tujuan yang sama dengan pengirim tidak dianggap uji antarperangkat. Satu subnet memakai switch lokal dalam asumsi topologi; lintas subnet memerlukan router/rute dua arah serta kebijakan. Route model bukan ping, ARP atau VLAN nyata. Membagi subnet tidak otomatis memisahkan broadcast domain perangkat. Alamat gateway belum disisihkan dari kebutuhan host; /31 point-to-point dan /32 sengaja di luar asumsi peta.

Slider memperbarui peta langsung, tombol menjadi alternatif interaksi, jumlah alamat dibatasi 256, dan reduced-motion dihormati. Input/perubahan membatalkan bukti jalur lama, reset mengembalikan kondisi awal. Tidak mengubah game atau nilai subnetting yang sudah ada.

## Integrasi dan pemeriksaan

`module-shell.js` memasang komponen secara idempoten sesuai module ID/tahap. CSS tambahan ditempatkan sebelum `module-standard.css` agar kerangka tetap seragam. Cache query shell/foundation diperbarui untuk seluruh modul. Kontrol tidak ditempatkan pada game atau setiap pertemuan; konteks ada pada orientasi, eksperimen keamanan pada lab ASJ, peta subnetting pada CIDR.

`tools/contextual-checks.js` menguji cakupan konteks, profil baseline/hardened/block-all, pembatalan bukti, penyimpanan/perbandingan, jejak, kapasitas dan pembagian seluruh /24, batas network/broadcast, jalur antar-subnet serta replay log/filter/action/expiry. Harness topik memanggilnya pada tahap terkait, berdampingan dengan pengujian simulator lama. Validasi statis ATP/asset tetap digunakan; laporan browser/kelulusan mencatat cakupan aktual.

## Standar untuk materi berikutnya

1. Tentukan fenomena/masalah khas materi dan contoh keseharian yang membantu, beserta batas analoginya. Tambahkan konteks baru ketika modul benar-benar diterbitkan; angka cakupan tes perlu dihitung ulang, bukan terus dipatok 43.
2. Bangun eksperimen dengan state/input/tindakan/hasil yang berkaitan sebab-akibat, visual/jejak yang bisa diamati, kondisi gagal, pemulihan dan cara mengulang. Pilih bentuk sesuai topik: denah, aliran, antrean, grafik, editor, timeline atau manipulasi objek. Tidak mewajibkan bentuk ruang 3D atau kartu yang sama untuk semua materi.
3. Praktik ASJ memadukan konfigurasi fungsi dan kontrol keamanan yang relevan, termasuk uji sah/tidak sah, log dan pemulihan. Tambahkan profil pengamanan yang sesuai atau simulator khusus lebih mendalam; jangan hanya mengganti judul pada contoh yang tidak berkaitan.
4. Instruksi menyebut tindakan pertama, kendali, target keberhasilan, perbedaan konfigurasi tersimpan/aktif bila relevan, reset dan batas model. Untuk tahap terkunci, jelaskan cek pemahaman mana yang harus dikerjakan; hasil eksperimen bukan otomatis nilai tahap.
5. Game merupakan interaksi permainan pada tahap game, tanpa soal pilihan ganda sebagai mekanik utamanya. Game tidak perlu dipasang pada setiap pertemuan atau dipaksa 3D. Simulasi dan game mempunyai tujuan berbeda.
6. Uji model bermakna, input/tindakan nyata pada UI, keyboard/ponsel/tema, state/bukti yang kedaluwarsa, akses positif/negatif serta progres sampai PDF/cetak ulang. Pengujian keamanan tambahan tidak boleh menulis grade lama. Demonstrasi server asli tetap dinilai guru di lab berizin.

Pratinjau lokal: `docs/pratinjau-peta-subnet.png` dan `docs/pratinjau-pengamanan-asj.png`. Tool `tools/preview-contextual-browser.ps1` memakai profil browser QA terisolasi dengan progres buatan khusus screenshot; pengujian penyelesaian asli tetap memakai harness completion terpisah.

## Hasil validasi 26 Oktober 2026

- `validate-atp.ps1`: 43 halaman terbit, aset/import, graf prasyarat, fase/kelas, role dan total JP lolos.
- Audit browser lengkap: 43 modul / 486 tahap, desktop 1280×900 dan ponsel 390×844, tema terang/gelap, style parity benar, tanpa error. Interaksi simulator lama, konteks orientasi, matriks tambahan dan log diuji melalui kontrol UI. Laporan: `docs/module-validation-browser.json`.
- Setelah perapian ukuran kartu peta, audit focused subnetting diulang dan lolos. Laporan: `docs/module-validation-browser-focused.json`.
- Penyelesaian dari progres kosong: subnetting dan sepuluh modul ASJ, total sebelas modul, seluruhnya menuntaskan tahap melalui kontrol aktual, PDF satu halaman, cetak ulang setelah reload dan penolakan sertifikat saat nilai akhir di bawah ambang. Laporan: `docs/completion-validation-focused.json`.
- Pemeriksaan tambahan membandingkan kunci progres sebelum/sesudah percobaan keamanan/peta; aktivitas tersebut tidak mengubah grade lama. Catatan baru memakai kunci evidence terpisah. Pratinjau juga diperiksa secara visual dan label peta dirapikan.

Tidak ada modul katalog baru pada penyesuaian ini: 43 tersedia, 10 belum dibuat. Perubahan masih pada workspace; tidak dilakukan commit, push atau publikasi GitHub Pages.

## Perluasan berikutnya: Monitoring XI

Setelah penguatan di atas, modul `monitoring-jaringan` diterbitkan sebagai modul ke-44. Konteks keseharian kini44, profil pengamanan ASJ11 dan katalog belum dibuat9. Inventaris diperbarui; hasil audit lengkap43 di atas tetap merupakan baseline historis, bukan klaim audit serentak44. Monitoring menambah timeline probe/threshold, status stale, delivery/maintenance, snapshot ONU serta game penjadwalan Incident Shift. Profil keamanan menjaga dashboard admin privat, data publik terpilih, token terlindungi serta OLT read-only. Laporan focused selalu berisi pengujian terpilih terbaru; dokumentasi cakupan/hasil modul ada di `docs/monitoring-jaringan.md`.


## Penyelesaian seluruh katalog — 26 Oktober 2026

Seluruh 53 modul kini tersedia, dengan konteks keseharian pada 53 modul dan pengamanan layanan terintegrasi pada 20 modul. Sembilan modul terakhir memiliki simulator dan game sesuai karakter topik. Audit browser 53 modul/606 tahap lulus tanpa error; sembilan alur baru lulus hingga PDF sertifikat dan cetak ulang. Rincian serta batas pengujian: [penyelesaian sembilan modul](penyelesaian-sembilan-modul.md).
