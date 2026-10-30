const fs=require('fs'),path=require('path');
const base=path.resolve(__dirname,'../lms');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const write=(p,t)=>{fs.mkdirSync(path.dirname(path.join(base,p)),{recursive:true});fs.writeFileSync(path.join(base,p),t)};
let layout=read('resources/views/layouts/app.blade.php');
if(layout.includes('aria-label="Menu utama"'))throw Error('UI already prepared. Edit the final LMS files instead of replaying this one-time transformation.');
const a=layout.indexOf('<nav class="nav flex-column gap-2">'),b=layout.indexOf('</nav>',a)+6;
layout=layout.slice(0,a)+`<nav class="nav flex-column gap-2" aria-label="Menu utama">
<a class="nav-link {{ request()->routeIs('*.dashboard')?'active':'' }}" href="{{ route(auth()->user()->dashboard()) }}"><i class="bi bi-house me-3"></i>Beranda</a>
@if(auth()->user()->role==='admin')
<a class="nav-link {{ request()->is('admin/siswa*','admin/guru*','admin/impor*')?'active':'' }}" href="{{ route('admin.people.index','siswa') }}"><i class="bi bi-people me-3"></i>Pengguna</a>
<a class="nav-link {{ request()->is('admin/rombel*','admin/rayon*')?'active':'' }}" href="{{ route('admin.rombels.index') }}"><i class="bi bi-collection me-3"></i>Kelas</a>
@elseif(auth()->user()->role==='guru')
<a class="nav-link {{ request()->is('pengajaran/monitoring*','pengajaran/praktik*','pengajaran/verifikasi*','pengajaran/analitik*')?'active':'' }}" href="{{ route('assessment.reports.index') }}"><i class="bi bi-bar-chart me-3"></i>Progres &amp; Nilai</a>
@else
<a class="nav-link {{ request()->is('siswa/progres*')?'active':'' }}" href="{{ route('assessment.student.progress') }}"><i class="bi bi-bar-chart me-3"></i>Progres &amp; Nilai</a>
@endif
<a class="nav-link {{ request()->is('pengajaran/modul*','pengajaran/bank-soal*','siswa/materi*')?'active':'' }}" href="{{ auth()->user()->role==='siswa'?route('student.modules.index'):route('learning.modules.index') }}"><i class="bi bi-book me-3"></i>Materi</a>
</nav>`+layout.slice(b);
layout=layout.replace('<span class="avatar">','<a class="btn btn-sm btn-outline-secondary" href="{{ route(\'password.edit\') }}" aria-label="Pengaturan akun"><i class="bi bi-person-gear"></i></a><span class="avatar">');
write('resources/views/layouts/app.blade.php',layout);
write('resources/views/dashboard.blade.php',`@extends('layouts.app')
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
@include('assessment._dashboard')
@endsection
`);
// Retain the data and access checks; hide advanced choices until requested.
let report=read('resources/views/assessment/reports/index.blade.php');
report=report.replaceAll('Monitoring dan Laporan','Progres & Nilai').replaceAll('Monitoring dan laporan pembelajaran','Progres & Nilai');
const formStart=report.indexOf('<form method="GET"'),formEnd=report.indexOf('</form>',formStart)+7;
const oldForm=report.slice(formStart,formEnd);
const fields=[...oldForm.matchAll(/<div class="col-md-4">[\s\S]*?<\/div>/g)].map(m=>m[0]);
const primary=fields.filter(t=>/for="(?:q|rombel_id|module_id)"/.test(t));
const advanced=fields.filter(t=>!primary.includes(t));
report=report.slice(0,formStart)+`<form method="GET" class="mb-4"><div class="row g-2">${primary.join('')}</div><details class="mt-3" @if(request()->hasAny(['academic_year','semester','status','from','to'])) open @endif><summary>Filter lainnya dan arsip</summary><div class="row g-2 mt-2">${advanced.join('')}</div></details><div class="d-flex gap-2 mt-3"><button class="btn btn-primary">Tampilkan</button><a class="btn btn-light" href="{{ route('assessment.reports.index') }}">Atur ulang</a></div></form>`+report.slice(formEnd);
report=report.replace(/<div class="d-flex flex-wrap gap-2 mb-4">([\s\S]*?)<\/div>/,'<details class="mb-4"><summary>Pilihan unduhan lainnya</summary><div class="d-flex flex-wrap gap-2 mt-2">$1<a class="btn btn-sm btn-outline-primary" href="{{ route(\'assessment.reports.export\',array_merge(request()->query(),[\'format\'=>\'interactive\'])) }}">Riwayat lab dan game</a></div></details>');
report=report.replace(/<a class="btn btn-outline-primary mt-3"[\s\S]*?<\/a>/,'');
report=report.replace('colspan="6"','colspan="7"');
report=report.replace('<div class="row g-3 mb-4">','<div class="d-flex flex-wrap gap-2 mb-4"><a class="btn btn-outline-secondary" href="{{ route(\'practice.index\') }}">Hasil perlu dinilai</a><details><summary class="btn btn-light">Tindakan lainnya</summary><div class="p-3 border rounded"><a href="{{ route(\'learning.verifications.index\') }}">Verifikasi pencapaian</a><br><a href="{{ route(\'learning.analytics\') }}">Analisis terperinci</a></div></details></div><div class="row g-3 mb-4">');
write('resources/views/assessment/reports/index.blade.php',report);
let people=read('resources/views/admin/people/index.blade.php');
people=people.replace("@section('content')",`@section('content')<nav class="d-flex gap-2 mb-4" aria-label="Jenis pengguna"><a class="btn btn-outline-primary" href="{{ route('admin.people.index','siswa') }}">Siswa</a><a class="btn btn-outline-primary" href="{{ route('admin.people.index','guru') }}">Guru</a></nav>`);
write('resources/views/admin/people/index.blade.php',people);
let material=read('resources/views/learning/manage/index.blade.php');
material=material.replace("@section('content')",`@section('content')<details class="mb-3"><summary>Alat penyusunan materi</summary><a class="btn btn-outline-secondary mt-2" href="{{ route('assessment.questions.index') }}">Bank soal</a></details>`);
write('resources/views/learning/manage/index.blade.php',material);
let section=read('resources/views/learning/manage/section.blade.php').replace('Engine aktivitas interaktif ditambahkan pada fase berikutnya.','Aktivitas interaktif dikelola pada modul terkait. Paket materi interaktif dipasang melalui proses penerbitan modul.').replace('Bobot dan kewajiban disimpan untuk engine progres Fase 4.','Bobot dan kewajiban digunakan untuk menghitung progres.');
write('resources/views/learning/manage/section.blade.php',section);
let preview=read('resources/views/learning/manage/preview.blade.php').replace('Riwayat akses dan progres aktivitas ditambahkan pada Fase 4.','Progres dan hasil siswa tersedia melalui Progres & Nilai.');write('resources/views/learning/manage/preview.blade.php',preview);
// A required game or lab can itself establish completion. Required sections
// without any required assessment remain locked; opening a page never passes it.
let sequence=read('app/Services/LearningSequence.php');sequence=sequence.replace("if ($s->is_required && $checks->where('kind', 'checkpoint')->isEmpty())",'if ($s->is_required && $checks->isEmpty())');write('app/Services/LearningSequence.php',sequence);
console.log('Prepared simplified LMS navigation, dashboard, reports and completion rules.');
