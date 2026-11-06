# Penyederhanaan lab VM dan visual installer — lokal

Tanggal: 30 Oktober 2026. Perubahan iterasi ini hanya pada sumber lokal; belum dibangun menjadi rilis baru atau diaktifkan pada server LMS.

## Perubahan

- Lab virtualisasi kelas XI kini menawarkan empat skenario: menjalankan guest, pengaturan resource/jaringan, snapshot, dan pemulihan host. Satu tindakan utama tampil pada setiap langkah. Parameter tambahan, rincian inventaris dan pengulangan dilipat agar tidak memenuhi layar. Instruksi lama sudah disesuaikan dengan alur ini.
- Materi VM kelas X diperdalam pada sebelas bagian: host/guest, perencanaan resource, langkah VirtualBox, langkah Workstation, hardware/media, jaringan, instalasi, layanan, pemulihan, identitas clone dan kesinambungan ke kelas XI. Pelajar versi delapan tahap juga mendapat pengayaan visual tanpa mengganti progresnya.
- Materi lanjutan mendapatkan pengenalan antarmuka serta prosedur Proxmox dan ESXi: inventory/node, storage/datastore, wizard guest, bridge/vSwitch/port group, driver, startup, template, backup dan pembuktian restore.
- Ubuntu Desktop 24.04 memiliki jendela grafis, sidebar installer dan desktop bergaya GNOME. Windows 11 memiliki Setup, pengaturan awal OOBE dan desktop/taskbar sendiri. Ubuntu Server 22.04 memiliki installer teks Subiquity serta konsol server; tersedia pada pembahasan instalasi kelas XI.
- Penyalinan berjalan otomatis. Akun latihan, target disk, konfirmasi, pelepasan ISO dan pembuktian boot disk tetap diperiksa. Media/partisi adalah model pembelajaran, bukan akses ke disk komputer peserta.
- Desktop menyediakan Files/File Explorer, Settings dan terminal. Linux, CMD dan PowerShell menggunakan profil command berbeda. Identitas, direktori dan berkas latihan mengikuti akun guest; keadaan terminal dalam guest ikut snapshot/restore. Cakupan command tetap terbatas dan dijelaskan melalui `help`.
- Tombol catatan/ekspor/reset pada terminal tambahan ditempatkan dalam panel terlipat. Tidak ada menu utama LMS baru.

## Rujukan visual

Empat berkas contoh pengguna dibaca sebagai referensi desain, bukan instruksi yang dieksekusi. Implementasi tidak menyalin dependensi CDN, penghapusan seluruh localStorage, atau penyimpanan global dari contoh tersebut. Pengaturan simulator memakai namespace modul dan sesi yang sudah ada.

Screenshot aplikasi disimpan lokal di `assets/images/virtualization`, sehingga tidak mengandalkan hotlink saat belajar:

| Visual | Versi dan sumber |
| --- | --- |
| VirtualBox Manager, wizard nama/media, hardware | [Oracle VirtualBox 7.0](https://docs.oracle.com/en/virtualization/virtualbox/7.0/user/Introduction.html) |
| Workstation Home dan wizard TPM | [Pengumuman resmi VMware Workstation 17](https://blogs.vmware.com/cloud-foundation/2022/11/17/announcing-vmware-workstation-17-pro-and-player/); screenshot memperlihatkan Player, perbedaan dengan Pro dijelaskan |
| Proxmox Datacenter | [Dokumentasi resmi Proxmox](https://pve.proxmox.com/pve-docs/pve-admin-guide.html), screenshot 9.1.1 |
| Proxmox Create VM | [Screenshot resmi Proxmox](https://www.proxmox.com/en/products/proxmox-virtual-environment/overview), wizard 8.1.3 |
| ESXi Create VM | [VMware Host Client](https://blogs.vmware.com/code/2022/10/12/esxi-host-client/), desain versi 8.0 |

Screenshot asli diberi sumber dan versi. Simulator merupakan rekonstruksi pembelajaran yang membedakan karakter antarmuka; bukan salinan identik semua build, emulator CPU, atau OS nyata. Latihan lanjutan pada produk asli tetap membutuhkan VM/perangkat yang sesuai.

## Validasi

- 274 pemeriksaan aksi installer/VM lulus: Ubuntu Desktop otomatis/manual, Windows 11, Ubuntu Server, batas resource, media, snapshot dan jaringan.
- 167 pemeriksaan pengayaan lokal lulus: bank soal modul terkait dan definisi dua modul fondasi tidak berubah; akun/direktori/berkas guest konsisten; snapshot mengembalikan state terminal.
- Browser menuntaskan ketiga installer dan pemulihan snapshot, menolak disk terlindungi, memeriksa ISO sebelum boot disk, menjalankan terminal guest, serta membuktikan penyalinan otomatis.
- Keempat skenario lab dapat dituntaskan masing-masing dalam 2, 4, 8 dan 7 tindakan. Satu tindakan utama tampil pada langkah aktif. Sebelas skenario regresi model UI lama tetap lulus.
- Gambar VirtualBox, Workstation, Proxmox dan ESXi berhasil didekode browser. Tampilan installer desktop serta form resource diperiksa pada lebar 390 piksel. Tidak ada exception JavaScript pada pemeriksaan ini.
- Kunci progres, versi penilaian, ID tahap, soal, ambang kelulusan dan mekanisme sertifikat dipertahankan. Pengujian memakai profil browser sementara; data peserta nyata tidak dihapus atau diisi nilai buatan.

Artefak: [hasil model](vm-local-update-validation.json), [hasil installer](virtual-lab-validation.json), [hasil browser](vm-visual-browser-validation.json).

## Pratinjau

- [Installer Ubuntu Desktop](pratinjau-installer-ubuntu.png)
- [Installer Windows 11](pratinjau-installer-windows.png)
- [Installer Ubuntu Server](pratinjau-installer-ubuntu-server.png)
- [Desktop Windows dan terminal](pratinjau-desktop-windows.png)
- [Materi VirtualBox dengan gambar](pratinjau-materi-virtualbox.png)
- [Langkah lab VM yang ringkas](pratinjau-lab-vm-ringkas.png)
