# Dasar Administrasi Server — Fase F kelas XI

Modul pendukung pada elemen Administrasi Sistem Jaringan, urutan pertama dengan prasyarat Protokol/Layanan Jaringan. Peran `pendukung` dipertahankan sesuai pemetaan ATP: materi menyiapkan fondasi sebelum virtualisasi, administrasi OS, dan layanan inti. JP elemen tidak diubah.

Halaman: `modules/administrasi-server/dasar-administrasi-server/`. Konten: `assets/js/course-server-basics.js`. Metadata: `data/dasar-administrasi-server.json`.

## Dua belas tahap

Orientasi; peran server/layanan/resource; OS/identitas/akses; alamat/nama/listener/klien; paket/config/proses/boot; log/data/cadangan/restore; runbook/penerimaan; proyek; laboratorium; game Rack Rescue; refleksi; evaluasi akhir.

Setiap konsep memuat penjelasan, contoh, tugas transfer, miskonsepsi, serta cek pemahaman. Proyek meminta inventaris/dependensi, diagram akses, kewenangan, kriteria layanan, matriks gangguan, tiga eksperimen, cadangan/restore, penerapan/boot, runbook, dan batas kesimpulan. Proyek/refleksi dinilai dengan rubrik manusia.

Rujukan primer: dokumentasi Ubuntu Server/OpenSSH/log, Red Hat systemd, serta Microsoft Get-Service/pengelolaan layanan. Materi membedakan nama unit, OS/versi, start/enable, status/startup type, serta keterbatasan unit/dependency. Contoh inspeksi tidak diklaim mengubah sistem lokal. Instalasi/administrasi Linux/Windows rinci dan strategi backup lengkap tetap modul lanjutan.

## Laboratorium sekolah-web

State machine daemon fiktif di browser: paket terpasang, draft, config disk, config proses, active, enabled, backup config, boot counter, serta log urutan. Server LAN 192.168.10.2, klien LAN satu subnet, dan klien remote melalui jaringan lab yang dirutekan. HTTP serta SSH tidak menjalankan koneksi jaringan nyata.

Operasi: status, instalasi paket model, backup, save, config check, start/stop/reload, enable/disable, reboot model, restore, uji SSH LAN, dan uji HTTP. Pengamat tidak diizinkan mengubah konfigurasi/proses. Kanal administrasi dapat console atau SSH; bila SSH tidak tersedia, operasi melalui kanal itu ditolak dan console model tetap menjadi jalur pemulihan. Ini bukan login, autentikasi, atau RBAC nyata.

Save tidak menerapkan config proses. Start pada proses yang sudah aktif tidak reload. Daemon model mendukung reload valid, menolak config invalid tanpa membongkar proses lama; perilaku daemon lain dapat berbeda. Restore hanya mengembalikan config disk, menyelaraskan draft yang terlihat, dan perlu penerapan/uji lagi. Backup yang dibuat dari config salah tetap bisa berisi config salah.

Enable tidak start; disable tidak stop. Reboot model selesai sebagai operasi, tetapi layanan hanya hidup menurut aturan paket/enabled/config valid pada model. Tidak meniru dependency, socket activation, masked/oneshot, atau semua perilaku manajer layanan OS.

HTTP dibedakan menurut sumber lokal/LAN/remote, IP/nama, port listener, bind all/loopback, kebijakan, dan kemampuan tulis data. LAN satu subnet tidak mensyaratkan gateway remote. Local-IP memakai 127.0.0.1; nama web.lab.test mengarah ke alamat LAN sehingga hasil dapat berbeda pada bind loopback. Listener tidak aktif menghasilkan tidak ada respons HTTP, bukan 503 dari aplikasi. Aplikasi model yang hidup tetapi data penuh/izin salah dapat merespons 503. Keberhasilan SSH hanya keterjangkauan model, bukan bukti host key atau autentikasi.

Preset: stopped; paket tidak ada; active tetapi disabled; config invalid; bind loopback; kebijakan HTTP menolak; data penuh; DNS gagal; SSH terputus. Mengedit draft belum mengubah disk. Mengubah skenario/kondisi membatalkan bukti hasil; state layanan dipertahankan kecuali preset memuat ulang kasus. Jurnal menyimpan lingkungan, draft, peran/kanal/sumber/port, operasi, hasil, config disk/proses, serta log urutan model. Tidak mengukur filesystem atau resource nyata.

## Rack Rescue

Game grid 7×5 tiga level. U adalah teknisi, B cadangan, P paket, C perbaikan config, V validasi, S Start, A autostart, N perbaikan jalur klien, R reboot model, T uji klien. Tombol E dipakai untuk interaksi pada rak; huruf rak autostart A sengaja dibedakan dari tombol E. Gerak memakai panah/WASD atau tombol arah, dengan batas langkah dan dinding.

Misi pertama membedakan layanan sekarang dan sesudah boot. Misi kedua membutuhkan cadangan, perbaikan config, validasi, start, autostart, dan pembuktian boot/klien. Misi ketiga menambahkan paket yang belum tersedia dan jalur klien terhalang. Uji awal dapat memberi diagnosis tanpa langsung meluluskan misi. Semua perjalanan/interaksi memakai langkah; merencanakan urutan dan hanya memperbaiki yang perlu mencegah kehabisan anggaran. Ulang level/permainan tersedia. Nilai 100 disimpan setelah tiga misi selesai.

Game bukan kuis dan hanya ada pada tahap game. Urutan bukti, konsol/rak, dan batas langkah adalah aturan permainan; tidak ada perintah OS atau reboot komputer pengguna.

## Validasi

`tools/server-basics-checks.js` memeriksa inactive HTTP, enable versus start, disable versus stop, boot, config disk/proses, reload, backup/restore, invalid config yang ditolak, sumber/port/bind, DNS, rute LAN/remote, storage error versus process active, hak pengamat, kanal SSH versus console, paket belum ada, dan restore tanpa cadangan.

UI memeriksa preset/operasi, pembatalan bukti, versi respons sebelum/sesudah penerapan, persistensi, pemulihan, dan jurnal. Game diuji untuk gerak keyboard, batas langkah, solusi tiga level, backup/check/start/enabled/boot, hasil klien, ulang, dan persistensi nilai.

Browser terpilih mencakup modul ini dan regresi dual-WAN pada desktop/ponsel serta tema terang/gelap. Alur kelulusan menjalankan 12 tahap dari progres kosong hingga formulir sertifikat, PDF satu halaman, cetak ulang setelah reload, dan penolakan skor akhir di bawah 80. Profil sementara tidak mengubah progres siswa.

Laporan: `docs/module-validation-browser-focused.json` dan `docs/completion-validation-focused.json`. Situs tetap statis tanpa database/login; progres serta jurnal lokal dapat diekspor.
