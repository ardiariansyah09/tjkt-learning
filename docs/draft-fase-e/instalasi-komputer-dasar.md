# Draft — Instalasi dan Konfigurasi Dasar Sistem Komputer

Status: **draft materi; belum diterbitkan, belum menjadi aktivitas bernilai/bersertifikat**.
Acuan: ATP kelas X 2026–2027, elemen Kecakapan Kerja Dasar, TP 2.5; K3 dan laporan mengacu TP 2.1–2.4. Alokasi JP ditentukan dalam pembagian 24 JP elemen, bukan tambahan otomatis di luar ATP.

## Tujuan dan prasyarat

Peserta mampu menjelaskan hubungan komponen–firmware–OS–driver–aplikasi, merencanakan instalasi pada target latihan, mengonfigurasi antarmuka klien, dan menunjukkan hasil uji setelah mulai ulang. Prasyarat: K3LH; pengenalan perangkat; konsep IP sebelum konfigurasi jaringan. Tidak memerlukan modul administrasi server kelas XI.

## 1. Orientasi: komputer menyala belum tentu siap dipakai

Kasus: PC perpustakaan menyala, tetapi sistem operasi gagal dimuat. Setelah media boot diperbaiki, OS berjalan tetapi NIC belum dapat digunakan. Setelah driver sesuai tersedia, akses web tetap gagal karena DNS salah. Ketiga gejala berasal dari lapisan berbeda; mengganti RAM bukan jawaban otomatis.

Tulis tiga dugaan, bukti pembeda dan batas tindakan siswa. Produk akhir: inventaris, rencana instalasi, tabel konfigurasi, hasil uji dan satu laporan pemulihan. Guru menyetujui mesin/VM dan target disk sebelum praktik.

## 2. Komponen, kompatibilitas dan pemeriksaan awal

CPU menjalankan instruksi; RAM menyimpan keadaan kerja sementara; penyimpanan menampung OS dan data; NIC menghubungkan host dengan jaringan. Firmware menginisialisasi perangkat dan memulai proses boot. OS mengelola sumber daya; driver menghubungkan pengelolaan OS dengan perangkat yang didukung. Kapasitas besar tidak memperbaiki ketidakcocokan arsitektur atau driver.

Periksa model, CPU/arsitektur, RAM, kapasitas disk, firmware, NIC dan dukungan OS dari dokumentasi perangkat. Bedakan kapasitas disk dengan ruang kosong. Catat kebutuhan minimum dan ruang untuk penggunaan nyata; minimum instalasi bukan janji performa. Jangan membuka PSU atau menangani perangkat berenergi. Penanganan komponen hanya setelah guru mengamankan perangkat sesuai SOP.

Latihan: cocokkan kebutuhan ruang belajar dengan dua spesifikasi fiktif. Tandai informasi yang belum diketahui. Hasil yang dinilai adalah alasan kompatibilitas, bukan memilih spesifikasi paling mahal.

## 3. Persiapan media dan rencana instalasi

Gunakan media resmi dengan lisensi/izin yang sesuai; catat versi dan verifikasi integritas jika checksum tepercaya tersedia. Tentukan mesin target, nama inventaris, media boot, firmware dan disk target. UEFI dan legacy boot berbeda; pengaturan mengikuti dukungan OS serta perangkat. Jangan mengubah Secure Boot atau firmware tanpa alasan dan persetujuan guru.

Pemasangan OS dan partisi dapat menghapus data. Gunakan VM dengan disk latihan kosong agar tidak menyentuh disk pengguna. Pada mesin fisik, guru memastikan identitas disk, izin, cadangan dan cara pemulihan. Cadangan baru dapat dipercaya sesuai cakupan setelah isinya diperiksa dan pemulihannya diuji.

Checklist sebelum mulai: target disetujui; data penting terlindungi; media diketahui; daya stabil; akun latihan disiapkan; rencana jaringan terisolasi; prosedur kembali tersedia. Berhenti bila satu butir kritis belum jelas.

## 4. Instalasi, akun dan driver

