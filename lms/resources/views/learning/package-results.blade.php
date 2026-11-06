@php
 $packages=app(\App\Services\LearningPackage::class);
 $snapshot=$packages->snapshot($student,$module);
 $data=$snapshot?json_decode($snapshot->data,true):[];
 $grades=$packages->grades($packages->entry($module),$data);
 $journal=json_decode($data['tjkt:'.$module->package_slug.':studio:v1']??'{}',true)?:[];
 $journal=is_array($journal)?$journal:[];
 $experiments=is_array($journal['experiments']??null)?array_values(array_filter($journal['experiments'],'is_array')):[];
@endphp
<a class="btn btn-outline-secondary mb-3" href="{{ route('assessment.reports.index',request()->only(['rombel_id','module_id'])) }}">← Progres &amp; Nilai</a>
<h1 class="h3">{{ $student->name }}</h1><p>{{ $module->title }}</p>
<div class="row g-3 mb-4"><div class="col-md-4"><div class="card p-4">Progres<strong class="h2">{{ $progress->completion_percent }}%</strong><span>{{ $progress->completed_items }} / {{ $progress->required_items }} tahap lulus</span></div></div><div class="col-md-4"><div class="card p-4">Evaluasi akhir<strong class="h2">{{ $progress->final_score??'Belum ada nilai' }}</strong><span>{{ $progress->status==='completed'?'Memenuhi syarat sertifikat':'Belum memenuhi syarat sertifikat' }}</span></div></div><div class="col-md-4"><div class="card p-4">Sinkronisasi terakhir<strong>{{ $snapshot?->updated_at??'Belum ada data' }}</strong><span>{{ $snapshot?->source==='legacy-import'?'Diimpor dari perangkat lama':'Hasil aktivitas dari browser siswa' }}</span></div></div></div>
<p class="small text-secondary">Hasil ini dilaporkan oleh aktivitas di browser; belum merupakan penilaian praktik yang diverifikasi guru. Kelayakan sertifikat tidak membuktikan PDF sudah dicetak.</p>
<div class="card p-4 mb-4"><h2 class="h5">Hasil tiap tahap</h2><div class="table-responsive"><table class="table"><thead><tr><th>Tahap</th><th>Nilai</th><th>Minimum</th><th>Status</th></tr></thead><tbody>@foreach($grades as $stage)<tr><td>{{ $stage['title'] }}</td><td>{{ $stage['grade']??'Belum ada nilai' }}</td><td>{{ $stage['threshold'] }}</td><td>{{ $stage['passed']?'Lulus':'Belum lulus' }}</td></tr>@endforeach</tbody></table></div></div>
<div class="card p-4"><h2 class="h5">Jurnal dan bukti aktivitas</h2>
@if(!$journal)<p>Belum ada jurnal yang tersinkron.</p>@else
@foreach(['prediction'=>'Prediksi awal','evidence'=>'Bukti percobaan','reasoning'=>'Penjelasan dan batas kesimpulan','transfer'=>'Perbaikan dan tindak lanjut'] as $key=>$label)<h3 class="h6 mt-3">{{ $label }}</h3><p style="white-space:pre-wrap">{{ is_string($journal['journal'][$key]??null)?$journal['journal'][$key]:'Belum diisi' }}</p>@endforeach
<p class="text-secondary">{{ count($experiments) }} catatan percobaan tersimpan.</p>
@foreach($experiments as $experiment)<details class="border rounded p-3 mb-2"><summary>Percobaan {{ $loop->iteration }} · {{ is_string($experiment['at']??null)?$experiment['at']:'Waktu tidak tercatat' }}</summary><div class="mt-3"><h3 class="h6">Masukan</h3>@include('learning.package-evidence-value',['value'=>$experiment['inputs']??[],'depth'=>0])<h3 class="h6 mt-3">Hasil</h3>@include('learning.package-evidence-value',['value'=>$experiment['result']??[],'depth'=>0])</div></details>@endforeach
@endif
</div>
@include('learning.package-atp-evidence')
