@extends('layouts.app')
@section('title',$rayon->exists?'Edit Rayon':'Tambah Rayon')
@section('content')
<h1 class="h3 fw-bold mb-4">{{ $rayon->exists?'Edit':'Tambah' }} rayon</h1>
<form method="POST" action="{{ $rayon->exists?route('admin.rayons.update',$rayon):route('admin.rayons.store') }}" class="card border-0 rounded-4 p-4">@csrf @if($rayon->exists)@method('PUT')@endif
<div class="row g-3"><div class="col-md-8"><label class="form-label" for="name">Nama rayon</label><input class="form-control" id="name" name="name" maxlength="50" value="{{ old('name',$rayon->name) }}" required></div><div class="col-md-4"><label class="form-label" for="is_active">Status</label><select class="form-select" id="is_active" name="is_active"><option value="1" @selected(old('is_active',$rayon->is_active))>Aktif</option><option value="0" @selected(!old('is_active',$rayon->is_active))>Nonaktif</option></select></div><div class="col-12"><p class="small text-secondary">Rayon nonaktif tetap tercatat pada siswa lama, tetapi tidak dapat dipilih untuk penempatan baru. Mengubah nama memperbarui tampilan siswa yang terhubung.</p><button class="btn btn-primary">Simpan rayon</button><a class="btn btn-outline-secondary" href="{{ route('admin.rayons.index') }}">Kembali</a></div></div></form>
@endsection
