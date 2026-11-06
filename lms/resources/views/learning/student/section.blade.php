@extends(($previewAsStudent??false)?'layouts.student-preview':'layouts.app')
@section('title',$section->title)
@section('content')
@php
$isPreview=$isPreview??false;
$position=$sections->search(fn($s)=>$s->id===$section->id)+1;
$sectionUrl=fn($s)=>$isPreview?route('learning.modules.preview',[$module,'section'=>$s->id,'mode'=>($previewAsStudent??false)?'student':'teacher']):route('student.sections.show',[$module,$s]);
$moduleUrl=$isPreview?route('learning.modules.preview',[$module,'mode'=>($previewAsStudent??false)?'student':'teacher']):route('student.modules.show',$module);
$progress=$isPreview?null:\App\Models\ModuleProgress::where('user_id',auth()->id())->where('module_id',$module->id)->first();
$percent=$progress?->completion_percent??0;
$requiredCount=$progress?->required_items ?? ($module->sequential_learning ? $sections->count()+$module->activities()->whereNull('module_section_id')->where('is_published',true)->where('is_required',true)->whereNotNull('current_version_id')->count() : $sections->where('is_required',true)->count()+$module->activities()->where('is_published',true)->where('is_required',true)->where('kind','!=','checkpoint')->whereNotNull('current_version_id')->count());
$states=$isPreview?[]:app(\App\Services\LearningSequence::class)->states(auth()->user(),$module);
$canNext=$isPreview||!$next||($states[$next->id]['open']??true);
$current=$states[$section->id]??['complete'=>false,'open'=>true,'needs_assessment'=>false];
$studioCatalog=require resource_path('learning/student-studio.php');
$studioCode=collect(array_keys($studioCatalog))->first(fn($code)=>$module->code===$code||str_starts_with($module->code,$code.'-'));
$studioModule=$studioCatalog[$studioCode]??[];
$studioMeta=$studioModule[$section->title]??null;
@endphp
@if($isPreview)
<div class="alert alert-warning d-flex flex-wrap justify-content-between gap-2"><span><strong>{{ ($previewAsStudent??false)?'Pratinjau tampilan siswa':'Pratinjau pengajar' }}</strong> · {{ ($previewAsStudent??false)?'Mode siswa':'Mode pengajar' }} · {{ $module->status }} · Progres dan waktu belajar tidak dicatat. Semua langkah dapat ditinjau pengajar.</span><div class="d-flex flex-wrap gap-2"><a class="btn btn-sm {{ !($previewAsStudent??false)?'btn-dark':'btn-outline-dark' }}" href="{{ route('learning.modules.preview',[$module,'section'=>$section->id,'mode'=>'teacher']) }}">Tampilan pengajar</a><a class="btn btn-sm {{ ($previewAsStudent??false)?'btn-dark':'btn-outline-dark' }}" href="{{ route('learning.modules.preview',[$module,'section'=>$section->id,'mode'=>'student']) }}">Sebagai siswa</a></div>@can('update',$module)<a href="{{ route('learning.modules.edit',$module) }}">Kelola modul</a>@endcan</div>
@endif
<div class="learning-hero studio-hero"><div class="eyebrow mb-2">{{ $module->code }} · FASE {{ $module->phase }} · KELAS {{ $module->grade }}</div><h1 class="fw-bold">{{ $studioMeta['title']??$section->title }}</h1><div class="d-flex flex-wrap gap-2 mt-3"><span class="learning-pill"><i class="bi bi-signpost-split"></i> Langkah {{ $position }} dari {{ $sections->count() }}</span><span class="learning-pill"><i class="bi bi-lightning"></i> {{ \App\Models\ModuleSection::KINDS[$section->kind] }}</span>@if($studioMeta)<span class="learning-pill"><i class="bi bi-clock"></i> Sekitar {{ $studioMeta['minutes'] }} menit jelajah awal</span>@endif @if($module->sequential_learning)<span class="learning-pill"><i class="bi bi-lock"></i> Belajar berurutan</span>@endif</div></div>
<div class="studio-toolbar" role="region" aria-label="Pengaturan belajar"><div class="studio-rhythm"><span><i class="bi bi-eye"></i>Pahami</span><b>→</b><span><i class="bi bi-controller"></i>Coba</span><b>→</b><span><i class="bi bi-check2-circle"></i>Cek pemahaman</span></div><div class="studio-toolbar-actions"><button type="button" class="btn btn-sm btn-outline-secondary" data-studio-focus aria-pressed="false"><i class="bi bi-fullscreen me-1" aria-hidden="true"></i><span>Mode fokus</span></button><button type="button" class="btn btn-sm btn-outline-secondary" data-studio-text aria-pressed="false"><i class="bi bi-type me-1" aria-hidden="true"></i><span>Perbesar teks</span></button><a class="btn btn-sm btn-outline-primary" href="#lesson-activity-panel">Ke aktivitas <i class="bi bi-arrow-down ms-1" aria-hidden="true"></i></a></div></div>
<div class="card border-0 rounded-4 studio-progress mb-3"><div class="d-flex flex-wrap justify-content-between gap-2 mb-2"><strong>Progres belajar {{ $isPreview?'(simulasi)':'' }}: {{ $percent }}%</strong><span>{{ $progress?->completed_items??0 }} / {{ $requiredCount }} {{ $module->sequential_learning?'langkah belajar':'komponen wajib' }}</span></div><div class="progress" role="progressbar" aria-label="Progres penyelesaian modul" aria-valuenow="{{ $percent }}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:{{ $percent }}%"></div></div><small class="text-secondary mt-2">Selesaikan bagian ini untuk melanjutkan. Checkpoint dan tugas wajib tetap perlu lulus.</small></div>
@include('learning._lesson-navigation')
<div class="row g-4 lesson-shell"><aside class="col-xl-3"><div class="lesson-side">@include('learning._lesson-path')</div></aside><div class="col-xl-9"><article class="lesson-article"><div class="studio-explanation-label"><i class="bi bi-compass" aria-hidden="true"></i>{{ $studioMeta['lab']??null?'Lihat kasusnya. Coba pilihanmu. Temukan alasannya.':'Mulai dari contoh, lalu coba langkah kecil.' }}</div>
@if($module->code===\App\Services\FirstTjktModule::CODE)
@include('learning._visual-lesson')
@elseif($module->code===\App\Services\EntrepreneurshipTjktModule::CODE || str_starts_with($module->code,\App\Services\EntrepreneurshipTjktModule::CODE.'-'))
@include('learning._business-visual')
@else
@include('learning._content',['content'=>$section->content])
@endif
@if(!$isPreview)
<div class="alert alert-light border mt-4" data-reading-tracker data-start-url="{{ route('assessment.student.reading.start',$section) }}" data-heartbeat-url="{{ route('assessment.student.reading.heartbeat','SESSION_ID') }}"><span data-reading-status aria-live="polite">Menyiapkan sesi belajar...</span><small class="d-block text-secondary mt-1">Durasi aktif adalah estimasi, bukan penentu kelulusan.</small></div>
@endif
<section class="studio-activity-panel" id="lesson-activity-panel" aria-label="Checkpoint dan aktivitas">@include('learning._studio-activities')</section>
@if(!$isPreview)
<div class="mt-4 border-top pt-4">
@if($current['complete'])<div class="alert alert-success mb-0"><i class="bi bi-check-circle me-2"></i>Submateri ini sudah selesai. Kamu bisa melanjutkan langkah berikutnya.</div>
@elseif(!$current['needs_assessment'])
<form method="POST" action="{{ route('student.sections.complete',[$module,$section]) }}">@csrf<button class="btn btn-success">Saya sudah mempelajari bagian ini</button><p class="small text-secondary mt-2">Konfirmasi ini membuka langkah berikutnya. Bacaan ber-checkpoint tetap memerlukan kelulusan checkpoint.</p></form>
@else
<div class="alert alert-info mb-0">Selesaikan checkpoint dan seluruh aktivitas wajib di bagian ini untuk membuka langkah berikutnya.@if($activities->where('is_required',true)->isEmpty()) Guru perlu menambahkan checkpoint pada bacaan wajib ini.@endif</div>
@endif
</div>
@endif
</article>@include('learning._lesson-navigation')</div></div>
@endsection
@push('styles')<link href="{{ asset('assets/student-studio.css') }}?v={{ filemtime(public_path('assets/student-studio.css')) }}" rel="stylesheet">@endpush
@push('scripts')<script src="{{ asset('assets/learning-experience.js') }}?v={{ filemtime(public_path('assets/learning-experience.js')) }}" defer></script><script src="{{ asset('assets/student-studio.js') }}?v={{ filemtime(public_path('assets/student-studio.js')) }}" defer></script>@endpush
