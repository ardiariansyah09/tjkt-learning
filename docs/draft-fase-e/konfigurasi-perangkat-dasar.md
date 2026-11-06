# Draft — Konfigurasi Dasar Router dan Switch

Status: **draft materi; belum diterbitkan, belum menjadi aktivitas bernilai/bersertifikat**.
Acuan: ATP kelas X, TP 2.5; TP 2.1–2.4 untuk keselamatan dan laporan; TP 3.1–3.3 sebagai penerapan pendukung. Tidak menambah TP di luar ATP. JP dibagi dari alokasi elemen bersama guru.

## Tujuan dan prasyarat

Setelah K3LH, perangkat jaringan dan IP dasar, peserta merencanakan identitas serta akses administrasi, mengatur antarmuka sesuai fungsi perangkat, menyimpan konfigurasi dan membuktikan komunikasi setelah mulai ulang. Lingkup: satu switch L2 dan satu router lab; VLAN kompleks, routing dinamis, NAT Internet dan hardening lanjutan berada pada Fase F.

## 1. Orientasi dan skenario

PC A 192.168.10.10/24 dan PC B 192.168.10.20/24 terhubung melalui switch lab. Router LAN 192.168.10.1/24 menjadi gateway menuju segmen server 192.168.20.0/24; interface router kedua 192.168.20.1/24 dan server contoh 192.168.20.10/24. Kedua segmen terisolasi dari sekolah. Guru menyediakan server beserta layanan uji atau menandainya belum tersedia.

Pertanyaan: mengapa A dapat berbicara dengan B tetapi belum tentu dengan server? Susun diagram, tabel alamat, izin perubahan dan kriteria penerimaan. Konektor yang cocok belum menjelaskan seluruh konfigurasi logis.

## 2. Akses awal, inventaris dan identitas

Catat vendor/model/versi, kemampuan perangkat, port dan metode akses yang didukung. Console, web dan SSH mempunyai prasyarat berbeda. Gunakan akun berizin; verifikasi perangkat tujuan sebelum mengubah konfigurasi. Nama perangkat memudahkan identifikasi tetapi tidak otomatis memberi alamat atau mengubah rute.

Hindari memakai akun bawaan tanpa pengamanan sesuai kebijakan. Kredensial tidak dipublikasikan dalam tangkapan layar. Pengaturan akses administrasi harus diuji dari sumber yang diizinkan serta sumber yang ditolak. Cadangkan konfigurasi awal sesuai perangkat dan siapkan console/pemulihan agar perubahan akses tidak mengunci pengelola.

## 3. Switch layer 2 dan alamat manajemen

Switch L2 meneruskan frame pada domain link/VLAN sesuai konfigurasi. Ia tidak membutuhkan alamat IP pada setiap port untuk melakukan switching dasar. Alamat manajemen, jika didukung, digunakan untuk mengelola perangkat; keberadaannya tidak mengubah switch L2 menjadi router.

Pada lab, guru menetapkan port akses pada satu domain/VLAN latihan dan status aktif. Catat hubungan port dengan PC. Alamat manajemen contoh 192.168.10.2/24 harus unik. Gateway manajemen diperlukan bila pengelolaan dilakukan dari luar subnet dan perangkat mendukungnya. Jangan memasang VLAN/trunk pada jaringan sekolah untuk mencoba-coba.

Latihan: gambarkan alur A–B dan bedakan alamat MAC tujuan frame dari IP tujuan paket. Jika manajemen switch gagal tetapi A–B berhasil, jangan langsung menyimpulkan fungsi switching rusak.

## 4. Router dan gateway

Router menghubungkan subnet melalui interface dan tabel routing. Tetapkan dua interface sesuai rancangan, periksa status link dan rute jaringan yang langsung terhubung. Klien memakai gateway di subnet lokal; gateway bukan DNS. Server juga memerlukan jalur kembali agar komunikasi dua arah berhasil.

Untuk skenario dua subnet yang langsung terhubung, jangan menambahkan NAT atau routing dinamis tanpa kebutuhan. Fitur firewall/default policy dapat memengaruhi akses; periksa aturan dan lingkup izin. Jangan mematikan seluruh firewall untuk membuat satu tes lolos. Sintaks dan mekanisme penyimpanan mengikuti platform yang dipilih guru.

## 5. Perubahan aktif, penyimpanan dan boot

Konfigurasi yang berlaku sekarang belum tentu bertahan setelah mulai ulang. Sebagian perangkat membedakan running/startup configuration; perangkat lain menyimpan/commit melalui mekanisme berbeda. Pelajari arti **Apply**, **Save**, **Commit**, cadangan dan ekspor pada produk sebenarnya. Satu istilah bukan aturan universal.

Lakukan satu perubahan, uji, simpan sesuai prosedur, kemudian pada jadwal lab mulai ulang dan ulangi tes. Jangan reboot perangkat produksi. Jika hasil berubah setelah boot, bandingkan konfigurasi aktif dan tersimpan sebelum mengulang seluruh pekerjaan.

## 6. Eksperimen interaktif dan praktik

Rancangan simulator: papan dua subnet, pilihan interface, IP/prefix, status port, gateway klien, konfigurasi aktif/tersimpan dan tombol **Uji jalur** serta **Mulai ulang model**. Umpan balik menunjukkan tahap gagal: link, subnet, gateway, jalur kembali atau layanan. Ini draft rancangan, belum simulator aktif.

Urutan latihan: baseline A–B dan A–server; ubah gateway A menjadi salah lalu uji keduanya; pulihkan; ubah konfigurasi tanpa menyimpan dan amati model setelah restart; simpan dengan benar dan ulangi. Pada perangkat nyata guru menentukan perubahan yang aman. Siswa mengisi tabel prediksi–hasil–penjelasan, bukan menebak tombol.

Contoh penalaran: A–B masih berhasil saat gateway salah karena satu subnet. A–server gagal karena perlu router. Menambah port switch tidak memperbaiki gateway. Uji aplikasi tetap diperlukan meskipun ping berhasil.

## 7. Penerimaan dan refleksi

Kriteria: identitas jelas; alamat tidak bertabrakan; port sesuai; manajemen hanya dari sumber yang diizinkan; kedua subnet mencapai layanan uji menurut izin; konfigurasi bertahan sesudah boot; cadangan dan langkah pemulihan tercatat. Beri status belum diuji bila prasyarat fisik/layanan tidak tersedia.

Rubrik guru 0–3 per dimensi: fungsi perangkat, konfigurasi, bukti diagnosis dan pemulihan, komunikasi aman. Kasus akhir: switching sehat tetapi pengelolaan dari subnet lain gagal; peserta membedakan gateway manajemen dari gateway klien. Kuis kelak menguji alasan, sedangkan keterampilan perlu observasi.

Laporan satu halaman: diagram; tabel interface; perubahan; tes positif/negatif; hasil setelah boot; batas dan tindak lanjut. Manual resmi produk/versi dan SOP lab menjadi acuan implementasi; tidak menggunakan CLI satu vendor sebagai bahasa universal.
