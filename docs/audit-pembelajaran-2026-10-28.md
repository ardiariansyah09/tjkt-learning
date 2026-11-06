# Audit seluruh materi, simulasi, game dan sertifikat

Status: audit struktur isi, konsep kunci dan alur interaktif selesai pada 28 Oktober 2026. Koreksi cakupan evaluasi sudah diterapkan ke LMS produksi. Validasi pemahaman melalui observasi siswa belum dilakukan.

## Hasil akhir

- 53 modul / 606 tahap diuji berurutan dari progres kosong pada akun contoh review, melalui kontrol asesmen dan game yang sebenarnya.
- 53 modul berhasil memenuhi syarat sertifikat, menyiapkan lembar dan memanggil fungsi cetak; identitas modul, nilai serta logo diperiksa. Pemeriksaan ini tidak mengklaim ada 53 PDF fisik tersimpan: panggilan cetak diuji dengan pengganti window.print agar tes tidak menunggu dialog OS. Pemeriksaan PDF satu halaman tersedia pada audit integrasi sebelumnya untuk tiga contoh.
- Seluruh 53 progres akhir cocok dengan database review dan pulih setelah halaman dimuat ulang.
- Petunjuk aktivitas diuji per tahap: tujuan, langkah, tanda selesai, cara mengulang, posisi sebelum kontrol, serta tidak menggandakan petunjuk atau mengubah input saat dirender ulang. Game khusus memakai petunjuk internalnya dan diuji melalui kontrol nyata. Ada 52 tahap game; Media Transmisi memakai eksperimen tanpa tahap game.
- Model diuji pada kondisi normal dan gagal, invalid input, perubahan parameter, bukti kedaluwarsa, reset/pemulihan sesuai jenisnya. Pemeriksaan mencakup konteks 53 modul dan 20 profil keamanan terintegrasi.
- 44 course diuji dengan jawaban salah pada evaluasi akhir: tidak membuka sertifikat. Struktur soal 44 course (443 butir pada sumber sebelum pemilihan akhir) tidak memiliki indeks jawaban tak sah atau pilihan duplikat.
- Regresi backend: 169 tes / 1.992 assertions lulus pada PHP 8.3 dan database pengujian MySQL/MariaDB.
- Tidak ada error runtime tercatat pada perjalanan belajar lengkap. Pencarian placeholder pada konten tahap yang dirender tidak menemukan Lorem ipsum, TODO atau Segera Hadir.
- Produksi tetap memiliki 53 modul aktif, 606 tahap dan 326 aset database. 10 kelas aktif memiliki akses prasyarat lengkap. Login HTTPS dan render 53 halaman LMS diperiksa ulang.

Temuan yang memerlukan perbaikan kode pada audit ini adalah cakupan evaluasi akhir tiga modul. Koreksinya sudah aktif dan ketiganya diuji ulang dari awal. Tidak ada tahap macet yang tersisa pada skenario audit yang dijalankan.

Lihat [matriks semua modul](audit-53-modul.md), [data hasil tiap tahap](lms-review/audit-all-learning.json), [uji gagal](lms-review/audit-assessment-guards.json), [seluruh vektor model topik](lms-review/audit-model-vectors.json), [cakupan evaluasi](assessment-coverage-audit.json), dan [keutuhan data saat aktivasi](lms-review/learning-audit-activation.json).

Backup koreksi: `/home/adminnazh/tjkt-lms-backups/learning-audit-20261028-044315`. Hash record hasil belajar, snapshot, penugasan kelas dan definisi versi sama sebelum/sesudah aktivasi. Tidak ada reset atau pemindahan data siswa produksi.

## Metode

Audit meliputi seluruh 53 modul dan 606 tahap. Struktur 44 materi berbasis course diekstrak untuk memeriksa tujuan, urutan konsep, contoh, tugas transfer, miskonsepsi, soal dan rujukan. Sembilan materi lain diperiksa melalui konten yang benar-benar dirender. Kesesuaian cakupan mengikuti pemetaan ATP yang telah tersedia; audit ini tidak menggantikan pengesahan kurikulum sekolah.

