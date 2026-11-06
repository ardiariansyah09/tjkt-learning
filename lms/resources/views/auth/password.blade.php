@extends(auth()->user()->must_change_password?'layouts.guest':'layouts.app')
@section('title','Ganti password')
@section('content')
@unless(auth()->user()->must_change_password)<div class="profile-page card p-4"><a href="{{ route('profile.edit') }}" class="mb-3">← Profil saya</a>@endunless
<h2 class="fw-bold">Amankan akun Anda</h2><p class="text-secondary">@if(auth()->user()->must_change_password)Sebelum belajar, ganti password awal Anda.@else Perbarui password akun Anda.@endif Gunakan minimal 12 karakter dengan huruf dan angka.</p>
<form action="{{ route('password.update') }}" method="POST">@csrf @method('PUT')
<div class="mb-3"><label for="current_password" class="form-label">Password saat ini</label><input id="current_password" name="current_password" type="password" autocomplete="current-password" class="form-control" required></div>
<div class="mb-3"><label for="password" class="form-label">Password baru</label><input id="password" name="password" type="password" autocomplete="new-password" class="form-control" minlength="12" required></div>
<div class="mb-4"><label for="password_confirmation" class="form-label">Konfirmasi password baru</label><input id="password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" class="form-control" required></div><button class="btn btn-primary w-100">Simpan password</button></form>
@if(auth()->user()->must_change_password)<form method="POST" action="{{ route('logout') }}" class="mt-3 text-center">@csrf<button class="btn btn-link">Keluar dari akun</button></form>
@endif @unless(auth()->user()->must_change_password)</div>@endunless
@endsection