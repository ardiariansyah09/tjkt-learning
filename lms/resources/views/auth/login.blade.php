@extends('layouts.guest')
@section('title','Masuk')
@section('content')
<div class="eyebrow text-primary mb-2">SELAMAT DATANG KEMBALI</div><h2 class="fw-bold">Masuk ke ruang belajar</h2><p class="text-secondary mb-4">Gunakan akun yang diberikan oleh admin sekolah.</p>
<form method="POST" action="{{ route('login.store') }}">@csrf
<div class="mb-3"><label for="username" class="form-label">Username</label><input id="username" name="username" class="form-control form-control-lg" value="{{ old('username') }}" autocomplete="username" maxlength="100" required autofocus></div>
<div class="mb-4"><label for="password" class="form-label">Password</label><input type="password" id="password" name="password" class="form-control form-control-lg" autocomplete="current-password" required></div><button class="btn btn-primary btn-lg w-100">Masuk <i class="bi bi-arrow-right ms-2"></i></button></form><p class="small text-secondary mt-4 mb-0">Lupa password atau akun tidak aktif? Hubungi admin sekolah.</p>
@endsection