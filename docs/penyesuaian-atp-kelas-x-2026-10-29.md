# Penyesuaian materi terhadap ATP kelas X

Acuan: `modul/ATP-TJKT X - NEW 27.xlsx`, lembar ATP, baris 18–22; tahun ajaran 2026–2027. Dokumen ini mencatat perubahan sumber lokal. Paket yang sudah tersimpan di database server bersifat berversi dan tidak otomatis berubah ketika sumber lokal diedit. Perubahan ini belum diaktifkan pada server produksi.

## Pengelompokan

Katalog 16 modul Fase E telah dikelompokkan menurut empat elemen ATP: Wawasan Dunia Kerja (28 JP), Kecakapan Kerja Dasar/K3LH/Budaya Kerja (24 JP), Media dan Jaringan Telekomunikasi (132 JP), Penggunaan Alat Ukur (18 JP). Total 202 JP. JP tetap alokasi elemen, bukan klaim durasi setiap halaman.

Profesi ditempatkan sebelum proses bisnis sesuai urutan ATP dan tidak lagi bergantung pada modul proses bisnis. Prasyarat lain tetap. Modul pengenalan jaringan, topologi, analisis kebutuhan dan troubleshooting dipertahankan sebagai pendukung penerapan, bukan TP baru. Fase F tetap memakai pemetaan ATP XI/XII yang telah tersedia; dokumen kelas X tidak menggantikan ATP Fase F.

Peta acuan terstruktur ada pada `data/atp-fase-e.json`: empat elemen, modul yang terkait dengan TP, serta tiga draft untuk TP 2.5. Seluruh 19 nomor TP terpetakan, tetapi TP 2.5 belum boleh dinyatakan menjadi materi interaktif siap terbit karena masih draft.

## Pelengkapan materi yang sudah tersedia

- Profesi: sertifikasi dan lingkupnya, pembeda sertifikat LMS/sertifikasi profesi, kewirausahaan–technopreneurship, vision/passion dan produk rencana karier.
- K3LH: makna rambu, pemilihan APD sesuai bahaya, analisis pencegahan jatuh dan kondisi penghentian kerja.
- Wawasan teknologi: pembandingan perkembangan 3G/4G/5G, batas klaim dan latihan pengambilan keputusan.
- Telekomunikasi: prosedur uji WLAN dan izin akses; eksperimen margin microwave; VSAT dengan simulator propagasi yang sudah ada; analisis optik yang dihubungkan dengan simulasi Alat Ukur.
- Laboratorium modul yang menggunakan pembangun materi bersama: format laporan satu halaman yang ringkas dan membedakan hasil simulasi, praktik nyata serta data contoh.

Tambahan masuk pada bab lama melalui `atp-fase-e-enrichment.js`; tidak menambah tahap wajib, mengganti kunci penyimpanan, mengubah pertanyaan/nilai lama, atau membatalkan sertifikat sebelumnya. Latihan kasus baru dinilai melalui bukti dan tinjauan guru, bukan klaim skor otomatis. Tidak ada game generik baru atau praktik terbimbing panjang yang dihidupkan kembali.

## Tiga draft materi baru

1. [Instalasi dan Konfigurasi Dasar Sistem Komputer](draft-fase-e/instalasi-komputer-dasar.md): komponen/kompatibilitas, media/boot, instalasi, NIC, konfigurasi klien, diagnosis serta bukti sesudah boot.
2. [Konfigurasi Dasar Router dan Switch](draft-fase-e/konfigurasi-perangkat-dasar.md): identitas, manajemen, fungsi L2/L3, interface/gateway, penyimpanan dan uji setelah boot.
3. [Dasar Virtualisasi dan Server](draft-fase-e/virtualisasi-server-dasar.md): host/guest, resource, jaringan terisolasi, layanan lokal, snapshot/cadangan serta pembuktian dari klien.

Setiap draft memuat tujuan, prasyarat, uraian konsep, contoh kasus, urutan praktik, rancangan simulasi khusus topik, bukti penerimaan, refleksi dan asesmen guru. **Rancangan simulasi di draft belum merupakan simulator aktif.** Draft belum dimasukkan ke katalog terbit, belum mendapat kegiatan bernilai atau sertifikat. Pemilihan platform/OS/perangkat dan pembagian JP rinci diperlukan ketika draft diimplementasikan menjadi modul siap pakai.

## Pemeriksaan

`node tools/check-atp-fase-e.mjs`: memastikan 4 elemen, total 202 JP, 16 modul lama, pemetaan 19 TP dan 3 draft belum terbit. Membandingkan ID tahap dan seluruh definisi soal empat modul yang diperkaya dengan paket sebelumnya; harus identik.

`node tools/audit-course-content.mjs`: 44 sumber course dapat dibaca dan tidak memiliki kesalahan struktur materi/soal.

`node tools/check-assessment-coverage.mjs`: cakupan evaluasi seimbang pada 44 modul tetap lolos. Pemeriksaan ini tidak mengklaim seluruh simulasi browser, sertifikat atau pembelajaran siswa diuji ulang pada versi sumber ini.

Pemeriksaan tampilan melalui `tools/validate-atp-browser.ps1` sudah dicoba tetapi tidak dapat tersambung ke WebSocket debugging browser lokal. Karena itu, pemeriksaan tampilan belum dinyatakan lolos; hasil browser lama bukan bukti untuk perubahan ini. Pemeriksaan sintaks JavaScript dan pemeriksaan struktur di atas berhasil.