Pada VM kosong yang disediakan guru: pasang media, jalankan installer, konfirmasi disk virtual, tentukan bahasa/waktu, buat akun latihan sesuai kebijakan, ikuti installer dan catat keputusan. Nama menu berbeda antar-OS/versi; dokumentasikan versi yang dipakai. Setelah selesai, lepaskan media boot sesuai pengelola dan mulai ulang untuk membuktikan boot dari disk.

Periksa versi OS, disk, perangkat dan NIC. Gunakan driver serta pembaruan dari sumber yang disetujui. Jangan memasang paket driver acak untuk menghilangkan tanda peringatan. Akun sehari-hari berbeda dari hak administrasi; jangan menaruh sandi dalam laporan. Tidak perlu bergabung ke domain atau memasang layanan produksi pada tahap dasar ini.

## 5. Konfigurasi klien dan diagnosis berlapis

Skenario terisolasi: klien 192.168.10.10/24, gateway 192.168.10.1 dan resolver lab 192.168.10.2 yang benar-benar disediakan guru. Jika resolver belum tersedia, tandai uji nama belum dapat dilakukan; jangan mengarang hasil. Pilih statis atau DHCP sesuai rancangan, bukan mengaktifkan keduanya tanpa memahami keadaan antarmuka.

Urutan bukti: antarmuka/link; alamat/prefix; gateway; tujuan lokal; tujuan antarsegmen jika tersedia; query nama; aplikasi. Pada Windows alat baca dapat berupa ipconfig dan nslookup; pada Linux ip address, ip route dan alat resolver yang tersedia. Nama antarmuka, pengelola jaringan dan cara menyimpan pengaturan berbeda menurut OS. Ping gagal tidak selalu berarti host mati karena kebijakan ICMP dapat membatasi respons.

## Jalur praktik A — Instalasi Linux desktop di kelas X

Gunakan Ubuntu Desktop sebagai contoh, bukan menyamakan semua distribusi Linux. Guru menetapkan versi/media resmi dan memeriksa kebutuhan resource sesuai versi tersebut. Siapkan VM kosong dengan nama berbeda dari VM Windows, disk virtual khusus, media ISO dan jaringan lab yang disetujui. Baca checksum dari penerbit dan cocokkan hasilnya sebelum digunakan.

Langkah: mulai VM dari ISO; pilih bahasa/keyboard; pilih alur instalasi; tentukan opsi jaringan sesuai fasilitas; identifikasi target disk virtual; baca ringkasan perubahan; buat akun latihan; tinjau lokasi/waktu jika diminta; jalankan pemasangan; mulai ulang dan lepaskan ISO ketika prosedur mengharuskan. Pilihan menghapus disk hanya untuk disk virtual kosong yang telah diverifikasi guru. Jika installer menyediakan sesi mencoba desktop, itu bukan bukti OS sudah terpasang pada disk.

Sesudah boot, masuk ke desktop, periksa versi, akun, ruang disk, NIC serta pengaturan jaringan. Bedakan pengelola berkas dari terminal; latih perintah baca pwd, ls dan identitas OS. Periksa pembaruan melalui fasilitas resmi bila repository dapat dijangkau. Integrasi guest mengikuti hypervisor dan OS yang dipakai, bukan memasang semua paket tanpa kebutuhan. Buktikan boot lagi tanpa ISO dan satu tugas pengguna seperti membuat berkas latihan serta membuka aplikasi lokal.

Kasus diagnosis: desktop dapat dipakai dari sesi ISO tetapi tidak boot ketika ISO dilepas. Periksa apakah instalasi ke disk sudah dilakukan dan media boot benar, sebelum mengganti OS. Bukti penerimaan harus menampilkan versi OS terpasang, disk, hasil boot tanpa ISO dan satu tugas yang tetap tersedia setelah reboot.

