<nav class="lesson-navigation" aria-label="Navigasi belajar {{ isset($navigationBottom)?'bawah':'atas' }}">
@if($previous)<a class="btn btn-outline-primary" href="{{ $sectionUrl($previous) }}">← Sebelumnya</a>@else<a class="btn btn-outline-secondary" href="{{ $moduleUrl }}">Daftar materi</a>@endif
@if($next)
@if($canNext)<a class="btn btn-primary" href="{{ $sectionUrl($next) }}">Berikutnya →</a>@else<span class="btn btn-secondary disabled" aria-disabled="true"><i class="bi bi-lock me-1"></i>Selesaikan bagian ini dahulu</span>@endif
@else<a class="btn btn-outline-primary" href="{{ $moduleUrl }}">Kembali ke daftar materi</a>@endif
</nav>
