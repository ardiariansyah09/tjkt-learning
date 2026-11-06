# Analisis hardening dan latihan terminal

Tanggal: 29 Oktober 2026. Lingkup: pemeriksaan sumber lokal dan perbandingan situs ASJ, bukan penerapan perubahan ke modul atau server LMS.

## Kesimpulan

Latihan command diperlukan untuk kompetensi administrasi Linux/Windows, layanan, jaringan, dan hardening. Pembahasan keamanan sudah ada, tetapi pemetaan ATP yang sudah terpenuhi tidak otomatis berarti seluruh prosedur produk seperti UFW, OpenSSH, dan Fail2ban sudah lengkap. Ketiga topik tersebut perlu pendalaman praktik.

Terminal sebaiknya ditempatkan pada pembahasan yang memerlukannya, bukan dipaksakan ke semua modul. Bash, CMD, dan PowerShell harus dibedakan. Tampilan terminal dapat dibuat mendekati aslinya; kesamaan perilaku harus dibatasi pada command dan versi OS yang benar-benar didukung dan diuji. Untuk perilaku OS sesungguhnya diperlukan lingkungan OS nyata yang terisolasi.

## Temuan pada sumber yang tersedia

| Bagian | Yang sudah ada | Yang perlu dilengkapi |
| --- | --- | --- |
| Hardening host | Baseline, least privilege, remote access, layanan/firewall, patch, audit, secret, recovery, dan uji penerimaan | Prosedur konfigurasi per OS, contoh hasil, diagnosis kegagalan, dan pembuktian kontrol dengan command |
| UFW | Contoh `ufw status numbered` dan pembatasan sumber SSH; model ACL/kebijakan akses | Default policy, status aktif/nonaktif, protokol, sumber/subnet, urutan dan penghapusan rule, limit, logging, persistensi, IPv6, dan pemulihan akses |
| SSH public key | Konsep identitas operator dan host key, verifikasi fingerprint, pengamanan remote dan contoh pemeriksaan layanan | Pembuatan key, penempatan public key, ownership/permission, pengujian sesi baru, konfigurasi autentikasi efektif, rotasi/pencabutan, dan diagnosis |
| Fail2ban | Model log login: findtime, maxretry, bantime, filter/action, waktu dan unban; dipasang melalui `service-security.js` pada modul dasar administrasi server dan layanan server | Instalasi, jail lokal, backend log, ignoreip, pengujian filter, status jail, action firewall, unban melalui command, dan diagnosis salah blokir |
| Linux/Windows CLI | Contoh perintah di administrasi OS/server dan beberapa aktivitas model | Terminal latihan aktif dengan state, parser, keluaran, error dan izin sesuai shell; bukan sekadar kotak input atau daftar command |

Bukti sumber: `assets/js/remaining-security-curriculum.js`, `course-services.js`, `remaining-practice-examples.js`, `course-os-admin.js`, `course-server-basics.js`, `service-security.js`, `login-defense.js`, dan `module-shell.js`. Pencarian pada `assets/js` dan `modules` tidak menemukan rangkaian literal `ssh-keygen`, `ssh-copy-id`, `authorized_keys`, `PasswordAuthentication`, `PermitRootLogin`, atau `PubkeyAuthentication`. Ini menunjukkan kesenjangan contoh prosedural, bukan ketiadaan seluruh konsep SSH.

Model log login secara eksplisit belum mengimplementasikan Fail2ban/UFW, regex nyata, ignoreip atau backend journal. Model ACL first-match juga bukan implementasi UFW lengkap. Berkas `basic-practice.js` yang berasal dari praktik terbimbing lama tidak dijadikan bukti terminal aktif dan tidak perlu diaktifkan kembali.

## Perbandingan dengan ASJ

Halaman ASJ yang ditinjau: NOS, instalasi Debian, SSH, UFW, Fail2ban, Nginx, MariaDB, dan proyek. Referensi HTML disimpan sebagai `docs/asj-reference-*.html` untuk penelusuran analisis. Tautan Kuma tidak berhasil diakses sehingga isinya tidak dianggap telah ditinjau.

ASJ memberikan urutan konkret: OS → administrasi → layanan → pengamanan → proyek terpadu. Materi SSH mencakup key, konfigurasi, transfer dan diagnosis; UFW mencakup kebijakan serta pengelolaan rule; Fail2ban mencakup jail/filter/action dan diagnosis log. Integrasi semacam ini sesuai untuk penguatan modul yang sudah ada.