Referensi: [panduan instalasi Ubuntu Desktop](https://ubuntu.com/tutorials/install-ubuntu-desktop). Urutan layar dapat berubah; catat versi yang digunakan.

## Jalur praktik B — Instalasi Windows desktop di kelas X

Windows desktop dan Windows Server adalah produk/tujuan berbeda. Gunakan media Windows desktop resmi dengan edisi, lisensi serta dukungan yang disetujui sekolah. Guru memastikan arsitektur, firmware, TPM/Secure Boot virtual jika dipersyaratkan, RAM dan disk memenuhi kebutuhan versi. Jangan melewati pemeriksaan kompatibilitas dengan modifikasi tidak resmi.

Pada VM khusus kosong: pasang ISO; boot installer; pilih bahasa/keyboard; pilih alur instalasi yang tepat; tentukan edisi sesuai hak penggunaan; baca ketentuan; identifikasi disk virtual dan tinjau perubahan partisi; jalankan instalasi; selesaikan pengaturan awal akun, privasi dan jaringan sesuai kebijakan sekolah. Jangan memasukkan akun pribadi pada layar yang direkam. Persyaratan aktivasi atau koneksi mengikuti edisi/versi, bukan diasumsikan sama untuk semua media.

Sesudah boot, periksa edisi/build, status aktivasi sesuai lisensi, perangkat/driver, jaringan dan pembaruan resmi. Gunakan Device Manager untuk memeriksa perangkat, pengelola disk untuk membaca volume dan ipconfig untuk konfigurasi jaringan. Latih lokasi berkas serta hak pengguna; hak admin tidak diperlukan untuk semua tugas. Guest tools dipasang hanya dari sumber hypervisor yang sesuai dan bila diperlukan.

Kasus diagnosis: Windows boot tetapi NIC tidak dikenali. Cocokkan dukungan adapter virtual dan driver, jangan mengubah DNS sebagai jawaban pertama. Ulangi boot tanpa ISO dan buktikan berkas latihan serta konfigurasi tetap ada. Gunakan tabel perbandingan Linux desktop/Windows: media, akun, alat inspeksi, driver, pembaruan dan bukti penerimaan. Penilaian berfokus pada alasan keputusan, bukan menghafal tampilan installer.

Referensi: [media instalasi Windows](https://support.microsoft.com/en-gb/windows/deployment/install-upgrade/create-installation-media-for-windows) dan [instalasi ulang Windows](https://support.microsoft.com/en-US/Windows/deployment/install-upgrade/reinstall-windows-with-the-installation-media).

## 6. Eksperimen dan penerimaan

Rancangan simulasi interaktif: panel boot, media, disk virtual, status driver/NIC, IP/prefix/gateway/DNS dan hasil uji per lapisan. Siswa mengubah satu kondisi, menekan **Uji**, lalu melihat bukti yang berubah. Simulator belum dibuat dalam draft ini; jangan menampilkan nilai otomatis untuk aktivitas yang belum tersedia.

Praktik VM yang dapat dipandu guru: (1) buktikan baseline sehat; (2) ubah DNS ke nilai salah yang disediakan guru dan bandingkan IP langsung dengan query nama; (3) kembalikan konfigurasi, uji ulang dan mulai ulang VM. Catat sebelum–sesudah. Perubahan boot/driver berisiko dilakukan melalui dataset kasus, bukan merusak mesin nyata.

Kriteria: OS boot dari disk; NIC dikenali; konfigurasi sesuai rencana; uji layanan yang tersedia berhasil; konfigurasi tetap benar sesudah boot; hasil gagal dapat dijelaskan tanpa mengganti semua komponen. Bukti diambil dari lingkungan sebenarnya atau diberi label data contoh.

## 7. Refleksi, asesmen dan pengembangan berikutnya

Kasus transfer: klien dapat membuka server dengan IP tetapi nama gagal. Peserta menyebut bukti, menguji resolver dan menghindari instal ulang OS tanpa alasan. Nilai melalui empat dimensi 0–3: ketepatan konfigurasi, bukti uji, keselamatan/pemulihan, penjelasan. Asesmen praktik memakai observasi guru; kuis LMS kelak tidak menggantikannya. Tidak ada game wajib bila tidak memperjelas konsep.

Laporan satu halaman: tujuan; mesin/versi; langkah penting; input; hasil asli; satu kegagalan; perbaikan; hasil uji ulang; batas kesimpulan. Jangan sertakan kredensial atau data pribadi.

Referensi pelaksanaan yang harus dipilih sesuai OS/versi saat implementasi: dokumentasi resmi instalasi OS, manual perangkat dan SOP lab sekolah. Draft ini belum mengunci distribusi/versi sehingga belum menyediakan perintah instalasi yang dapat disalahgunakan pada disk nyata.
