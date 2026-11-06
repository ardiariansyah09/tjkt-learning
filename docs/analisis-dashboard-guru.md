# Analisis pemantauan progres oleh guru

Status: rancangan berdasarkan pemeriksaan kode; belum ada login, backend, atau sinkronisasi yang diimplementasikan.

## Temuan kode

- `assets/js/chapter-navigation.js` menyimpan `passed`, `scores`, dan `current` pada `tjkt:{moduleId}:course:v{storageVersion}`. Tidak semua catatan memiliki waktu perubahan.
- `assets/js/sequential.js` memakai format khusus IPv4: `tjkt:ipv4-subnetting:sequential:v2`, berisi nilai lulus dan `updatedAt`.
- `assets/js/module-certificate.js` sudah membaca format modul umum dan empat format lama untuk menentukan kelayakan sertifikat. Ini dapat menjadi referensi normalisasi, tetapi fungsi saat ini bergantung pada DOM modul yang sedang dibuka; belum merupakan pembaca seluruh katalog.
- `assets/js/topic-activities.js` menyimpan percobaan dan jurnal terpisah pada `tjkt:{moduleId}:studio:v1`. Riwayat percobaan dibatasi 30 catatan terakhir; dashboard tidak dapat mengembalikan riwayat yang sudah tidak disimpan.
- `assets/js/local-instructor.js` hanya membuka navigasi lokal. Fitur ini bukan autentikasi guru dan tidak boleh digunakan sebagai otorisasi dashboard.
- Sertifikat saat ini dibuat di browser. Membuka dialog cetak tidak membuktikan PDF disimpan atau kertas dicetak.

## Cakupan dashboard pertama

Guru masuk, memilih kelas, lalu melihat daftar siswa: jumlah tahap lulus dibanding jumlah tahap modul, nilai evaluasi akhir, tahap yang belum lulus, kelayakan sertifikat, serta waktu sinkronisasi terakhir. Detail siswa memperlihatkan nilai tiap tahap dan jurnal yang diserahkan.

Pisahkan status belum ada data, belum mulai, sedang belajar, dan lulus. Progres dihitung dari tahap yang memenuhi ambang masing-masing modul, bukan sekadar halaman dibuka. Nilai nol tidak boleh disamakan dengan nilai yang belum tersedia. Waktu sinkronisasi tidak boleh dilabeli waktu belajar terakhir. Jangan menyimpulkan durasi belajar dari tab yang terbuka.

Guru hanya mengakses kelas yang menjadi tanggung jawabnya. Siswa hanya membaca dan menulis data miliknya. Penetapan peran guru dan keanggotaan kelas dilakukan melalui proses berwenang; siswa tidak boleh memilih peran guru saat mendaftar.

## Rancangan integrasi

Alur: modul → penyimpanan lokal yang ada → adaptor progres per mesin modul → antrean sinkronisasi per akun → layanan autentikasi dan penyimpanan daring → dashboard guru.

Halaman pembelajaran dapat tetap statis. Pemilihan layanan backend, biaya, kuota, dan metode login belum ditetapkan; perlu memeriksa dokumentasi resmi terkini sebelum memilih penyedia. Kunci administratif tidak boleh dimasukkan ke HTML, JavaScript publik, atau repositori.

Data minimum: akun/profil, kelas, keanggotaan, penugasan guru, versi modul/tahap, hasil tahap per percobaan, jurnal yang diserahkan, dan status sinkronisasi. Identitas siswa menggunakan ID akun; nama yang diketik di sertifikat bukan identitas terverifikasi. Batasi data pribadi pada yang diperlukan untuk pembelajaran.

Server memvalidasi pemilik data, keanggotaan, ID modul/tahap, versi konten, rentang nilai, serta aturan akses. Permintaan berulang memakai ID operasi yang sama agar tidak menghasilkan catatan ganda. Penolakan akses harus diuji melalui API, bukan hanya menyembunyikan tombol dashboard.

## Perlindungan progres lama dan penggunaan bersama

Jangan mengubah atau menghapus kunci lokal lama. Sebelum impor, tampilkan ringkasan data perangkat dan minta siswa memastikan data tersebut miliknya. Satu browser bisa pernah dipakai beberapa siswa; seluruh data lokal tidak boleh otomatis diklaim akun pertama yang masuk.

Impor diberi label data lama dari perangkat, dengan waktu impor, bukan tanggal belajar buatan. Data lama tidak memiliki bukti server mengenai siapa yang mengerjakannya. Sediakan ekspor cadangan sebelum impor. Data daring baru dipisahkan per akun; antrean milik akun A tidak boleh terkirim ketika akun B masuk.

Koneksi gagal tidak menghapus hasil lokal. Setelah autentikasi kedaluwarsa, antrean menunggu akun pemilik masuk kembali. Untuk hasil berulang pada versi dan siklus belajar yang sama, simpan percobaan dan hitung nilai terbaik sesuai aturan modul. Reset atau penugasan ulang memakai siklus baru yang eksplisit; jangan menggabungkannya kembali dengan hasil lama. Konflik jurnal perlu menyimpan revisi, bukan diam-diam menimpa tulisan dari perangkat lain.

Penyimpanan lokal membantu ketika koneksi terganggu pada halaman yang sudah dimuat. Ini belum menjamin semua modul dapat dibuka offline: dukungan offline penuh membutuhkan strategi cache aset tersendiri.

## Batas kepercayaan

Nilai yang dihitung dan disimpan seluruhnya di browser dapat dimodifikasi pengguna. Sinkronisasi membuat aktivitas terpantau, tetapi tidak otomatis menjadikannya penilaian terverifikasi. Bila diperlukan penilaian resmi, proses penilaian penting harus divalidasi di server dan/atau melalui penilaian guru. Sumber data lama, aktivitas yang dilaporkan klien, dan hasil yang diverifikasi harus dibedakan.

Untuk sertifikat, gunakan status memenuhi syarat, sertifikat disiapkan, atau dialog cetak dibuka sesuai bukti yang tersedia. Sertifikat dengan nomor dan verifikasi daring membutuhkan mekanisme penerbitan tersendiri.

## Urutan pengerjaan dan pemeriksaan

1. Buat inventaris adaptor seluruh modul dan kontrak data yang konsisten. Uji bahwa pembacaan tidak memodifikasi progres lama.
2. Tetapkan backend dan login, buat aturan akses kelas/siswa/guru, lalu uji lintas akun dan lintas kelas.
3. Uji sinkronisasi pada satu modul umum dan satu modul lama, termasuk putus koneksi, pengiriman ganda, pergantian akun, impor lama, dan konflik dua perangkat.
4. Bangun dashboard ringkas, kemudian integrasikan seluruh modul dan jurnal yang diserahkan.
5. Jalankan regresi kelulusan dan cetak ulang sertifikat seluruh modul sebelum publikasi. Pastikan mode instruktur lokal tidak mengirim progres sebagai siswa.

Tidak ada perubahan pada alur belajar, penyimpanan, atau sertifikat dalam pekerjaan analisis ini.
