<h2 class="h5 fw-bold mb-2">Checkpoint dan aktivitas</h2><p class="small text-secondary mb-3">{{ $isPreview?'Lihat kegiatan yang akan dikerjakan siswa.':'Sudah mencoba? Sekarang cek pemahamanmu atau lanjutkan tugas.' }}</p>
<div class="studio-activity-grid">
@forelse($activities as $activity)
@php($icon=match($activity->kind){'quiz','checkpoint'=>'bi-patch-question','practice'=>'bi-tools','matching','drag_drop','sorting','game'=>'bi-controller',default=>'bi-lightning'})
@if($isPreview)<details class="studio-activity-details"><summary><span class="d-flex gap-3 align-items-center"><span class="studio-activity-icon"><i class="bi {{ $icon }}" aria-hidden="true"></i></span><span class="studio-activity-copy"><span class="studio-activity-pill">{{ $activity->is_required?'WAJIB':'LATIHAN OPSIONAL' }}</span><strong>{{ $activity->title }}</strong><small>{{ \App\Models\Activity::KINDS[$activity->kind] }} · Buka pratinjau +</small></span></span></summary><p>{{ $activity->instructions }}</p>
@if(in_array($activity->kind,['matching','drag_drop','sorting','game']))
@can('preview',$module)<a class="btn btn-outline-primary" href="{{ route('assessment.activities.preview',[$module,$activity]) }}">Coba game</a>@endcan
@else
@if(in_array($activity->kind,['quiz','checkpoint']))@foreach(array_slice($activity->currentVersion->definition['questions']??[],0,1) as $question)<div class="border rounded p-3 mb-2"><strong>{{ $question['prompt'] }}</strong>@foreach($question['choices']??[] as $choice)<label class="d-block mt-2"><input type="radio" disabled> {{ $choice['label'] }}</label>@endforeach</div>@endforeach @endif
<p class="small text-secondary">Pratinjau tidak membuat percobaan atau menyimpan nilai siswa.</p>
@endif
</details>
@else
<a class="studio-activity-card" href="{{ route('assessment.student.activity',$activity) }}" aria-label="{{ $activity->title }}"><span class="studio-activity-icon"><i class="bi {{ $icon }}" aria-hidden="true"></i></span><span class="studio-activity-copy"><span class="studio-activity-pill">{{ $activity->is_required?'WAJIB':'LATIHAN OPSIONAL' }}</span><strong>{{ $activity->title }}</strong><small>{{ \App\Models\Activity::KINDS[$activity->kind] }} · {{ $activity->is_required?'Selesaikan untuk melanjutkan':'Boleh dicoba ulang untuk berlatih' }}</small></span><i class="bi bi-arrow-right" aria-hidden="true"></i></a>
@endif
@empty
<p class="text-secondary">{{ $section->is_required?'Checkpoint belum tersedia. Hubungi guru untuk bagian ini.':'Tidak ada aktivitas wajib di sini. Lanjutkan setelah kamu mempelajari bagian ini.' }}</p>
@endforelse
</div>
