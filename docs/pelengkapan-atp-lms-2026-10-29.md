# Pelengkapan tujuh bagian ATP — aktif di LMS

Tanggal: 29 Oktober 2026. **Sudah diaktifkan** di https://learning.tkjwikrama.my.id, bukan hanya perubahan lokal/draft. Rilis isi `c08b1810f8e71118fab8cfb0462bab3f923d7418a790da291d01c8e57811d45a`.

## Materi dan praktik yang ditambahkan

| Kekurangan sebelumnya | Pelengkapan yang kini tersedia |
|---|---|
| Laporan setiap kegiatan | Panel singkat di aktivitas: sumber bukti, hasil yang diamati, kesimpulan/perbaikan. Tersimpan ke akun dan terlihat oleh guru pada detail siswa. Tidak menambah menu atau syarat kuis. |
| Seluler/microwave/VSAT | Praktik tiga sistem: perpindahan sel/handover, ketersediaan sel dan beban; daya terima/margin/lintasan microwave; terminal/gateway/RTT serta antrean VSAT. Ada kondisi awal, gagal dan pemulihan. |
| Peta fiber dan HTS | Prosedur rekonsiliasi ID link, revisi, port/core, panjang, cadangan, izin serta persetujuan; simulator dan unduhan kontrak penyerahan netral. |
| AP Ruijie | Profil panduan resmi Reyee RG-RAP, pemetaan SSID/radio, kanal/lebar/daya, VLAN uplink, autentikasi dan pembatasan manajemen. Simulator Apply–Uji–Save–Restart menunjukkan keadaan aktif vs tersimpan. |
| BIRD | Topologi dua router Linux lengkap, pasangan konfigurasi OSPF/kernel filter, alamat/gateway, forwarding/firewall/jalur balik, validasi, penerimaan, persistensi dan rollback. Simulator membedakan neighbor, daemon, kernel dan transaksi dua arah. |
| RADIUS–NAS | FreeRADIUS 3 dan contoh NAS RouterOS 7 PPPoE: clients/secret, authorize/rate-limit, pembuatan sesi, queue, trafik, accounting, profil sesi lama dan retest. Simulator membedakan Accept, atribut dan penegakan sebenarnya pada model. |
| SmartOLT | Prosedur read-only, inventaris dan endpoint status resmi; dataset tersanitasi, null RX, timestamp, dying gasp/LOS, satu ONU vs satu PON, data basi, hipotesis serta pengujian baru setelah perbaikan. |

Materi masuk pada bab yang sesuai, bukan tambahan game generik atau daftar pilihan kuis yang disebut praktik. Enam lab menyimpan maksimal delapan jejak percobaan dan dapat mengekspor bukti. Laporan singkat dibuat terlipat agar tidak mendominasi halaman.

## Konteks yang tetap mengikuti sekolah

Status audit terbaru adalah **cakupan materi/latihan**, bukan pengakuan seluruh perangkat sekolah telah dikonfigurasi atau semua siswa otomatis kompeten. Kepanjangan/format HTS tidak dikarang; kontrak latihan harus dipetakan ke format guru. Contoh Ruijie memakai panduan profil tertentu, bukan janji semua firmware memiliki menu sama. SmartOLT di LMS menggunakan dataset, tanpa token/provisioning perangkat nyata. Implementasi pada perangkat sebenarnya mengikuti inventaris, izin, akun dan versi sekolah.

Latihan model dapat dikerjakan tanpa perangkat fisik. Praktik pada VM/perangkat nyata tetap memerlukan observasi guru dan kriteria penerimaan yang sudah ditambahkan. Kelulusan sertifikat tetap memakai ketentuan sebelumnya; bukti aktivitas tidak otomatis menjadi nilai praktik terverifikasi.

## Progres, database dan tampilan LMS

Jumlah tetap **56 modul dan 642 tahap**; tidak mengubah versi penilaian, ID tahap, ambang kelulusan atau kunci course. Revisi isi menggunakan pemetaan terpisah sehingga nilai, progres dan antrean offline lama tetap berlaku. Tidak ada nilai hasil lama yang dihapus atau diganti menjadi kelulusan buatan.

Produksi menyimpan 348 aset rilis aktif di database, total decoded 4.220.865 byte. Semua 56 halaman tetap native LMS. Sepuluh kelas aktif tidak memiliki prasyarat penugasan yang hilang; HTTPS login valid dan mode maintenance sudah mati. Backup dibuat di `/home/adminnazh/tjkt-lms-backups/atp-completion-20261029-134433` sebelum aktivasi.

Guru melihat bukti melalui **Progres & Nilai → detail siswa/modul → Laporan singkat dan latihan ATP**. Akses tetap mengikuti rombel yang diampu; tulisan siswa di-escape dan bentuk JSON yang tidak sesuai ditangani tanpa mengeksekusi HTML.

## Validasi

- **172 tes, 2.011 assertion** regresi LMS lulus pada database uji terpisah, termasuk penyimpanan bukti, izin guru dan escaping HTML/bentuk data yang tidak sesuai.
- **46 pemeriksaan model** mencakup kondisi normal/gagal, pemulihan, versi konfigurasi dan batas riwayat enam topik.
- Pasangan konfigurasi R1/R2 yang ditampilkan pada materi lolos parser **BIRD 2.0.8**. Binary/dependensi diekstrak di direktori review; tidak memasang layanan sistem, menjalankan daemon, atau mengubah route server. Ini bukti sintaks, bukan uji jaringan BIRD fisik.
- Browser review menjalankan enam lab, mengisi laporan, menyimpan ke database dan memulihkannya setelah reload; tidak ada overflow pada pemeriksaan lebar 390 px.
- Pemeriksaan browser atas 50 modul lainnya memastikan hasil lengkap tetap pulih. Sembilan modul legacy diperiksa setelah membuka tahap aktivitasnya untuk memastikan panel laporan ada. Pengujian pembacaan guru dilanjutkan terpisah dengan membuka panel lipat; bukti yang sama terlihat.
- Pemeriksaan lanjutan membaca kembali data akun seluruh 56 modul dan enam riwayat praktik. Tidak ada perubahan versi/skema penilaian atau reset rekaman peserta.

Bukti: [validasi model](atp-practice-validation.json), [data audit ATP](audit-atp-seluruh-modul.json), [hasil tersimpan dan tampilan guru](lms-review/atp-completion-evidence.json), [parser BIRD](lms-review/bird-config-validation.json), [tes regresi](lms-review/atp-completion-tests.xml), [aktivasi](lms-review/atp-completion-activation.json) dan [verifikasi produksi](lms-review/curriculum-verification.json).

Matriks terkini memetakan 44 baris tujuan (termasuk lima baris MP Pilihan yang memakai pokok keamanan sama dengan XII) ke materi serta kegiatan. Tidak menambah JP otomatis atau menggandakan progres untuk mata pelajaran pilihan. Konteks pelaksanaan yang memerlukan data sekolah dicatat terpisah dari ketersediaan bahan belajar.
