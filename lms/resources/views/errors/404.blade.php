@extends('layouts.guest')
@section('title','Halaman tidak ditemukan')
@section('content')<div class="eyebrow text-primary">404</div><h1 class="h3 mt-3">Halaman tidak ditemukan</h1><p class="text-secondary">Alamat yang Anda buka tidak tersedia.</p><a href="{{ url('/') }}" class="btn btn-primary">Kembali ke beranda</a>@endsection