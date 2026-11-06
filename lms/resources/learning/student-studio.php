<?php

// Match by original title so reordering does not attach another topic's lab.
$plans = [
    'TJKT-E-X-01' => ['profesi-tjkt-x.md', [
        ['Siapa yang memperbaiki Wi-Fi sekolah?', 3, null],
        ['Internet mati, mulai dari mana?', 5, 'connection'],
        ['Tahu alatnya, bisa memakainya?', 4, null],
        ['Kenalan dengan tim TJKT', 6, 'career'],
        ['Bikin laporan yang mudah dibantu', 4, null],
        ['Sudah diperbaiki, sudah berhasil?', 4, null],
        ['Sertifikatmu membuktikan apa?', 5, 'certificate'],
        ['Cek info sertifikasi, yuk', 7, null],
        ['Tiga tiket masuk. Siapa membantu?', 8, 'career'],
        ['Giliranmu jadi teknisi', 8, null],
        ['Arena latihan TJKT', 5, null],
        ['Tunjukkan hasil belajarmu', 8, null],
        ['Berikutnya mau bisa apa?', 4, null],
        ['Lima bekal teknisi pemula', 3, null],
    ]],
    'TJKT-E-X-02' => ['usaha-tjkt-x.md', [
        ['Bisa jaringan, bisa bikin layanan apa?', 3, null],
        ['Pelanggan datang. Pilih tindakanmu!', 5, 'service'],
        ['Teknisi juga bisa jadi pengusaha', 4, null],
        ['“Wi-Fi lambat” itu masalah apa?', 5, null],
        ['Pilih pekerjaan yang siap dikerjakan', 5, null],
        ['Rakit paket layananmu', 6, 'scope'],
        ['Hitung biayanya, lihat hasilnya', 8, 'cost'],
        ['Kalau diminta pekerjaan tambahan?', 4, null],
        ['Uji ide kecil, perbaiki hasilnya', 7, 'labels'],
        ['Ruang belajar butuh bantuanmu', 8, 'service'],
        ['Arena tantangan layanan', 5, null],
        ['Kumpulkan rancanganmu', 8, null],
        ['Mau berkembang ke arah mana?', 4, null],
        ['Siap bantu pelanggan?', 3, null],
    ]],
];
$catalog = [];
foreach ($plans as $code => [$source, $items]) {
    preg_match_all('/<!-- section:[a-z_]+\|([^\n]+) -->/', file_get_contents(resource_path('learning/'.$source)), $titles);
    foreach ($titles[1] as $index => $title) {
        [$short, $minutes, $lab] = $items[$index];
        $catalog[$code][trim($title)] = ['title' => $short, 'minutes' => $minutes, 'lab' => $lab];
    }
}

return $catalog;
