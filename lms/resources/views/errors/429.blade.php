@extends('layouts.guest')
@section('title','Terlalu banyak permintaan')
@section('content')<div class="eyebrow text-primary">429</div><h1 class="h3 mt-3">Terlalu banyak permintaan</h1><p class="text-secondary">Tunggu sebentar sebelum mencoba kembali.</p><a href="{{ url('/') }}" class="btn btn-primary">Kembali ke beranda</a>@endsection