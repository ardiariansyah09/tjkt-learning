# Rilis simulator hypervisor aktif di LMS

Tanggal: 30 Oktober 2026. Situs: https://learning.tkjwikrama.my.id

Rilis aktif: `1873c40f2c74f5e8cdb98a3b0a27dd724fb55ca87d5efbf3f40c4ef77518707e`.

## Isi yang diterapkan

- Simulator instalasi Proxmox VE 8.1 dan ESXi 8.0, konfigurasi jaringan manajemen, verifikasi identitas host dan login.
- Panel manajemen, penyediaan ISO dataset, wizard VM yang berbeda per platform, konsol installer guest Ubuntu/Windows, boot disk serta snapshot/restore.
- Pengayaan materi dan screenshot aplikasi, penyederhanaan lab/toolbar konsep dan pembatasan aktivitas menurut materi dari sumber lokal terbaru.
- Proyek gabungan di LMS dibuka pada dialog dalam halaman native melalui tautan proyek pada modul terkait. Catatannya memakai namespace akun/modul yang sudah tersinkron ke database. Versi GitHub/lokal tetap menggunakan halaman proyek tersendiri.

Akses simulator: **Mesin Virtual Lanjutan: Proxmox VE dan VMware ESXi → bab yang memuat Proxmox/ESXi → Instalasi dan pengelolaan interaktif**. Urutan dan ID tahap lama dipertahankan. Bagian Proxmox berada di `konsep-2`, ESXi di `konsep-3`.

## Validasi sebelum dan sesudah aktivasi

- Model hypervisor: **343 pemeriksaan lulus**. Kompatibilitas lokal: **167 pemeriksaan lulus**. Model terminal: **205 pemeriksaan lulus**.
- Pengujian browser lokal terakhir yang sebelumnya tertunda berhasil dijalankan sebelum deployment: dua platform, guest Ubuntu dan Windows, penolakan disk/media/jaringan/login salah, snapshot, reload dan layar 390 piksel.
- Browser review native LMS lulus pada kedua platform sampai guest boot disk. Sesi host/guest tersimpan ke database akun dan dipulihkan setelah reload. Proyek terbuka di dialog native, tidak membuka HTML portal terpisah. Seluruh 56 halaman modul review memberikan respons sukses tanpa exception JavaScript pada pemeriksaan ini.
- Regresi LMS pada database uji terpisah: **172 tes, 2.011 assertion lulus**.
- Produksi setelah aktivasi: **56 modul, 642 tahap**, 19 Fase E dan 37 Fase F; 56 halaman native terverifikasi. Sepuluh kelas tidak memiliki prasyarat penugasan yang hilang.
- Rilis menyimpan **374 aset, 6.816.070 byte decoded** di database. Hash setiap aset aktif diperiksa.
- Seluruh **56 versi penilaian** dipertahankan. Pemeriksaan hash membuktikan **7 baris progres produksi** yang sudah ada tidak berubah; saat aktivasi terdapat nol baris snapshot produksi. Tidak ada hasil review atau nilai buatan yang dimasukkan ke akun produksi.
- Halaman login HTTPS valid dan mode maintenance sudah dimatikan kembali.

## Backup dan cakupan perubahan

Backup sebelum aktivasi: `/home/adminnazh/tjkt-lms-backups/hypervisor-20261030-20261030-012840`.

Aktivator memeriksa hash service dan manifest produksi sebelum bekerja. Pembaruan hanya mengganti manifest/aset serta pemetaan revisi konten; tidak menimpa Blade hasil terbaru di produksi. Database dicadangkan terlebih dahulu. ID modul, kunci progres, soal, ambang kelulusan dan mekanisme sertifikat tetap menggunakan versi penilaian sebelumnya.

## Batas

Simulator merekonstruksi alur produk dengan data dan command terbatas; bukan menjalankan kernel/hypervisor asli. Fitur yang belum dimodelkan tetap ditandai, termasuk cluster/HA/migration, semua konfigurasi storage serta vTPM host. Uji penerbitan ulang setiap sertifikat produksi tidak dilakukan menggunakan akun siswa; regresi pada database uji serta invariansi versi/progres dipakai untuk memeriksa kompatibilitas.

Artefak: `lms-hypervisor-activation-2026-10-30.json`, `lms-hypervisor-browser-review-2026-10-30.json`, `lms-hypervisor-production-verification-2026-10-30.json`, `lms-hypervisor-preservation-2026-10-30.json`.
