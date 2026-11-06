# Draft — Dasar Mesin Virtual: VirtualBox dan VMware Workstation

Status: **draft materi; belum diterbitkan, belum menjadi aktivitas bernilai/bersertifikat**.
Acuan: ATP kelas X TP 2.5 dengan K3 serta laporan TP 2.1–2.4. Pendalaman administrasi server tetap berada pada Fase F. Alokasi JP merupakan bagian elemen kecakapan kerja dasar.

## Tujuan dan prasyarat

Peserta membedakan host–hypervisor–guest, menyiapkan VM dengan resource wajar dan jaringan terisolasi, memeriksa OS guest, serta menunjukkan satu layanan lokal dari klien. Prasyarat: instalasi komputer, IP dan layanan dasar. Tidak memerlukan domain, panel hosting, cloud publik atau layanan Internet nyata.

## 1. Orientasi: server adalah peran layanan

Sekolah membutuhkan halaman latihan di lab. Satu laptop host menjalankan VM server dan VM klien. Host, OS guest dan aplikasi server adalah lapisan berbeda. Guest berhasil boot belum membuktikan layanan terpasang; proses aktif belum membuktikan klien dapat mengaksesnya.

Produk: diagram host/guest/jaringan, inventaris resource, hasil uji layanan dan laporan pemulihan. Semua data contoh; tidak ada akun produksi. Guru menentukan platform, image dan layanan yang benar-benar tersedia.

## 2. Resource dan pembuatan VM

### Jalur VirtualBox

Identifikasi versi pengelola dan kemampuan host. Buat VM baru, beri nama serta folder yang jelas, pilih tipe OS/arsitektur dan ISO, lalu tentukan RAM, CPU serta disk kosong sesuai kebutuhan guest dan kapasitas host. Untuk belajar urutan installer, gunakan instalasi manual bila opsi tersebut tersedia; instalasi otomatis tidak menjadi bukti siswa memahami setiap keputusan installer.

Periksa Settings sebelum power-on: storage/media, urutan boot, firmware dan adapter jaringan. Setelah memasang OS melalui modul instalasi komputer, lepaskan ISO sesuai prosedur, boot dari disk, dan buktikan OS serta jaringan bekerja. Dokumentasikan pengaturan dalam tabel; nama VM pada pengelola dibedakan dari hostname guest. Jangan menganggap semua versi menampilkan dialog yang sama.

### Jalur VMware Workstation

Pilih pembuatan VM baru pada VMware Workstation yang disetujui sekolah. Pilih instalasi manual atau pemasangan OS kemudian bila ingin mempelajari installer, tentukan jenis guest/versi, folder VM, resource, disk dan jaringan sesuai rancangan. Periksa kembali konfigurasi sebelum power-on. Easy Install dapat mengotomatisasi langkah tertentu; catat bila digunakan dan bedakan dari instalasi interaktif.

VMware Workstation di komputer desktop berbeda dari VMware ESXi di kelas XI. VMX/config, disk virtual dan guest tools mempunyai peran berbeda. Jangan memindahkan file disk saja lalu menyatakan migrasi selesai; verifikasi dukungan format, firmware, NIC, identitas OS dan hasil boot. Penggunaan produk/media mengikuti kebijakan sekolah serta ketentuan penyedia yang berlaku.

### Perbandingan yang harus dibuktikan

Pada kedua produk, buat satu VM kosong, temukan tempat mengatur RAM/disk/media/NIC, jalankan instalasi guest dari modul berikutnya, lalu bandingkan shutdown dan pelepasan ISO. Isi tabel tindakan–lokasi pengaturan–akibat–bukti. NAT biasa, host-only dan segmen internal/LAN segment tidak disamakan hanya dari nama; periksa arah akses host/peer/LAN sesuai dokumentasi produk. Menyalakan VM bukan bukti OS sudah terpasang.

