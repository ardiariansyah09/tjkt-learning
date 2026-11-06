@extends('layouts.app')
@section('title','Penugasan materi')
@section('content')
<a href="{{ route('learning.modules.index') }}" class="btn btn-light mb-3">← Materi</a>
<h1 class="h3">{{ $module->title }}</h1><p class="text-secondary">Fase {{ $module->phase }} · Kelas {{ $module->grade }} · {{ $module->sections()->count() }} tahap</p>
<p>{{ $module->description }}</p><a href="{{ route('packages.launch',$module) }}" class="btn btn-outline-primary mb-4">Pratinjau materi interaktif</a>
<form method="POST" action="{{ route('packages.assign',$module) }}" class="card p-4">@csrf
<h2 class="h5">Kelas yang menerima materi</h2>
@forelse($rombels->where('grade',$module->grade) as $rombel)<label class="form-check my-2"><input class="form-check-input" type="checkbox" name="rombel_ids[]" value="{{ $rombel->id }}" @checked(in_array($rombel->id,old('rombel_ids',$module->rombels->modelKeys())?:[]))>{{ $rombel->name }} · {{ $rombel->academic_year }} / {{ $rombel->semester }}</label>@empty<p>Belum ada kelas aktif yang sesuai tingkat materi ini.</p>@endforelse
@if(auth()->user()->role==='admin')<label class="form-label mt-3" for="status">Publikasi</label><select id="status" class="form-select mb-3" name="status">@foreach(['draft'=>'Draft','published'=>'Terbit','unpublished'=>'Sembunyikan dari siswa'] as $value=>$label)<option value="{{ $value }}" @selected($module->status===$value)>{{ $label }}</option>@endforeach</select>@else<input type="hidden" name="status" value="{{ $module->status }}">@endif
@if($module->prerequisites->isNotEmpty())<details class="my-3"><summary>Materi prasyarat</summary><ul>@foreach($module->prerequisites as $rule)<li>{{ $rule->requiredModule?->title }}</li>@endforeach</ul><p>Pastikan siswa juga memiliki akses atau bukti kelulusan materi prasyarat. Bukti belajar sebelumnya dapat ditinjau guru melalui hasil siswa.</p></details>@endif
<button class="btn btn-primary align-self-start">Simpan penugasan</button></form>
@endsection
