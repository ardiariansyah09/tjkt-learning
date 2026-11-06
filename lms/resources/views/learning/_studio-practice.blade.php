@if($studioMeta['lab']??null)
<section class="studio-lab business-diagram" data-studio-lab="{{ $studioMeta['lab'] }}" @if($studioMeta['lab']==='service' && $position===10)data-initial-case="3"@endif aria-label="Laboratorium latihan">
<div class="studio-lab-top"><span class="studio-label"><i class="bi bi-controller me-1" aria-hidden="true"></i>COBA LANGSUNG</span><span class="studio-training">Latihan bebas · tanpa nilai</span></div>
@switch($studioMeta['lab'])
@case('career')
@case('service')
<div class="studio-case"><span class="studio-case-count" data-case-count></span><h3 class="h5" data-case-title></h3><p data-case-text></p></div>
<p class="fw-semibold small">{{ $studioMeta['lab']==='career'?'Tim mana yang paling sesuai dalam pembagian tugas latihan ini?':'Apa langkah awal yang paling sesuai?' }}</p>
<div class="studio-choice-grid" data-case-choices></div>
<p class="studio-feedback" data-case-feedback aria-live="polite">Pilih satu jawaban. Tidak apa-apa kalau perlu mencoba lagi.</p>
<button type="button" class="btn btn-outline-primary" data-case-next>Kasus berikutnya <i class="bi bi-arrow-right ms-1"></i></button>
@break
@case('connection')
<h3 class="h5">LAB-07 tidak bisa membuka LMS</h3><p class="small text-secondary">Klik pemeriksaan untuk menemukan petunjuk. Ini jaringan simulasi, bukan perangkat sekolah.</p>
<div class="studio-network" role="img" aria-label="Dua komputer terhubung ke switch dan server. LAB-07 bermasalah, LAB-08 dapat mengakses LMS."><div class="studio-hosts"><div class="studio-node is-fault" data-network-pc><i class="bi bi-pc-display"></i><strong>LAB-07</strong><small data-network-state>Belum tersambung</small></div><div class="studio-node"><i class="bi bi-pc-display"></i><strong>LAB-08</strong><small>Bisa membuka LMS</small></div></div><span class="studio-network-link" aria-hidden="true"></span><div class="studio-node"><i class="bi bi-hdd-network"></i><strong>Switch</strong></div><span class="studio-network-link" aria-hidden="true"></span><div class="studio-node"><i class="bi bi-server"></i><strong>Server LMS</strong></div></div>
<div class="d-flex flex-wrap gap-2"><button class="btn btn-outline-primary" type="button" data-network-action="compare">Bandingkan komputer</button><button class="btn btn-outline-primary" type="button" data-network-action="cable">Periksa konektor</button><button class="btn btn-primary" type="button" data-network-action="repair">Pasang ulang & uji</button><button class="btn btn-outline-secondary" type="button" data-network-action="reset">Ulangi</button></div>
<p class="studio-feedback" data-network-feedback aria-live="polite">Apa yang ingin kamu periksa lebih dulu?</p>
@break
@case('certificate')
<h3 class="h5">Baca isi sertifikatnya</h3><p class="small text-secondary">Ketiga kartu ini contoh rekaan. Klik untuk melihat apa yang dapat disimpulkan.</p>
<div class="studio-choice-grid"><button class="studio-option" type="button" data-certificate="attendance" aria-pressed="false"><i class="bi bi-calendar-check"></i><strong>Peserta webinar</strong><span>“Telah mengikuti kegiatan”</span></button><button class="studio-option" type="button" data-certificate="competency" aria-pressed="false"><i class="bi bi-patch-check"></i><strong>Uji kompetensi</strong><span>“Kompeten pada skema…”</span></button><button class="studio-option" type="button" data-certificate="vendor" aria-pressed="false"><i class="bi bi-router"></i><strong>Sertifikasi vendor</strong><span>“Lulus ujian program…”</span></button></div>
<p class="studio-feedback" data-certificate-feedback aria-live="polite">Apa bedanya pernah hadir dan dinilai mampu?</p>
@break
@case('scope')
<h3 class="h5">Paket “Rapikan LAN Toko”</h3><p class="small text-secondary">U-02: empat sambungan. Pilih isi paket yang akan kamu jelaskan kepada pelanggan.</p>
<div class="studio-choice-grid"><label class="studio-check"><input type="checkbox" data-scope="list" checked> Catat empat sambungan</label><label class="studio-check"><input type="checkbox" data-scope="label" checked> Beri label sesuai daftar</label><label class="studio-check"><input type="checkbox" data-scope="test" checked> Uji sambungan dengan pendamping</label><label class="studio-check"><input type="checkbox" data-scope="router"> Ubah konfigurasi router</label></div>
<div class="studio-result"><strong>Isi paketmu</strong><ul class="mb-2 mt-2" data-scope-list></ul><p class="mb-0" data-scope-feedback aria-live="polite"></p></div>
@break
@case('cost')
<h3 class="h5">Laboratorium biaya layanan</h3><p class="small text-secondary">Ubah angka, amati hasilnya. Semua nilai fiktif untuk satu paket latihan; bukan tarif jasa atau laba bersih usaha nyata.</p>
<div class="studio-input-grid">
@foreach([['materials','Bahan dan label (Rp)',20000,1000000],['tools','Penggunaan alat (Rp)',10000,1000000],['transport','Transportasi (Rp)',15000,1000000],['hours','Waktu kerja (jam)',2,24],['rate','Biaya per jam (Rp)',20000,1000000],['reserve','Cadangan biaya (Rp)',15000,1000000],['price','Harga satu paket (Rp)',125000,2000000]] as [$field,$label,$value,$max])
<div><label class="form-label" for="studio-{{ $section->id }}-{{ $field }}">{{ $label }}</label><input type="number" class="form-control" id="studio-{{ $section->id }}-{{ $field }}" data-cost="{{ $field }}" value="{{ $value }}" min="0" max="{{ $max }}" step="1" inputmode="numeric"></div>
@endforeach
</div>
<label class="form-label mt-3" for="studio-{{ $section->id }}-extra">Biaya tambahan di luar model: <strong data-extra-label>Rp0</strong></label><input class="form-range" type="range" id="studio-{{ $section->id }}-extra" data-cost="extra" min="0" max="60000" step="5000" value="0">
<div class="studio-totals" aria-live="polite"><div><span>Total biaya</span><output data-cost-total>Rp100.000</output></div><div><span>Pendapatan model</span><output data-cost-revenue>Rp125.000</output></div><div><span>Surplus perkiraan</span><output data-cost-surplus>Rp25.000</output></div></div>
<div class="studio-cost-chart" role="img" aria-label="Perbandingan pendapatan dan biaya" data-cost-chart><span>Pendapatan</span><div><span class="studio-chart-bar" data-revenue-bar></span></div><span>Biaya</span><div><span class="studio-chart-bar is-cost" data-cost-bar></span></div></div>
<p class="studio-feedback" data-cost-feedback aria-live="polite"></p><button class="btn btn-outline-secondary" type="button" data-cost-reset>Kembalikan angka awal</button>
@break
@case('labels')
<h3 class="h5">Temukan PC-03 dari daftar</h3><div class="studio-label-board"><div class="studio-node"><i class="bi bi-pc-display"></i><strong>PC-03</strong><small>Nama pada perangkat</small></div><div><label class="form-label" for="studio-{{ $section->id }}-label">Nama pada daftar</label><input class="form-control" id="studio-{{ $section->id }}-label" data-label-input value="Meja 3" maxlength="30"><small class="text-secondary">Coba samakan nama, lalu uji kembali.</small></div></div><button class="btn btn-primary" type="button" data-label-test>Uji pencarian</button><p class="studio-feedback" data-label-feedback aria-live="polite">Apakah temanmu akan langsung tahu bahwa kedua nama menunjuk perangkat yang sama?</p>
@break
@endswitch
<p class="studio-lab-note mb-0"><i class="bi bi-info-circle me-1" aria-hidden="true"></i>Latihan tidak menambah nilai atau membuka langkah. Penilaian ada di bagian aktivitas.</p>
<noscript><p class="alert alert-info mt-3">Aktifkan JavaScript untuk mencoba laboratorium. Pembahasan dan aktivitas penilaian tetap tersedia di halaman ini.</p></noscript>
</section>
@endif
