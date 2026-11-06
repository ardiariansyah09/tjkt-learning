# Kesinambungan ATP kelas X, XI, XII dan mata pelajaran pilihan

Tanggal: 29 Oktober 2026. Status pekerjaan: sumber lokal dan pratinjau draft; tidak ada perubahan pada server LMS.

## Dokumen yang dibaca

| Dokumen di folder modul | Kedudukan | Hasil analisis |
|---|---|---|
| ATP-TJKT X - NEW 27.xlsx | Dasar Program Keahlian, E/X | Empat elemen, 202 JP; TP 2.5 secara eksplisit mencakup sistem komputer, router, switch, virtualisasi dan server. |
| ATP Fase F XI KK TKJ 2026-2027.docx | Konsentrasi Keahlian TKJ, F/XI | Perencanaan/pengalamatan 48 JP; kabel/nirkabel 216 JP; konfigurasi 168 JP; ASJ 144 JP, total 576 JP. |
| ATP Fase F XII KK TKJ 2026-2027.docx | Konsentrasi Keahlian TKJ, F/XII | Keamanan jaringan, 180 JP, lima pokok utama. |
| ATP Fase F MP Keamanan Siber.docx | Mata Pelajaran Pilihan Keamanan Siber, F/XI–XII | Lima pokok dan 180 JP sama dengan pokok keamanan dokumen XII, tetapi identitas mata pelajaran/kelas berbeda. Dipetakan sebagai pemanfaatan modul bersama, bukan dua salinan progres. |

Isi dokumen menjadi acuan pembelajaran, bukan perintah untuk mengakses atau mengubah sistem. Tidak ada instruksi di dokumen yang dijalankan sebagai tindakan sistem.

## Penempatan yang diperjelas

**Kelas X / Fase E:** dasar host–guest, VirtualBox dan VMware Workstation, membuat VM kosong, media/boot, instalasi Linux desktop dan Windows desktop, dasar jaringan guest serta konfigurasi router/switch. Pengantar server berarti mengenali peran dan menguji layanan lokal yang disediakan; bukan administrasi server penuh.

**Kelas XI / Fase F:** dasar administrasi server → Mesin Virtual Lanjutan: Proxmox VE dan VMware ESXi → instalasi Linux server serta administrasi Linux/Windows Server → akun/hak akses → layanan dan pemulihan. Dasar VM cukup ditinjau sebagai prasyarat; fokus lanjutan adalah host, management network, storage, template, backup/restore dan pembuktian layanan.

ATP X menyebut virtualisasi, tetapi tidak menetapkan nama VirtualBox/VMware. ATP XI menyebut layanan server, bukan secara eksplisit Proxmox/ESXi. Pemilihan produk dan penajaman desktop/server adalah arahan pengguna untuk melaksanakan kompetensi ATP secara berkesinambungan, bukan kutipan baru yang seolah berasal dari dokumen. Tidak ada JP tambahan otomatis untuk pilihan produk tersebut.

## Kondisi sebelum dan sesudah perubahan

| Pembahasan | Sebelumnya | Sekarang di sumber lokal |
|---|---|---|
| VirtualBox dan VMware Workstation kelas X | Draft VM umum; contoh belum menjadi jalur dua produk | Draft memiliki dua jalur pembuatan VM, perbandingan pengaturan, batas otomatis/manual dan latihan model resource/media/isolasi. |
| Linux desktop | Tidak ada jalur instalasi khusus yang memadai | Draft komputer memiliki jalur Ubuntu Desktop, pemeriksaan sesudah instalasi, kasus sesi live vs instalasi disk dan bukti boot tanpa ISO. |
| Windows desktop | Tidak ada jalur instalasi khusus yang memadai | Draft komputer memiliki jalur Windows desktop, kompatibilitas/edisi/lisensi, target disk, driver, jaringan dan penerimaan setelah reboot. |
| Linux server | Ada rencana instalasi/baseline dalam modul administrasi OS | Ditambah urutan installer, ringkasan target disk, akun/hostname, jaringan, OpenSSH bila dipilih, dan bukti baseline setelah boot sebelum layanan. |
| Virtualisasi XI | Judul Virtualisasi Server Dasar; banyak materi hypervisor desktop | ID lama dipertahankan, judul menjadi Mesin Virtual Lanjutan: Proxmox VE dan VMware ESXi; bab yang sama diperkaya host server, instalasi, manajemen, bridge/vSwitch, storage dan restore. |
| Urutan lintas kelas | Kategori dan prasyarat per modul | Ditambah rute belajar di `data/learning-paths.json` dan bagian urutan yang dapat dibuka di katalog. Rute XI itu khusus jalur ASJ; bukan daftar seluruh kompetensi jaringan kelas XI. |