Referensi: [membuat VM VirtualBox](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/create-vm.html) dan [membuat VM VMware Workstation](https://knowledge.broadcom.com/external/article/315434/create-virtual-machines-in-vmware-workst.html).

RAM/CPU/disk virtual berasal dari resource host. Jangan mengalokasikan seluruh RAM host pada guest. Disk virtual memiliki kapasitas logis dan penggunaan storage host yang dapat berbeda; ruang kosong dalam guest tidak selalu sama dengan ruang host. Catat kebutuhan OS, kapasitas host dan cadangan untuk host tetap bekerja.

Urutan: pilih nama inventaris; tentukan OS/arsitektur serta firmware; buat disk latihan; pasang media resmi; pilih mode jaringan; instal sesuai draft komputer atau gunakan template yang jelas asalnya. Template siap pakai berbeda dari keterampilan memasang OS. Catat mana yang dilakukan dan mana yang disediakan guru.

Mulai ulang dan shutdown guest dengan prosedur OS. Menutup jendela VM dapat berarti menyimpan keadaan, mengirim shutdown atau memutus daya bergantung pilihan; jangan menyamakan semua tindakan.

## 3. Jaringan terisolasi dan identitas guest

Pada platform yang dipilih, guru menyiapkan satu segmen internal/terisolasi untuk guest server dan klien. Nama serta perilaku mode berbeda antarplatform. Bridged dapat menghubungkan guest ke LAN nyata sehingga tidak digunakan tanpa izin. Jangan menjalankan DHCP latihan ke jaringan sekolah.

Contoh: server 192.168.50.10/24 dan klien 192.168.50.20/24 pada segmen internal yang sama. Untuk uji satu subnet tidak diperlukan gateway Internet. Resolver tidak perlu diisi sembarang bila latihan memakai IP langsung. Nama VM pada pengelola tidak otomatis menjadi hostname atau alamat IP guest.

Latihan: bandingkan dua guest pada segmen yang sama dengan dua guest yang nama jaringannya berbeda. Periksa status NIC, alamat dan subnet sebelum menuduh aplikasi server rusak.

## 4. Satu layanan lokal dan bukti dari klien

Guru menyediakan image dengan layanan web latihan dan file halaman sintetis, atau panduan pemasangan sesuai OS/versi yang dipilih. Bedakan paket, file konfigurasi, proses, listener, aturan akses dan respons aplikasi. Draft ini belum menetapkan paket/perintah instalasi tertentu agar tidak mengasumsikan lingkungan yang belum dipilih.

Target contoh HTTP 192.168.50.10 port 8080. Periksa layanan dari guest server, kemudian dari klien di segmen yang sama. Listener hanya loopback dapat melayani pengujian lokal tetapi menolak klien. Kebijakan firewall disesuaikan hanya untuk layanan/sumber latihan, bukan dimatikan seluruhnya. HTTP digunakan hanya pada data sintetis di lab terisolasi, tanpa kredensial nyata.

Bukti: URL/alamat tujuan, waktu, respons yang diterima, keadaan proses/listener, aturan yang relevan dan batas tes. Halaman lama dari cache bukan selalu bukti server saat ini sehat; lakukan pengujian baru yang dapat ditelusuri.

## 5. Snapshot, cadangan dan pemulihan

Snapshot menyimpan keadaan menurut fitur hypervisor dan dapat bergantung pada disk host yang sama; bukan otomatis cadangan terpisah. Salinan VM, backup file konfigurasi dan backup data mempunyai cakupan berbeda. Tentukan kebutuhan pulih dan periksa apa yang benar-benar disalin.

Sebelum latihan gangguan, simpan baseline yang disetujui. Ubah satu pengaturan layanan pada lingkungan latihan, amati kegagalan, pulihkan dan uji lagi dari klien. Pemulihan berhasil hanya setelah layanan dan data yang dibutuhkan diverifikasi; tombol restore selesai belum cukup.

## 6. Eksperimen interaktif yang direncanakan

Simulator khusus topik: dua VM, batas resource host, pilihan segmen NIC, IP guest, proses/listener, uji lokal/klien dan pilihan baseline. Tindakan mengubah state dan menghasilkan jejak sebab kegagalan. Sediakan tujuan, kondisi awal, langkah pertama dan kriteria berhasil pada satu panel singkat. Ini rancangan draft, belum fitur aktif.

Percobaan: (1) baseline dua guest satu segmen dan layanan sehat; (2) pindahkan NIC klien ke segmen berbeda lalu uji, kembalikan; (3) batasi listener ke loopback lalu bandingkan lokal/klien, pulihkan. Pada praktik nyata guru memilih cara aman sesuai produk. Catat tiga pasangan prediksi–bukti, tanpa harus mengerjakan menu tambahan yang panjang.

## 7. Penerimaan dan asesmen

Kriteria: resource tidak melebihi rencana; guest boot; segmen dan IP benar; layanan diuji lokal dan dari klien; kegagalan dibedakan menurut lapisan; pemulihan diuji; konfigurasi dan autostart diperiksa setelah boot sesuai tujuan. Tidak menyatakan kompeten cloud atau administrasi server penuh hanya dari satu lab.

Kasus transfer: server dapat membuka halaman sendiri tetapi klien gagal. Peserta menyusun urutan pemeriksaan link/segmen, alamat, listener dan kebijakan, lalu memilih bukti pembeda. Guru menilai 0–3 pada pemetaan lapisan, konfigurasi, kualitas uji/pemulihan dan dokumentasi. Game tidak wajib; baru dibuat jika mekaniknya membantu konsep dan mempunyai petunjuk jelas.

Laporan satu halaman: host/platform; dua guest; diagram; parameter; hasil lokal/klien; satu gangguan; pemulihan; uji ulang dan keterbatasan. Referensi implementasi: manual resmi hypervisor, OS dan aplikasi pada versi yang dipilih, ditambah SOP sekolah.
