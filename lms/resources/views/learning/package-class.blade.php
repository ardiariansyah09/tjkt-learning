@extends('layouts.app')
@section('title','Materi kelas')
@section('content')
<a class="btn btn-light mb-3" href="{{ route('learning.modules.index') }}">← Materi</a><h1 class="h3">Atur materi kelas</h1><p class="text-secondary">Pilih kelas, centang materi yang digunakan, lalu simpan sekaligus.</p>
<form method="GET" class="mb-4"><label for="rombel" class="form-label">Kelas</label><div class="d-flex gap-2"><select name="rombel_id" id="rombel" class="form-select">@foreach($rombels as $class)<option value="{{ $class->id }}" @selected($rombel?->id===$class->id)>{{ $class->name }} · {{ $class->academic_year }} / {{ $class->semester }}</option>@endforeach</select><button class="btn btn-outline-primary">Pilih</button></div></form>
@if($rombel)
<form method="POST" action="{{ route('packages.class.store') }}" class="card p-4">@csrf<input type="hidden" name="rombel_id" value="{{ $rombel->id }}">
<h2 class="h5">{{ $rombel->name }}</h2><p>{{ $modules->count() }} materi sesuai tingkat kelas. Materi dari kelas sebelumnya mengikuti bukti kelulusan atau verifikasi guru.</p>
<label class="form-check mb-3"><input class="form-check-input" type="checkbox" id="all-packages">Pilih semua materi</label>
@foreach($modules as $module)<label class="form-check border-top py-3"><input class="form-check-input mt-3" type="checkbox" name="module_ids[]" value="{{ $module->id }}" @checked(in_array($module->id,old('module_ids',$rombel->modules()->whereNotNull('package_slug')->pluck('modules.id')->all())) )><strong>{{ $module->title }}</strong><small class="d-block text-secondary">Fase {{ $module->phase }} · {{ $module->competency }}</small></label>@endforeach
<p class="small text-secondary mt-3">Menghapus centang melepas penugasan pada kelas ini; hasil belajar lama tidak dihapus.</p><button class="btn btn-primary align-self-start">{{ auth()->user()->role==='admin'?'Tugaskan dan terbitkan materi':'Simpan materi kelas' }}</button></form>
@else<p>Belum ada kelas aktif yang dapat dikelola.</p>@endif
@endsection
@push('scripts')<script>document.getElementById('all-packages')?.addEventListener('change',event=>{document.querySelectorAll('input[name="module_ids[]"]').forEach(input=>input.checked=event.target.checked);});</script>@endpush
