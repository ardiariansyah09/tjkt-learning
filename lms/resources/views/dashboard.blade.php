@extends('layouts.app')
@section('title','Beranda')
@section('content')
<h1 class="h3 fw-bold mb-2">Beranda</h1><p class="text-secondary mb-4">{{ auth()->user()->role==='admin'?'Kelola pengguna, kelas, dan materi.':(auth()->user()->role==='guru'?'Pantau perkembangan siswa dan tindak lanjuti hasil belajarnya.':'Lanjutkan materi dan lihat hasil belajar Anda.') }}</p>
@if(auth()->user()->role!=='siswa')
<div class="d-flex flex-wrap gap-2 mb-4"><a class="btn btn-primary" href="{{ route('assessment.reports.index') }}">Lihat progres &amp; nilai</a><a class="btn btn-outline-primary" href="{{ route('practice.index') }}">Hasil menunggu penilaian <span class="badge text-bg-light">{{ $stats['Praktik menunggu penilaian']??0 }}</span></a></div>
@endif
@if(auth()->user()->role==='admin')
<div class="row g-3 mb-4">@foreach(array_intersect_key($stats,array_flip(['Total siswa','Total guru','Rombel aktif','Materi terbit'])) as $label=>$value)<div class="col-sm-6 col-xl-3"><div class="card p-4"><span>{{ $label }}</span><strong class="h2 mt-2">{{ $value }}</strong></div></div>@endforeach</div>
<details class="mb-4"><summary>Administrasi tambahan</summary><div class="d-flex flex-wrap gap-2 mt-3"><a class="btn btn-outline-secondary" href="{{ route('admin.rayons.index') }}">Data rayon</a><a class="btn btn-outline-secondary" href="{{ route('assessment.audit') }}">Riwayat sistem</a></div></details>
@endif
@if(auth()->user()->role==='siswa') @include('assessment._dashboard') @else @include('assessment._staff-dashboard') @endif
@endsection