Terminal ASJ sendiri memakai state dan cabang command JavaScript terbatas, bukan menjalankan OS. Karena itu, tampilannya dapat dijadikan inspirasi, tetapi tidak menjadi bukti kesetaraan dengan seluruh perilaku Bash/UFW/Fail2ban asli.

Materi rujukan juga tetap perlu dikritisi: menonaktifkan satu metode autentikasi SSH tidak menghilangkan seluruh risiko kompromi; pergantian port bukan pengganti autentikasi dan pembatasan akses; server tanpa GUI merupakan pilihan desain lab, bukan kewajiban universal untuk semua server.

## Penempatan pembelajaran

| Jenjang | Latihan yang sesuai |
| --- | --- |
| Fase E, kelas X | Setelah instalasi OS: navigasi direktori, berkas, identitas, IP, ping, bantuan command, perbedaan pengguna biasa/administrator, dan pengenalan layanan. Linux dan Windows dipelajari sebagai lingkungan berbeda. |
| Fase F, kelas XI | Administrasi pengguna/izin/layanan, konfigurasi jaringan, SSH key, firewall host dasar, pengamanan web/database, log, backup dan pemulihan yang menyertai layanan yang sedang dibangun. |
| Fase F, kelas XII serta materi pilihan keamanan sesuai ATP | Baseline hardening, audit konfigurasi, Fail2ban, korelasi log, pengujian filter/action, patch/staging, respons insiden dan proyek pengamanan terpadu. |

Prasyarat lebih penting daripada memindahkan seluruh keamanan ke kelas XII. Pengamanan minimum harus diperkenalkan ketika layanan pertama kali dioperasikan. Nama produk UFW/Fail2ban adalah pilihan implementasi kompetensi; kesesuaiannya harus dipetakan kembali ke tujuan ATP, bukan dianggap diwajibkan hanya karena ada di situs ASJ.

## Rancangan terminal yang direkomendasikan

Tiga profil terpisah diperlukan:

1. Linux: tetapkan distro, versi, shell, paket dan akun lab. Untuk kesinambungan ASJ dapat memakai Debian 12; profil Ubuntu harus menyatakan perbedaan yang relevan. Cakupan awal: berkas, permission, pengguna, jaringan, systemd, OpenSSH, UFW dan Fail2ban.
2. Windows CMD: `cd`, `dir`, `type`, `whoami`, `ipconfig`, `ping`, `nslookup`, `netstat`, dan pengelolaan layanan yang sesuai. Jalur Windows, quoting, error dan kebutuhan elevasi harus dimodelkan.
3. Windows PowerShell: navigasi, bantuan, layanan, jaringan, firewall, izin dan event log. Bedakan versi Windows PowerShell/PowerShell dan ketersediaan modul. Pipeline objek tidak boleh disamakan dengan pencocokan teks Bash atau alias CMD.

Klien SQL memerlukan mode dan konteks tersendiri; SQL tidak ditafsirkan sebagai command shell biasa.

Simulator harus menyimpan state yang saling berhubungan: filesystem, akun/izin, konfigurasi tersimpan versus layanan berjalan, startup, rule firewall, identitas SSH, endpoint, log dan waktu ban. Mengetik command harus memengaruhi state tersebut. Command yang belum didukung memberikan pesan batas yang jelas, bukan hasil sukses palsu.

Petunjuk setiap aktivitas memuat tujuan, keadaan awal, tempat mengetik, contoh langkah pertama, indikator hasil, cara memeriksa, cara memperbaiki dan reset. Bantuan, riwayat command, input keyboard dan tampilan error perlu konsisten. Penilaian berdasarkan keadaan akhir dan bukti uji, bukan kesamaan kalimat command dengan kunci jawaban.

Jangan membebani siswa dengan seluruh administrasi sekaligus: satu masalah jelas per latihan, dukungan bantuan bertahap, lalu kasus gabungan. CLI adalah praktik administrasi; game 2D tidak perlu diubah menjadi soal command pilihan ganda.

## Batas kesamaan dan pilihan runtime