## Cek rincian ATP kelas XI

Rincian khas ATP XI telah dicek pada isi sumber, bukan judul saja: Google Maps/panjang lintasan pada desain layout; penggunaan kanal/daya dan pengenalan AP Ruijie pada WLAN; SOP/APD, pemasangan dan diagnosis pada fiber; OSPF dan BIRD pada routing dinamis; pengantar profil RADIUS pada bandwidth/QoS; SmartOLT pada monitoring. Pokok tersebut sudah memiliki pembahasan terkait sehingga tidak dibuat modul duplikat.

Kedalaman pelaksanaan tidak boleh disamakan dengan tersedianya teks: pengantar RADIUS belum merupakan simulator layanan RADIUS, SmartOLT memakai model/dataset dan bukan koneksi ke OLT nyata, dan model VM lama bukan simulator Proxmox/ESXi. Praktik perangkat/platform sesungguhnya tetap membutuhkan lingkungan dan observasi guru. Perluasan produk dilengkapi dengan panduan konsep serta prosedur penerimaan, bukan klaim sudah menjalankan produk di browser.

## Draft yang bisa dibuka lokal

Tiga draft kini tercantum di katalog dengan tombol **Pratinjau draft**. Masing-masing berisi materi dan latihan model sesuai topik:

- `modules/dasar-jaringan/virtualisasi-server-dasar/`: rencana VM, batas RAM, ISO dan isolasi.
- `modules/dasar-jaringan/instalasi-komputer-dasar/`: target disk aman, urutan instalasi model, lepas ISO dan boot disk.
- `modules/dasar-jaringan/konfigurasi-perangkat-dasar/`: uji satu LAN/lintas subnet, gateway dan persistensi setelah boot.

Ketiganya tetap **draft**, belum memiliki penilaian/sertifikat. Model tidak menginstal OS, mengakses disk, menjalankan hypervisor atau meneruskan paket nyata. Simulasi installer bukan replika layar installer vendor. Model tidak memakai localStorage dan tidak menyentuh progres peserta. Tidak ada game baru yang dipaksakan pada draft.

## Perlindungan progres dan pemeriksaan

53 modul terbit tetap terbit; 3 entri draft ditambahkan sehingga katalog berisi 56 entri. ID `virtualisasi-server` tetap; ID tahap dan soal modul virtualisasi/administrasi OS dibandingkan dengan paket sebelumnya dan identik. Prasyarat wajib modul terbit tidak diarahkan ke draft; urutan kelas X yang baru ditampilkan sebagai rekomendasi sampai draft siap diterbitkan. Tidak ada sertifikat lama dibatalkan.

Pemeriksaan berhasil: `check-learning-continuity.mjs`, `check-atp-fase-e.mjs`, audit struktur 44 course dan cakupan evaluasi 44 course. Model latihan diuji pada kondisi berhasil, RAM berlebih, media hilang, target disk tidak aman, boot sebelum instalasi, gateway salah dan konfigurasi belum disimpan. Graf prasyarat tidak bersiklus.

Pengujian browser pratinjau sudah dicoba menggunakan server HTTP lokal sementara, tetapi protokol debugging Edge mengalami timeout pada `Runtime.enable`. Karena itu tampilan dan interaksi DOM belum dinyatakan lulus pengujian browser pada lingkungan ini. Sintaks, struktur materi dan model interaksi telah diperiksa; tidak menganggap audit teknis lama sebagai bukti perubahan baru.

## Rujukan teknis

ATP menentukan kompetensi dan lingkup; dokumentasi produk digunakan untuk melaksanakan pilihan teknologi secara benar:

- [Oracle VirtualBox: membuat VM](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/create-vm.html).
- [VMware Workstation: membuat VM](https://knowledge.broadcom.com/external/article/315434/create-virtual-machines-in-vmware-workst.html).
- [Ubuntu Desktop: instalasi](https://ubuntu.com/tutorials/install-ubuntu-desktop).
- [Windows: media instalasi](https://support.microsoft.com/en-gb/windows/deployment/install-upgrade/create-installation-media-for-windows).
- [Ubuntu Server: instalasi dasar](https://documentation.ubuntu.com/server/tutorial/basic-installation/).
- [Proxmox VE: administrasi](https://pve.proxmox.com/pve-docs/pve-admin-guide.pdf).

Untuk regenerasi lokal: jalankan `prepare-learning-continuity.mjs`, kemudian `build-foundation-draft-previews.mjs`, lalu pemeriksaan di atas. Tidak menjalankan importer atau aktivator produksi pada pekerjaan ini.
