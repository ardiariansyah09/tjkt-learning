# Praktikum Proxmox VE dan ESXi di browser

Perubahan lokal pada 30 Oktober 2026. Belum dibangun atau diaktifkan menjadi rilis server LMS.

## Lokasi

Buka modul **Mesin Virtual Lanjutan: Proxmox VE dan VMware ESXi**, lalu bab **RAM, vCPU, dan Kapasitas Storage** untuk praktikum Proxmox, atau bab konsep berikutnya yang memuat visual ESXi untuk praktikum ESXi. Simulator berada pada bagian **Instalasi dan pengelolaan interaktif**. ID dan urutan tahap lama dipertahankan; penempatan mengikuti bagian pengayaan yang sudah ada. Materi instalasi tertulis tampil sebelum simulator.

Halaman lokal: `modules/administrasi-server/virtualisasi-server/index.html`.

## Kemampuan yang tersedia

- Proxmox VE 8.1: boot installer grafis, persetujuan latihan, disk, filesystem satu disk, lokasi/keyboard, identitas administrator, jaringan manajemen, ringkasan, instalasi otomatis, pelepasan media dan boot disk.
- ESXi 8.0: installer konsol, welcome, lisensi, disk, keyboard, identitas root, konfirmasi, instalasi otomatis, pelepasan media, reboot, DCUI/F2 dan penerapan jaringan manajemen.
- Browser operator model memeriksa keterjangkauan host, identitas sertifikat dan login. Proxmox menggunakan port 8006 serta realm Linux PAM; ESXi memakai Host Client `/ui`.
- Menu storage menyediakan ISO dataset. Wizard Proxmox dan ESXi memiliki langkah berbeda. Guest baru mempunyai disk kosong; memilih hypervisor atau menekan Finish tidak dianggap memasang OS guest.
- Start/Power on menghubungkan konsol dengan installer Ubuntu Desktop atau Windows 11 yang sudah tersedia. Sesudah instalasi, guest harus melepas ISO dan boot disk. Terminal serta identitas akun guest ikut tersimpan pada VM host model.
- Pengaturan media saat OFF, pembatasan RAM aktif, satu snapshot offline dan restore guest saling terhubung dengan state host.
- Kesalahan dapat dicoba: disk terlindungi, gateway beda subnet, NIC tanpa jalur operator, password dataset salah, sertifikat belum diverifikasi, ISO belum tersedia, VM tanpa media, resource tidak cukup dan restore saat ON.
- Sesi host, draft wizard dan guest dipulihkan setelah reload. Namespace terpisah untuk Proxmox/ESXi; reset host tidak menghapus nilai, progres modul atau sertifikat.

## Cara mencoba

1. Ikuti satu tindakan pada layar installer. Disk 0 adalah target kosong; Disk 1 berisi data terlindungi.
2. Gunakan sandi **dataset publik** yang ditampilkan di simulator, bukan sandi pribadi. Nilai password input tidak disimpan.
3. Setelah instalasi, lepas media dan reboot. Pada ESXi, buka F2 dan siapkan management network sebelum membuka web.
4. Uji koneksi dari operator dataset `192.0.2.10/24`, verifikasi identitas host, lalu login.
5. Buka Storage dan sediakan ISO dataset. Buka Create VM / Create/Register VM, isi wizard sesuai guest, lalu Finish.
6. Pilih VM, Start/Power on, lanjutkan instalasi OS di Console, lepas media guest dan buktikan boot disk.
7. Untuk snapshot, matikan guest terlebih dahulu, ambil snapshot, ubah berkas guest setelah boot, lalu matikan dan restore. Periksa versi berkas setelah boot kembali.

## Batas kesetaraan produk

Simulator adalah rekonstruksi interaktif alur versi acuan, bukan hypervisor, kernel atau jaringan OS asli. Ini memungkinkan latihan keputusan dan hasil tanpa memasang produk, tetapi tidak mencakup setiap menu, hardware dan error produk.

DCUI network menyatukan formulir IPv4/DNS yang pada ESXi asli berada dalam submenu terpisah. Memory Proxmox ditampilkan dalam MiB. Opsi storage ext4/xfs menggunakan dataset satu disk; ZFS/RAID, cluster, Ceph, HA, migration, vCenter, IPv6/VLAN, passthrough dan TPM/vTPM host belum dimodelkan. Guest Windows menggunakan bantuan profil UEFI/TPM latihan yang dinyatakan pada petunjuk. Tidak ada ISO berlisensi yang diunduh atau kernel yang dieksekusi.

Screenshot aplikasi asli di materi merupakan referensi visual dengan versi/sumber tersendiri. Screenshot tersebut tidak membuktikan seluruh fungsi simulator identik dengan produk.

## Verifikasi

- **343 pemeriksaan model** lulus: instalasi dua platform, gerbang autentikasi, validasi jaringan, pembuatan guest, penolakan state tidak cocok, snapshot, pemulihan sesi dan penolakan bentuk data sesi tidak valid.
- **Pengujian browser sebelumnya lulus** pada dua platform: disk/media/network/login guard; wizard VM masing-masing; guest Ubuntu dan Windows hingga boot disk; terminal guest; snapshot/restore; pemulihan setelah reload; layar 390 piksel dan penyimpanan tidak terkait tetap utuh.
- **167 pemeriksaan kompatibilitas lokal** serta **274 pemeriksaan VM/installer lama** lulus. Soal, ID tahap dan definisi progres lama yang diperiksa tetap sama.
- Setelah hasil browser tersebut, kontras konsol ESXi dan validasi data sesi diperketat. Pemeriksaan model/sintaks terbaru lulus. **Pengujian browser ulang untuk revisi terakhir belum dijalankan**, karena automatic approval review gagal akibat batas penggunaan. Penolakan menyatakan pemeriksaan persetujuan tidak dapat diselesaikan, bukan penetapan bahwa tindakan tidak aman. Hasil browser terdahulu tidak diklaim sebagai bukti revisi terakhir.

Artefak: `hypervisor-model-validation.json`, `hypervisor-browser-validation.json`, `vm-local-update-validation.json`, `virtual-lab-validation.json`.

Pratinjau dari browser sebelum revisi kontras terakhir:

- [Installer Proxmox](pratinjau-proxmox-installer.png)
- [Panel Proxmox](pratinjau-proxmox-manager.png)
- [Console guest pada Proxmox](pratinjau-proxmox-guest.png)
- [Installer ESXi](pratinjau-esxi-installer.png)
- [Host Client ESXi](pratinjau-esxi-manager.png)
- [Console guest pada ESXi](pratinjau-esxi-guest.png)

## Rujukan

- https://www.proxmox.com/en/products/proxmox-virtual-environment/get-started
- https://github.com/proxmox/pve-docs/blob/master/pve-installation.adoc
- https://knowledge.broadcom.com/external/article/334435/methods-for-installing-esxi-60.html
- https://knowledge.broadcom.com/external/article?legacyId=1006710
- https://blogs.vmware.com/code/2022/10/12/esxi-host-client/