| Pilihan | Kesesuaian | Batas |
| --- | --- | --- |
| Simulator state di browser | Lokal/GitHub dan LMS; latihan aman, reset cepat, pengalaman seragam | Hanya command dan perilaku yang diimplementasikan; bukan kernel, jaringan atau kriptografi OS nyata |
| Terminal ke lab Linux terisolasi | Pembuktian command dan layanan Linux asli | Perlu penyediaan sesi, resource, jaringan dan pemulihan; container tidak selalu setara VM untuk systemd/firewall |
| Terminal ke VM Windows terisolasi | CMD, PowerShell, layanan dan permission Windows asli | Perlu Windows, kapasitas, lisensi dan pengelolaan sesi yang sesuai |

Pustaka seperti xterm.js menangani antarmuka terminal, bukan menyediakan OS. Mengganti prompt menjadi `C:\\>` pada server Linux tidak menghasilkan Windows. PowerShell di Linux juga tidak otomatis menyediakan seluruh kemampuan administratif Windows.

Jika persyaratannya benar-benar perilaku asli, arah yang sesuai adalah browser → pengelola sesi lab berotorisasi → OS lab terisolasi. Jangan menghubungkan command siswa ke shell server produksi LMS atau database. Versi OS, paket, locale, privilege dan shell tetap harus ditetapkan karena keluaran OS nyata pun berbeda antar lingkungan. Kapasitas server saat ini belum dinilai untuk menjalankan lab semacam itu.

## Kriteria sebelum penerapan

- Bandingkan command yang dijanjikan dengan VM referensi: hasil, perubahan state, error, exit status, dan hak akses; dokumentasikan yang belum didukung.
- Uji konfigurasi tersimpan versus aktif dan start versus enable; konfigurasi SSH yang salah tidak boleh seolah berhasil diterapkan.
- Uji SSH dengan identitas host dan operator terpisah, permission, sesi baru, dan jalur pemulihan sebelum membatasi autentikasi.
- Uji UFW saat aktif/nonaktif, koneksi sah/terlarang, source/protocol, IPv6 sesuai cakupan, urutan rule dan pemulihan akses.
- Uji Fail2ban dengan log cocok/tidak cocok, jendela waktu, sumber berbeda, ignoreip, action gagal, expiry dan unban. Jangan menganggap membaca log sama dengan berhasil memblokir.
- Uji CMD dan PowerShell terpisah, termasuk path, privilege dan error; jangan meniru keluaran Linux sebagai Windows.
- Pertahankan ID modul, penyimpanan progres, nilai dan sertifikat lama. State latihan baru memakai namespace terpisah; reset lab tidak menghapus hasil belajar. Jangan menambah penguncian baru bagi peserta lama tanpa rancangan kompatibilitas.
- Pisahkan state antar peserta dan sesi, jangan menyimpan private key/credential nyata dalam laporan, dan uji simpan/muat ulang serta penggunaan keyboard/perangkat kecil.

## Prioritas usulan

Lengkapi dahulu pembahasan/prosedur UFW, SSH key dan Fail2ban pada modul yang relevan. Berikutnya buat simulator Linux stateful dengan skenario singkat; lanjutkan profil CMD dan PowerShell yang benar-benar berbeda. Lab OS nyata menjadi jalur pembuktian kompetensi bila kesetaraan perilaku penuh memang menjadi syarat. Jumlah tahap mengikuti keluasan materi, tidak dipatok seragam.

Dokumen ini tidak mengubah modul, persyaratan kelulusan, progres, sertifikat atau konfigurasi LMS. Penerapan belum dilakukan karena permintaan saat ini adalah analisis kebutuhan dan kesesuaian.

## Referensi

- ASJ: https://ardiariansyah07.github.io/asj/ — khususnya `ssh.html`, `ufw.html`, `fail2ban.html`, `nginx.html`, dan `mariadb.html`.
- Ubuntu OpenSSH: https://documentation.ubuntu.com/server/how-to/security/openssh-server/
- Ubuntu firewall/UFW: https://documentation.ubuntu.com/server/how-to/security/firewalls/
- OpenSSH konfigurasi server: https://man.openbsd.org/sshd_config
- Fail2ban: https://github.com/fail2ban/fail2ban/wiki/How-fail2ban-works
- Konfigurasi jail: https://manpages.debian.org/trixie/fail2ban/jail.conf.5.en.html
- Terminal browser: https://xtermjs.org/
- PowerShell: https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/00-introduction
- OpenSSH Windows: https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh-overview
