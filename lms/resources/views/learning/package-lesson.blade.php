@extends('layouts.app')
@section('title',$module->title)
@section('bodyAttributes')class="lms-course-page {{ $lesson['classes'] }}" data-module-id="{{ $module->package_slug }}"@endsection
@push('head')
<script>window.TJKTLMS={!! $configJson !!};</script><script src="{{ asset('assets/lms-course-bridge.js') }}?v={{ filemtime(public_path('assets/lms-course-bridge.js')) }}"></script>
@endpush
@push('styles')
@foreach($lesson['styles'] as $style)<link rel="stylesheet" href="{{ $style }}">@endforeach
<link rel="stylesheet" href="{{ asset('assets/lms-course.css') }}?v={{ filemtime(public_path('assets/lms-course.css')) }}">
@endpush
@section('lesson_outline')
<div id="lms-learning-outline" class="{{ $lesson['classes'] }}"><h2 class="lms-outline-heading">Tahap pembelajaran</h2>{!! $lesson['outline'] !!}</div>
@endsection
@section('content')
<div class="lms-course-context"><a href="{{ $config['back'] }}" class="btn btn-sm btn-outline-secondary">← Daftar materi</a><span>Fase {{ $module->phase }} · Kelas {{ $module->grade }}</span>@if($config['preview'])<span class="badge text-bg-info">Pratinjau pengajar</span>@endif<button type="button" class="btn btn-sm btn-outline-primary d-lg-none" data-open-lesson-outline>Daftar tahap</button></div>
<div id="lms-learning-root" class="{{ $lesson['classes'] }}">{!! $lesson['content'] !!}</div>
<section id="lms-save-state" class="lms-save-state" aria-label="Penyimpanan hasil belajar"></section>
@endsection
@push('scripts')
@foreach($lesson['scripts'] as $script){!! $script !!}@endforeach
@endpush
