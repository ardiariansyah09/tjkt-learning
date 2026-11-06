@php
$catalog=require resource_path('learning/usaha-tjkt-visuals.php');
preg_match_all('/<!-- section:[a-z_]+\|([^\n]+) -->/',file_get_contents(resource_path('learning/usaha-tjkt-x.md')),$titles);
$index=array_search($section->title,array_map('trim',$titles[1]),true);
$visual=$index===false?null:($catalog[$index]??null);
$diagrams=[
 'flow'=>[['bi-chat-left-text','Kebutuhan','Siapa perlu dibantu?'],['bi-shield-check','Kelayakan','Izin · kemampuan · risiko'],['bi-tools','Layanan','Lingkup dan hasil'],['bi-clipboard-check','Bukti','Uji dan serah terima']],
 'cases'=>[['bi-search','U-01: perjelas','Lambat belum berarti router rusak'],['bi-ethernet','U-02: batasi','4 sambungan, perlu pendampingan'],['bi-shield-lock','U-03: tolak','Tidak ada izin pemilik jaringan']],
 'needs'=>[['bi-chat-dots','Keluhan','“Wi-Fi lambat”'],['bi-bullseye','Kebutuhan','Unggah tugas lancar'],['bi-search','Bukti yang dicari','Kapan, siapa, kegiatan apa?'],['bi-router','Calon solusi','Ditentukan setelah pemeriksaan']],
 'gates'=>[['bi-key','Gerbang izin','Belum ada? Tunda dan konfirmasi.'],['bi-tools','Gerbang kemampuan','Belum siap? Persempit atau rujuk.'],['bi-shield-check','Gerbang keselamatan','Belum aman? Hentikan pekerjaan.']],
 'scope'=>[['bi-list-check','Dikerjakan','Inventaris dari data contoh'],['bi-file-earmark-text','Diserahkan','Daftar dan catatan pemeriksaan'],['bi-slash-circle','Di luar lingkup','Perubahan konfigurasi'],['bi-check2-circle','Selesai bila','Data konsisten dan ditinjau']],
 'iteration'=>[['bi-lightbulb','Rencana awal','Tulis asumsi dan target'],['bi-play-circle','Uji kecil','Catat hasil apa adanya'],['bi-arrow-repeat','Revisi','Ubah strategi dari bukti'],['bi-clipboard-check','Uji ulang','Periksa perbaikan dan batas']],
];
@endphp
@if($visual)
<div class="mission-intro"><span class="mission-label">MISI {{ str_pad($position,2,'0',STR_PAD_LEFT) }} · PAHAMI → COBA → REFLEKSI</span><h2>{{ $visual[0] }}</h2><p>{{ $visual[1] }}</p></div>
@include('learning._studio-practice')
@if(!($studioMeta['lab']??null))
<section class="business-diagram" aria-label="Peta konsep {{ $visual[0] }}">
@if($visual[2]==='cost')
<div class="d-flex justify-content-between flex-wrap gap-2 mb-3"><strong>Model satu paket layanan</strong><span class="badge text-bg-primary">Angka simulasi</span></div>
<div class="business-cost-row"><span>Pendapatan</span><div class="business-bar" style="--bar-width:100%"><strong>Rp125.000</strong></div></div>
<div class="business-cost-row"><span>Biaya awal</span><div class="business-bar is-cost" style="--bar-width:80%"><strong>Rp100.000</strong></div></div>
<div class="business-cost-row"><span>Surplus awal</span><div class="business-bar is-surplus" style="--bar-width:20%"></div><strong>Rp25.000</strong></div>
<p class="small mt-3 mb-0">Biaya tambahan Rp30.000 → biaya baru Rp130.000 → <strong>surplus minus Rp5.000</strong>. Panjang batang memakai skala pendapatan Rp125.000.</p>
@else
<ol class="business-flow">@foreach($diagrams[$visual[2]] as [$icon,$title,$caption])<li><span class="business-stage"><i class="bi {{ $icon }}" aria-hidden="true"></i><span>{{ str_pad($loop->iteration,2,'0',STR_PAD_LEFT) }}</span></span><strong>{{ $title }}</strong><p>{{ $caption }}</p></li>@endforeach</ol>
@endif
</section>
@endif
<div class="takeaway-grid">@foreach($visual[3] as $point)<div class="takeaway"><span>{{ $loop->iteration }}</span><strong>{{ $point }}</strong></div>@endforeach</div>
@endif
<section class="lesson-reading" aria-label="Pembahasan dan praktik">@include('learning._content',['content'=>$section->content])</section>