Pengujian belajar dimulai dengan akun contoh tanpa progres pada salinan LMS terpisah. Harness memilih jawaban yang diketahui dari bank soal melalui kontrol form dan menyelesaikan permainan melalui operasi nyata; tidak menulis nilai lulus ke localStorage untuk melewati tahap. Pemeriksaan simulasi menjalankan skenario normal, gagal, perubahan keadaan dan reset sesuai model. Setelah semua tahap lulus, formulir dan panggilan cetak sertifikat diuji, kemudian halaman dimuat ulang untuk memeriksa pemulihan database. Ini bukti fungsi alur, bukan bukti siswa memahami atau tidak menebak jawaban. Sumber primer digunakan untuk memeriksa konsep kunci yang rawan salah tafsir; audit bukan pemeriksaan kalimat demi kalimat seluruh 176 entri rujukan atau sertifikasi oleh pakar tiap bidang.

Tidak ada data siswa produksi yang direset. Materi yang memuat operasi fisik/jaringan nyata harus dibedakan dari model browser. Catatan percobaan dan refleksi merupakan bukti untuk ditinjau guru; nilai otomatis tidak mengukur mutu penalaran atau keterampilan lapangan secara penuh.

## Temuan yang telah diperiksa

1. Cakupan evaluasi akhir: kode lama mengambil sepuluh soal pertama. Pada K3LH, perencanaan jaringan dan IPv6 dasar, soal lama tahap game ikut mengisi bank sehingga soal refleksi tidak masuk. Pemilihan baru mengambil satu soal dari setiap tahap berasesmen selain game terlebih dahulu, baru menambah soal bila jumlah belum sepuluh. Game tetap dinilai melalui permainan. Pemetaan 44 modul diuji dengan sepuluh soal dan cakupan tahap yang sesuai. Ambang, ID tahap dan penyimpanan progres tidak berubah.
2. Struktur 44 course tidak menunjukkan soal dengan indeks jawaban tidak valid, pilihan duplikat, atau komponen tujuan/contoh/tugas/miskonsepsi yang hilang. Temuan ini tidak membuktikan semua distraktor atau penjelasan selalu ideal.
3. Topik model mengikuti karakter materi: inspeksi bahaya K3LH, kapasitas port, parser IPv6, delay propagasi, anggaran daya optik, DHCP/DNS/SSH berlapis, rute dua arah, antrean QoS, serta layanan/security dengan batas model tertulis. Tidak disamakan menjadi satu simulator jaringan generik.

## Catatan mutu per kelompok materi

| Kelompok | Yang diperiksa | Batas yang harus dipertahankan |
|---|---|---|
| Bisnis, profesi dan perkembangan teknologi | Kebutuhan pelanggan, biaya/kontribusi, prioritas tiket, volume data, cloud/edge dan konteks sekolah | Hasil hitungan model tidak dipresentasikan sebagai prediksi usaha atau antrean nyata |
| K3LH dan pengukuran | Bahaya vs risiko, hierarki kontrol, penghentian kerja/eskalasi, referensi ukur, dBm vs dB, sensitivitas dan overload | Game tidak memberi izin menangani sumber berbahaya; angka fiktif tidak menggantikan spesifikasi/SOP |
| Jaringan dasar dan pengalamatan | Lapisan, perangkat/topologi, subnet sejajar, usable/overlap, IPv6 kanonis, ND/RA dan dual stack | /31 punya konteks khusus; sintaks valid tidak sama dengan konektivitas; DHCPv6 tidak disamakan dengan default router DHCPv4 |
| Kabel, WLAN, fiber dan VoIP | Wiremap vs performa, RSSI/SNR vs kapasitas, referensi optik, link budget, SIP vs media/RTP, bandwidth dan jitter | Tidak mengklaim model adalah alat sertifikasi kabel, survei RF atau OTDR nyata |
| Routing, NAT, proxy, QoS dan multi-WAN | Jalur pergi/balik, LPM, konvergensi, tuple NAT, ACL/cache/CONNECT, antrean/token, sesi dan failover | Pengujian layanan harus dipisahkan dari sekadar ping atau status link; satu sesi tidak otomatis memakai gabungan kapasitas WAN |
| Administrasi dan layanan server | Konfigurasi disk/proses/boot, VM vs backup, mode/ACL/token, DHCP/DNS/SSH, FTP/FTPS/SFTP, SMB, web/database, hosting/VPN/monitoring | Role, identitas host, akses sah/ditolak dan data stale dibedakan; tombol model tidak dianggap menjalankan OS/server |
| Backup, mail dan keamanan | RPO/RTO, rantai backup, restore/retest, antrean mail/relay, MFA, hash/signature, ACL first-match, DMZ, bukti insiden dan pemulihan | Backup ada bukan bukti pulih; hash bukan enkripsi; alert bukan kepastian insiden; signature tidak merahasiakan isi; penilaian keamanan memerlukan izin |

