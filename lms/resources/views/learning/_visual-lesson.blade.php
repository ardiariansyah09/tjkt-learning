@php
$visuals = require resource_path('learning/profesi-tjkt-visuals.php');
preg_match_all('/<!-- section:[a-z_]+\|([^\n]+) -->/',file_get_contents(resource_path('learning/profesi-tjkt-x.md')),$originalTitles);
$visualIndex=array_search($section->title,array_map('trim',$originalTitles[1]),true);
$visual=$visualIndex===false?null:($visuals[$visualIndex]??null);
@endphp
@if($visual)
<div class="mission-intro"><span class="mission-label">MISI {{ str_pad($position,2,'0',STR_PAD_LEFT) }} · PAHAMI → COBA → REFLEKSI</span><h2>{{ $visual[0] }}</h2><p>{{ $visual[1] }}</p></div>
@include('learning._studio-practice')
@if(!($studioMeta['lab']??null))
<div class="lesson-visual"><picture><source media="(max-width:650px)" srcset="{{ asset('assets/learning/profesi-tjkt/'.$visual[2].'-mobile.svg') }}"><img src="{{ asset('assets/learning/profesi-tjkt/'.$visual[2].'.svg') }}" alt="{{ $visual[0] }} — diagram konsep pembelajaran" loading="lazy"></picture><a href="{{ asset('assets/learning/profesi-tjkt/'.$visual[2].'.svg') }}" target="_blank" rel="noopener" class="small">Perbesar ilustrasi ↗</a></div>
@endif
<div class="takeaway-grid">@foreach($visual[3] as $point)<div class="takeaway"><span>{{ $loop->iteration }}</span><strong>{{ $point }}</strong></div>@endforeach</div>
@if($visual[2]==='roles')
<div class="role-grid">@foreach([['bi-headset','IT support','Menerima laporan, memperjelas gejala, dan membantu pengguna.','Bukti: tiket dan catatan pemeriksaan awal.'],['bi-hdd-network','Teknisi jaringan','Memeriksa sambungan LAN sesuai izin dan prosedur.','Bukti: label port dan hasil pengujian sambungan.'],['bi-server','Administrator server','Menangani sistem dan layanan server sesuai kewenangan.','Bukti: status layanan dan catatan perubahan.'],['bi-activity','Operator NOC','Memantau alarm dan meneruskan kejadian ke tim terkait.','Bukti: laporan pemantauan dan eskalasi.']] as [$icon,$role,$task,$proof])<details class="role-card"><summary><i class="bi {{ $icon }}"></i><strong>{{ $role }}</strong><span>Kenali perannya +</span></summary><p>{{ $task }}</p><p class="small">{{ $proof }}</p></details>@endforeach</div>
@endif
@if(in_array($visualIndex+1,[2,6,9])&&!($studioMeta['lab']??null))
<fieldset class="evidence-challenge" data-evidence-check><legend class="h5">Coba pikirkan sebelum lanjut</legend><p>“LAB-08 berhasil membuka LMS pada alamat yang sama.” Ini termasuk apa?</p><label><input type="radio" name="evidence-local" value="fact"> Fakta pengamatan</label><label><input type="radio" name="evidence-local" value="guess"> Kesimpulan bahwa router pasti rusak</label><button type="button" class="btn btn-dark mt-3" data-evidence-submit>Periksa alasan</button><p class="mt-3 mb-0" data-evidence-feedback aria-live="polite">Latihan ini tidak menambah nilai atau membuka materi.</p></fieldset>
@endif
<section class="lesson-reading" aria-label="Pembahasan dan praktik">@include('learning._content',['content'=>$section->content])</section>
@else
@include('learning._content',['content'=>$section->content])
@endif
