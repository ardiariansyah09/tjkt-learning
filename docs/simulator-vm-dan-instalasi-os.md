# Tahapan sesuai materi dan simulator VM/installer

Tanggal: 29 Oktober 2026. Pekerjaan **lokal**, belum diterapkan ke server LMS. Catatan ini memperbarui status delapan tahap dan kendala browser pada laporan sebelumnya.

## Tahapan tidak dibatasi delapan

- **Dasar Mesin Virtual: 13 tahap.** Orientasi; resource host/guest; pembuatan VirtualBox; pembuatan Workstation; hardware/media; jaringan; instalasi guest dan boot; layanan; pemulihan; clone dan peer; laboratorium; refleksi; evaluasi.
- **Instalasi komputer: 15 tahap.** Orientasi; persiapan; Ubuntu boot/live; opsi aplikasi/jaringan; partisi Linux; akun/waktu; praktik Linux desktop; kebutuhan Windows; disk Windows; pengaturan awal Windows; praktik Windows desktop; konfigurasi klien; laboratorium perbandingan; refleksi; evaluasi.
- **Router/switch: 8 tahap**, tetap berdasarkan lingkup konfigurasi dasar modul tersebut.

Jumlah ini hasil pembagian kompetensi, bukan target seragam. Total tiga modul dasar menjadi 36 tahap. Evaluasi akhir mencakup satu soal dari setiap tahap sebelumnya: 12, 14 dan 7 soal. ATP tetap 202 JP total elemen; penambahan tahap tidak dianggap menambah JP otomatis.

## Praktik melalui web

Simulator tidak memerlukan VirtualBox/VMware terpasang pada perangkat peserta. Tersedia pengelola VM dengan dua tampilan pilihan, wizard pembuatan guest, pengaturan RAM/vCPU/disk, firmware/TPM, ISO, jaringan/segmen dan IP guest model. Empat VM maksimal pada host latihan RAM 16 GiB, reserve 4 GiB, 8 CPU logis serta pool disk 256 GiB.

VM yang sudah dibuat belum otomatis mempunyai OS. Mulai dari ISO untuk membuka installer, selesaikan instalasi, lepas ISO, lalu restart untuk membuktikan boot dari disk. Salah media, resource berlebih dan boot disk kosong menghasilkan pesan yang dapat ditindaklanjuti.

Instalasi Ubuntu mencakup bahasa, aksesibilitas, keyboard, jaringan, Try/Install, interactive/automated, pilihan aplikasi, dukungan perangkat, disk otomatis/manual, akun, zona waktu, ringkasan, fase penyalinan, lepas ISO dan boot disk. Manual partitioning memeriksa EFI FAT32 dan root ext4, mount point unik serta kapasitas. Disk DATA latihan dilindungi.

Instalasi Windows mencakup bahasa/keyboard, instalasi bersih, product key kemudian, edisi, peninjauan lisensi, disk, ringkasan, penyalinan, restart, wilayah/jaringan, identitas fiktif dan privasi. Tidak meminta product key nyata, tidak membuat akun Microsoft, tidak mengaktifkan Windows, dan bukan cara melewati persyaratan akun/jaringan pada produk asli.

Setelah guest boot, peserta dapat mengubah berkas proyek model, shutdown, membuat snapshot offline, mengubah lagi, lalu restore dan membandingkan versi data. Clone menyalin IP/identitas sehingga peserta perlu memperbaiki konflik sebelum uji peer. Model peer memeriksa power/boot, mode, segmen dan alamat satu /24. Ini bukan emulator kernel, terminal penuh, layanan Internet atau pengukuran jaringan nyata.

## Seberapa sama dengan installer asli?