Sembilan modul lama memiliki struktur tahap berbeda (8–9 tahap), sedangkan 44 course umumnya 12 tahap. Jumlah tahap tidak diseragamkan dengan menambahkan aktivitas kosong. Modul Media Transmisi menggunakan eksperimen dan pengujian kabel tanpa game tersendiri; ada 52 tahap game pada katalog 53 modul.

## Kriteria kelulusan yang diaudit

Ambang berasal dari masing-masing mesin modul dan manifest, bukan angka baru dari audit. Umumnya cek pemahaman 75 dan evaluasi akhir 80; beberapa game lama juga mensyaratkan 80. Sertifikat harus membaca seluruh kelulusan tahap, bukan hanya skor akhir. Uji mencakup tombol cetak, identitas materi/nilai pada lembar, dan pemulihan hasil server. Pada uji gagal, sertifikat tidak boleh diberikan ketika nilai belum memenuhi syarat.

Petunjuk eksperimen seperti catat tiga percobaan dan tulis refleksi tidak selalu menjadi syarat yang dipaksakan mesin kelulusan. Kualitas penjelasan masih perlu penilaian guru; sertifikat yang ada adalah sertifikat penyelesaian modul menurut kriteria sistem, bukan sertifikasi keahlian praktik. Audit tidak menambah penguncian baru pada jurnal atau eksperimen dan tidak mencabut kelulusan lama.

## Acuan primer untuk pemeriksaan konsep berisiko salah tafsir

- [RFC 5952](https://www.rfc-editor.org/info/rfc5952/): bentuk kanonis IPv6.
- [RFC 4861](https://www.rfc-editor.org/info/rfc4861/): Neighbor Discovery dan Router Advertisement.
- [RFC 3021](https://www.rfc-editor.org/info/rfc3021/): pengecualian prefix IPv4 /31 pada point-to-point.
- [RFC 2131](https://www.rfc-editor.org/info/rfc2131/): DHCP dan keadaan lease.
- [RFC 9293](https://www.rfc-editor.org/info/rfc9293/): TCP sebagai reliable ordered byte stream.
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html): semantik metode HTTP dan idempotensi.
- [RFC 4033](https://www.rfc-editor.org/info/rfc4033/): DNSSEC tidak memberikan kerahasiaan data DNS.
- [NIOSH](https://www.cdc.gov/niosh/hierarchy-of-controls/about/index.html): urutan hierarki pengendalian.
- [CISA StopRansomware](https://www.cisa.gov/sites/default/files/2023-10/StopRansomware-Guide-508C-v3_1.pdf): backup terlindungi dan uji pemulihan.

## Batas penilaian kemudahan dipahami

Struktur berisi tujuan, kasus, prediksi/eksperimen, umpan balik, refleksi dan transfer. Materi fase F memakai banyak istilah teknis; ini memerlukan guru, prasyarat dan pembelajaran bertahap. Keterbacaan otomatis, panjang teks atau kelulusan browser tidak boleh diberi label "semua siswa pasti paham". Validasi penggunaan perlu siswa mencoba tanpa penjelasan tambahan, lalu mencatat titik berhenti, salah tafsir, bantuan yang diminta dan alasan jawaban. Uji siswa belum dilaksanakan dalam audit mesin ini.

Lembar observasi tersedia di [validasi pemahaman siswa](lembar-uji-pemahaman-siswa.md). Prioritas berikutnya adalah mengamati pemahaman siswa pada istilah teknis, pengisian parameter, pemaknaan output dan penerapan pada kasus baru. Tidak perlu menambah menu LMS untuk melakukan observasi ini.
