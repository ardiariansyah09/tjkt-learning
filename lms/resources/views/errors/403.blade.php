@extends('layouts.guest')
@section('title','Akses dibatasi')
@section('content')<div class="eyebrow text-primary">403</div><h1 class="h3 mt-3">Akses dibatasi</h1><p class="text-secondary">Anda tidak memiliki izin untuk mengakses halaman ini.</p><a href="{{ url('/') }}" class="btn btn-primary">Kembali ke beranda</a>@endsection