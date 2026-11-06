<?php

return [
    ['Orientasi dan tujuan','orientation', <<<'MD'
## Remote Server SSH pada Debian 12
Setelah modul ini, Anda mampu menjelaskan SSH client-server, memasang OpenSSH Server, mengatur port dan autentikasi, menguji firewall, serta mendiagnosis gangguan koneksi berdasarkan bukti.

**Alokasi:** 6 JP. **Prasyarat pengetahuan:** alamat IPv4, layanan TCP, pengguna Linux, dan berkas konfigurasi. Lab memakai server virtual `192.168.10.2/24` dan klien `192.168.10.10/24`.

Urutan belajar: pahami teori → checkpoint → diagram → guided lab → challenge → troubleshooting → game → evaluasi → refleksi. Membuka atau menggulir halaman belum menyelesaikan bacaan; lulus checkpoint membuktikan pemahaman. Nilai kuis terpisah dari progres.

Simulator tidak terhubung ke shell atau SSH nyata. Semua perintah dan berkas berada pada kondisi virtual per percobaan. Praktik laptop dilaksanakan setelah memahami prosedur dan menyiapkan VM sendiri.
MD],
    ['Apersepsi: mengelola server dari jauh','apperception', <<<'MD'
## Bagaimana mengelola server di ruang lain?
Bayangkan server sekolah berada di ruang jaringan. Anda perlu memeriksa kapasitas penyimpanan tanpa memasang monitor. Remote administration memungkinkan pengelolaan dari perangkat lain melalui jaringan.

Diskusikan: mengapa mengirim password melalui koneksi tanpa enkripsi berisiko? Apakah ping yang berhasil membuktikan SSH bekerja? Mengapa akun administrator tidak sebaiknya dipakai untuk seluruh pekerjaan?

**Kasus:** ping ke server berhasil, tetapi SSH menampilkan Connection refused. Buat hipotesis tentang service, port, dan firewall. Simpan jawaban untuk dibandingkan setelah troubleshooting.
MD],
    ['Konsep remote server dan arsitektur SSH','theory', <<<'MD'
## SSH: Secure Shell
SSH adalah protokol untuk akses jarak jauh yang melindungi kerahasiaan serta integritas sesi. OpenSSH menyediakan klien `ssh` dan daemon server `sshd`. Server mendengarkan koneksi; klien memulai koneksi menuju alamat dan port server. SSH juga mendasari SFTP dan tunneling, dengan kebijakan akses yang tetap perlu dikelola.

## Alur client-server
1. Klien membuka koneksi TCP ke port server, standar **22/TCP**.
2. Kedua pihak menegosiasikan parameter kriptografi dan membentuk kanal terenkripsi.
3. Klien memverifikasi identitas server melalui host key.
4. Server mengautentikasi pengguna.
5. Sesi interaktif atau perintah dijalankan sesuai hak akun.

Host key berbeda dari kunci pengguna. Peringatan perubahan host key harus diperiksa: dapat terjadi setelah instalasi ulang, tetapi juga dapat menandakan penyamaran. Jangan membiasakan mengabaikan verifikasi identitas.

## Port bukan mekanisme autentikasi
Mengganti port dapat mengurangi kebisingan pemindaian otomatis, tetapi bukan pengganti pembaruan, autentikasi kuat, dan pembatasan akses. SSH berjalan di TCP; ping memakai ICMP sehingga tidak menguji kesiapan port SSH.
MD],
    ['Password dan public key','theory', <<<'MD'
## Autentikasi password
Pengguna membuktikan identitas dengan password akun. Gunakan password kuat dan akun biasa dengan eskalasi terbatas. Jangan membagikan kredensial atau menaruh password dalam laporan.

## Autentikasi public key
Pasangan kunci terdiri atas private key yang disimpan oleh pemilik dan public key yang dapat dipasang di server. Public key pengguna ditempatkan di `~/.ssh/authorized_keys`. Private key tidak dikirim ke server dan sebaiknya dilindungi passphrase.

```text
ssh-keygen -t ed25519
ssh-copy-id siswa@192.168.10.2
ssh -i ~/.ssh/id_ed25519 siswa@192.168.10.2
```

Periksa kepemilikan direktori dan berkas. Kebijakan umum adalah `700` untuk `~/.ssh` dan `600` untuk `authorized_keys`. Pemasangan kunci membutuhkan jalur autentikasi yang masih berfungsi. Uji login kunci dari sesi klien kedua sebelum menonaktifkan password.

`PasswordAuthentication no` tidak otomatis menonaktifkan semua autentikasi interaktif. Periksa juga `KbdInteractiveAuthentication`, kebijakan PAM, serta konfigurasi efektif. Simulator memodelkan subset password dan public key untuk tujuan pembelajaran.
MD],
    ['Instalasi OpenSSH Server dan service','theory', <<<'MD'
## Paket dan service Debian 12
Pada VM Debian 12 yang memiliki koneksi repositori, jalankan sebagai root atau dengan sudo:

```text
apt update
apt install openssh-server
systemctl status ssh
systemctl enable ssh
ss -tlnp
```

`apt update` menyegarkan indeks, sedangkan `apt install` memasang paket. Service yang relevan adalah `ssh.service`; program daemon bernama `sshd`. `active` berarti sedang berjalan, sedangkan `enabled` berarti disiapkan untuk boot. Keduanya merupakan status berbeda.

Dalam lab virtual pemasangan paket mengaktifkan service. Pada komputer nyata kebijakan image, lingkungan init, dan konfigurasi dapat memengaruhi autostart. Periksa keluaran, jangan menganggap pemasangan selalu berhasil.

`ss -tlnp` menunjukkan listener TCP, alamat bind, dan proses sesuai izin. Listener pada localhost saja tidak dapat diakses dari klien lain. Cocokkan port listener dengan port tujuan klien.
MD],
    ['Konfigurasi sshd_config dan hardening','theory', <<<'MD'
## Berkas dan konfigurasi efektif
Konfigurasi server berada pada `/etc/ssh/sshd_config`, berbeda dari konfigurasi klien `ssh_config`. Debian juga mendukung snippet `sshd_config.d` melalui Include. Secara umum nilai pertama yang diperoleh untuk direktif digunakan; komentar diawali `#`. Konteks `Match`, Include, dan opsi startup dapat memengaruhi hasil. Periksa `sshd -T` pada mesin nyata, jangan hanya membaca satu baris.

```text
Port 2222
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
UsePAM yes
```

## Terapkan dengan urutan aman
1. Simpan cadangan konfigurasi pada VM Anda.
2. Pasang dan uji kunci akun biasa terlebih dahulu.
3. Buka port baru pada firewall sebelum mengubah listener.
4. Ubah konfigurasi lalu periksa `sshd -t`.
5. Reload/restart service hanya setelah konfigurasi valid.
6. Dari sesi kedua uji `ssh -p 2222 -i ~/.ssh/id_ed25519 siswa@192.168.10.2`.
7. Tutup sesi lama setelah pengujian berhasil.

Sukses `sshd -t` tidak menguji firewall atau kredensial. Mengubah berkas tidak langsung mengubah listener yang sedang berjalan. Simulator hanya mendukung enam direktif di atas; Include/Match tidak dimodelkan.
MD],
    ['Diagram koneksi SSH dan firewall','diagram', <<<'MD'
## Jalur koneksi
Klien → switch → server → listener SSH → autentikasi pengguna → sesi. Gunakan aktivitas diagram untuk menghubungkan perangkat, mengaktifkan service, serta memilih port dan metode autentikasi sesuai kebijakan.

## Firewall
Firewall host dan perangkat jaringan bisa mengizinkan atau memblokir koneksi. UFW adalah salah satu frontend firewall yang dapat dipasang; UFW tidak selalu tersedia atau aktif secara default di Debian. Pada simulator, UFW disediakan sebagai alat latihan.

```text
ufw allow 2222/tcp
ufw enable
ufw status
ssh -p 2222 siswa@192.168.10.2
```

Pada server sungguhan tinjau aturan yang sudah ada sebelum mengaktifkan firewall, terutama ketika dikelola dari jarak jauh. ICMP berhasil bukan bukti aturan TCP benar. Dalam diagram ini jalur pembelajaran sengaja melalui switch; ini bukan simulator routing atau packet capture lengkap.
MD],
    ['Guided Lab: instalasi dan uji SSH','guided_lab', <<<'MD'
## Target lab
Pasang OpenSSH Server pada server virtual, pastikan service berjalan dan enabled, lalu buktikan koneksi klien berhasil. Mulai aktivitas terminal guided di bawah.

```text
apt update
apt install openssh-server
systemctl enable ssh
systemctl status ssh
sshd -t
ss -tlnp
ssh siswa@192.168.10.2
```

Amati perbedaan status paket, service, dan listener. Gunakan checkpoint untuk melihat tujuan yang belum terpenuhi. Mengirim nama perintah saja belum membuktikan lab selesai; validator memeriksa kondisi akhir dan hasil uji koneksi.

**Pertanyaan:** jika service dihentikan setelah koneksi berhasil, apakah kondisi akhir masih memenuhi tujuan? Coba `systemctl stop ssh`, periksa checkpoint, lalu pulihkan service.
MD],
    ['Independent Challenge: SSH hardening','challenge', <<<'MD'
## Skenario
Paket sudah terpasang. Ubah layanan ke TCP 2222, aktifkan firewall dan izin TCP 2222, larang login root, aktifkan public key, serta nonaktifkan password dan keyboard-interactive. Jangan kehilangan akses akun siswa.

Anda memiliki konsol lokal virtual. Buat kunci dengan `ssh-keygen -t ed25519`, lalu pasang menggunakan `ssh-copy-id siswa@192.168.10.2` saat akses password port 22 masih berfungsi. Selanjutnya gunakan editor berkas virtual, validasi konfigurasi, terapkan service, dan uji koneksi memakai kunci pada port baru.

**Kriteria:** seluruh tujuan terminal harus terpenuhi. KKM lebih rendah tidak menghapus tujuan keselamatan lab. Skor tetap menunjukkan proporsi tujuan yang berhasil. Reset kondisi maksimal tiga kali tanpa mengulang waktu.

Pada sistem nyata, utamakan hak akses minimum, pembaruan keamanan, pencatatan akses, dan kebijakan sekolah. Model lab tidak mensimulasikan seluruh konfigurasi OpenSSH, PAM, atau serangan jaringan.
MD],
    ['Troubleshooting koneksi SSH','troubleshooting', <<<'MD'
## Diagnosis berbasis lapisan
| Gejala | Hipotesis | Bukti yang diperiksa |
| --- | --- | --- |
| Connection refused | Tidak ada listener pada port tujuan | systemctl status ssh; ss -tlnp |
| Connection timed out | Jalur atau firewall memblokir | alamat/rute; aturan firewall; port tujuan |
| Permission denied | Metode atau identitas tidak diterima | konfigurasi auth; public key; kepemilikan berkas; log |
| Konfigurasi gagal diterapkan | Sintaks atau nilai tidak valid | sshd -t; journalctl -u ssh |

Gejala pada jaringan nyata bisa memiliki penyebab lain. Gunakan bukti tambahan sebelum menyimpulkan.

## Kasus virtual
Server sudah mendengarkan TCP 2222, tetapi firewall baru mengizinkan TCP 22. Periksa `ip a`, `ping 192.168.10.2`, `systemctl status ssh`, `ss -tlnp`, dan `ufw status`. Perbaiki aturan TCP dan uji port tujuan yang benar. Jangan mengganti banyak parameter tanpa mengetahui penyebab.

Catat gejala awal → hipotesis → pemeriksaan → perubahan → bukti sukses pada refleksi Anda.
MD],
    ['Game edukasi: layanan, langkah, dan risiko','game', <<<'MD'
## Latihan penguatan konsep
Mainkan matching port-layanan, seret-lepas gejala-penyebab, serta sorting urutan hardening. Pilihan dapat dioperasikan melalui keyboard atau dropdown; drag-and-drop tidak diwajibkan pada perangkat sentuh.

Skor dihitung server dari pasangan atau posisi yang benar. Mengulang checkpoint membantu latihan; percobaan baru tunduk pada batas yang ditentukan guru. Level dicatat pada riwayat aktivitas.

Diskusikan mengapa membuka firewall dilakukan sebelum mengganti port, dan mengapa kunci harus diuji sebelum mematikan password.
MD],
    ['Evaluasi akhir dan penerapan administrasi','assessment', <<<'MD'
## Evaluasi
Kerjakan evaluasi akhir tanpa menyalin urutan guided lab. Anda akan menilai kasus port, autentikasi, service, dan konfigurasi. Nilai dihitung di backend; jawaban tersimpan otomatis ketika koneksi tersedia.

Dalam administrasi jaringan, SSH digunakan untuk pemeriksaan log, perubahan konfigurasi terkontrol, transfer berkas melalui SFTP, dan otomasi yang dibatasi hak aksesnya. Gunakan akun terpisah, catat perubahan, serta siapkan prosedur pemulihan sebelum mengubah akses jarak jauh.

Keberhasilan simulasi menjadi bukti keterampilan pada model pembelajaran, bukan sertifikasi kesiapan mengelola server produksi. Terapkan prosedur sekolah dan supervisi guru pada perangkat nyata.
MD],
    ['Refleksi dan praktik mandiri di laptop','reflection', <<<'MD'
## Refleksi hasil belajar
1. Jelaskan perbedaan host key dan user key.
2. Tulis alasan ping berhasil tetapi SSH gagal.
3. Susun prosedur mengubah port tanpa mengunci administrator.
4. Jelaskan bukti yang menunjukkan hardening tetap menyediakan akses akun biasa.

## Praktik laptop sendiri
Siapkan VM Debian 12 dan klien pada jaringan virtual terisolasi yang diizinkan guru. Buat akun biasa dan snapshot VM. Ulangi instalasi, uji port, pasang kunci, terapkan konfigurasi, serta diagnosis firewall. Jangan memakai server sekolah atau perangkat orang lain sebagai sasaran.

Bukti yang disiapkan: versi Debian, status service, listener, konfigurasi yang sudah disamarkan, dan koneksi sebagai akun biasa. Jangan menyertakan password atau private key. Gunakan aktivitas praktik laptop setelah diterbitkan guru untuk mengirim laporan dan bukti privat. Tinjau catatan guru dan kirim pengumpulan baru jika diminta perbaikan.

## Sumber rujukan
- [sshd_config Debian 12](https://manpages.debian.org/bookworm/openssh-server/sshd_config.5.en.html)
- [sshd Debian 12](https://manpages.debian.org/bookworm/openssh-server/sshd.8.en.html)
- [ssh Debian 12](https://manpages.debian.org/bookworm/openssh-client/ssh.1.en.html)
MD],
];