Acuan alur dipilih eksplisit: **Ubuntu Desktop 24.04 LTS** dan **Windows 11 instalasi bersih**. UI berupa rekonstruksi pendidikan dengan tema dan keputusan relevan, **bukan salinan pixel-identik setiap layar, edisi atau build**. Aksesibilitas, penyalinan berkas, firmware, perangkat, lisensi dan akun daring disederhanakan dengan penjelasan pada layar. Label SIMULASI selalu terlihat. Simulator cukup untuk melatih keputusan serta urutan, tetapi kompetensi perangkat asli tetap diverifikasi melalui praktik guru.

Referensi primer: [installer Ubuntu Desktop](https://ubuntu.com/tutorials/install-ubuntu-desktop), [kebutuhan Windows 11](https://support.microsoft.com/en-us/windows/experience/compatibility/windows-11-system-requirements), [instalasi bersih Windows](https://support.microsoft.com/en-us/windows/deployment/install-upgrade/reinstall-windows-with-the-installation-media), dan [pembuatan VM VirtualBox](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/create-vm.html). Pemilihan kedua produk desktop mengikuti arahan instruktur; ATP menyebut kompetensi, bukan menetapkan produk/build tertentu.

## Progres lama dan data latihan

Peserta baru pada dua modul yang diperluas memakai kunci course v3. Bila ditemukan hasil tahap v2 yang sudah dikerjakan, modul memakai delapan tahap lama dengan simulator baru pada laboratoriumnya. Nilai lama tidak dipindahkan menjadi nilai tahap baru dan tidak dihapus. Kelayakan sertifikat lama tetap diperiksa berdasarkan tahap yang dikerjakan. Modul lain menggunakan kunci sebelumnya.

Sesi simulator tersimpan pada kunci tersendiri dalam namespace modul, tidak menulis nilai course. Dua sesi Ubuntu/Windows pada modul instalasi dipisahkan agar tidak saling menimpa. Catatan dapat diunduh sebagai JSON. Sandi latihan hanya dibandingkan sementara di form dan tidak ditulis ke sesi, log atau ekspor. Gunakan identitas fiktif.

## Pengujian

`check-virtual-lab.mjs` lulus **213 pemeriksaan tindakan**: instalasi Ubuntu otomatis/manual, Windows, media hilang/salah, resource tidak cukup, TPM tidak siap, disk terlindungi, partisi tidak lengkap/berlebih, konfirmasi, boot tanpa ISO, snapshot/restore, clone, konflik IP, segmen berbeda serta NAT per-VM.

`check-foundation-previews-browser.mjs` berhasil di Chrome headless dengan profil uji terpisah pada HTTP lokal sementara. Pembatasan proses Windows sebelumnya menghalangi proses browser; pengujian berhasil ketika dijalankan dengan izin proses yang sesuai.

Browser mengerjakan asesmen melalui formulir hingga seluruh 13/15/8 tahap lulus, memastikan evaluasi salah tidak membuka sertifikat, membuat sertifikat dengan logo, dan menguji pemanggilan `window.print` (dialog cetak distub; bukan pemeriksaan 36 PDF). Reload memulihkan progres. Instalasi Ubuntu manual/otomatis dan Windows dijalankan melalui kontrol simulator, termasuk penolakan salah disk, lepas ISO, boot, perubahan data serta snapshot/restore. Tidak ditemukan error JavaScript atau overflow pada lebar 390 px. Progres delapan tahap lama diuji memakai fixture sintetis terpisah; kelayakan sertifikat tetap ada dan rekaman nilai identik.

Hasil: `docs/virtual-lab-validation.json`, `docs/foundation-previews-browser.json`, `docs/completed-foundations-validation.json`. Screenshot desktop/ponsel disimpan di `docs/*-lab-desktop.png` dan `docs/*-lab-mobile.png`. Uji browser tidak membuktikan kesetaraan pixel dengan produk asli ataupun kemudahan untuk seluruh siswa; uji pemahaman siswa tetap diperlukan.

Untuk membangun ulang perluasan, jalankan `node tools/expand-foundation-learning.mjs`, kemudian pemeriksaan di atas. Generator awal delapan tahap diberi pengaman agar tidak menimpa versi yang diperluas.
