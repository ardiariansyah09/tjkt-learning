# Pemetaan ATP Fase F 2026–2027

Acuan: dua dokumen pengguna, **ATP Fase F XI KK TKJ 2026-2027.docx** dan **ATP Fase F XII KK TKJ 2026-2027.docx**, SMK Wikrama Bogor. Dokumen dibaca sebagai sumber kurikulum; catatan kegiatan dan tautan sumber di dalamnya tidak diperlakukan sebagai instruksi untuk menjalankan aplikasi atau mengakses layanan eksternal.

| Kelas | Elemen sesuai ATP | Alokasi |
| --- | --- | --- |
| XI | Perencanaan dan Pengalamatan Jaringan | 48 JP |
| XI | Teknologi Jaringan Kabel dan Nirkabel | 216 JP |
| XI | Konfigurasi Perangkat Jaringan | 168 JP |
| XI | Administrasi Sistem Jaringan | 144 JP |
| XII | Keamanan Jaringan | 180 JP |

Total XI 576 JP; XII 180 JP. Dokumen tidak memberikan pembagian semester atau JP setiap modul, sehingga situs tidak mengarang pembagian tersebut. Urutan modul dalam setiap elemen merupakan pemecahan pembelajaran pada situs berdasarkan tujuan, materi, dan prasyarat; bukan nomor modul resmi yang tercantum dalam ATP.

## Kelas XI

1. **Perencanaan/pengalamatan:** kebutuhan teknis dan peralatan; topologi/arsitektur dan layout berskala (pemetaan jalur fiber, Visio/draw.io); pengalamatan subnetting/CIDR/VLSM.
2. **Kabel/nirkabel:** instalasi kabel; WLAN termasuk kanal dan daya; perawatan/perbaikan kabel dan nirkabel; VoIP; instalasi, pengujian, pemeliharaan, dan perbaikan fiber sesuai SOP/APD.
3. **Konfigurasi perangkat:** pemasangan; penggantian; VLAN; routing statis; routing dinamis OSPF termasuk pengenalan BIRD; NAT; proxy; manajemen bandwidth/QoS termasuk pengenalan RADIUS; load balancing/failover.
4. **Administrasi sistem:** remote/DHCP/DNS; FTP; file; web/database; control panel/shared/dedicated/VPS; VPN; kontrol/monitoring termasuk pengenalan Smart OLT. Dasar server, virtualisasi, OS, akun/hak akses, dan backup ditandai pendukung; mail server ditandai pengayaan karena tidak tercantum eksplisit dalam daftar layanan ATP ini.

## Kelas XII

**Materi inti:** potensi ancaman dan sistem keamanan; host hardening; server DMZ; pengujian keamanan jaringan, host, dan server. Ancaman dan kebutuhan sistem keamanan disatukan dalam satu modul awal, bukan dihilangkan. Autentikasi/kriptografi menjadi pendukung. IDS/IPS dan respons insiden menjadi pengayaan. Proyek integrasi ditampilkan terpisah sebagai pengayaan lintas elemen, bukan elemen/JP tambahan dalam ATP.

## Dampak terhadap katalog

Katalog berisi 53 entri: Fase E 16, XI 30, XII 7. Per 26 Oktober 2026 seluruh 53 modul sudah tersedia di workspace; tidak ada entri **Segera Hadir**. Status ini menyatakan ketersediaan konten lokal, bukan publikasi ke GitHub atau bukti otomatis penguasaan praktik siswa.

ID dan URL modul yang sudah terbit dipertahankan. `proxy-load-balancing` menjadi entri Proxy Server dengan load balancing dipisahkan; `ids-hardening` menjadi Host Hardening dan IDS/IPS dipisahkan sebagai pengayaan. Kedua ID tersebut sebelumnya masih berupa rencana, sehingga tidak ada materi atau progres terbit yang dipindahkan. VPN XI tidak lagi mensyaratkan autentikasi/kriptografi XII; dasar akun/hak akses serta jaringan menjadi prasyaratnya. VoIP tidak dikunci oleh manajemen bandwidth yang dipelajari pada elemen konfigurasi berikutnya.

Metadata sumber, kelas, dan JP tersimpan di `data/atp-fase-f.json`; urutan, status, dan peran materi pada `data/modules.json`. Pengujian pemetaan: `tools/validate-atp.ps1`.

## Hubungan dengan CP nasional

Label inti/pendukung/pengayaan di katalog mengikuti pemetaan ATP sekolah di atas. Label tersebut bukan penetapan bahwa suatu kompetensi opsional dalam CP nasional. Contohnya mail server tetap dibahas dalam lingkup administrasi sistem jaringan nasional meskipun diposisikan sebagai pengayaan terhadap daftar layanan ATP sekolah ini. Autentikasi dan IDS/IPS juga harus dibaca bersama lingkup elemen keamanan.

Fase E menggunakan beberapa kelompok belajar yang lebih kecil daripada empat elemen CP 046/H/KR/2025. Pemecahan tersebut membantu navigasi; kelompok belajar bukan elemen nasional tambahan. Pemetaan dan kebutuhan penguatan dicatat dalam [audit cakupan TJKT](audit-cakupan-tjkt.md).
