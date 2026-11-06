@extends('layouts.app')
@section('title','Edit profil')
@section('content')
<div class="profile-page"><h1 class="h3 fw-bold">Edit profil</h1><p class="text-secondary">Perbarui foto, nama tampilan, dan email akun Anda.</p>
<form action="{{ route('profile.update') }}" method="POST" enctype="multipart/form-data" class="card p-4 mt-4">@csrf @method('PUT')
<div class="d-flex gap-3 align-items-center mb-4">@if($person->avatar_hash)<img class="profile-photo-preview" src="{{ route('profile.photo',['v'=>$person->avatar_hash]) }}" alt="Foto profil saat ini">@else<span class="avatar profile-photo-preview" aria-hidden="true">{{ mb_substr($person->name,0,1) }}</span>@endif<div><label for="photo" class="form-label fw-semibold">Foto profil</label><input type="file" id="photo" name="photo" accept="image/jpeg,image/png,image/webp" class="form-control"><small class="d-block text-secondary mt-1">JPG, PNG, atau WebP. Maksimal 2 MB dan 2.000 × 2.000 piksel.</small>@if($person->avatar_hash)<label class="form-check mt-2"><input type="checkbox" class="form-check-input" name="remove_photo" value="1">Hapus foto saat ini</label>@endif</div></div>
<label class="form-label" for="name">Nama tampilan</label><input class="form-control mb-3" id="name" name="name" maxlength="150" value="{{ old('name',$person->name) }}" autocomplete="name" required>
<label class="form-label" for="email">Email <span class="text-secondary small">(opsional)</span></label><input class="form-control mb-3" type="email" id="email" name="email" maxlength="255" autocomplete="email" value="{{ old('email',$person->email) }}">
<p class="small text-secondary">Username: <strong>{{ $person->username }}</strong>. Data kelas dan identitas sekolah dikelola admin.</p>
<div class="d-flex gap-2 flex-wrap"><button type="submit" class="btn btn-primary">Simpan profil</button><a class="btn btn-light" href="{{ route($person->dashboard()) }}">Kembali</a></div>
</form></div>
@endsection
