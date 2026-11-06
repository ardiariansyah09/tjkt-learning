<div class="lesson-path-heading"><span class="path-kicker"><i class="bi bi-compass me-1"></i>PETA BELAJAR</span><a href="{{ $moduleUrl }}" class="path-module-title">{{ $module->title }}</a><div class="path-overview"><span><i class="bi bi-layers me-1"></i>{{ $sections->count() }} bagian</span><span>{{ $isPreview?'Mode pratinjau':collect($states)->where('complete',true)->count().' selesai' }}</span></div></div>
<button class="btn btn-outline-primary d-xl-none mb-3 w-100" type="button" data-bs-toggle="collapse" data-bs-target="#lesson-sections" aria-expanded="false" aria-controls="lesson-sections"><i class="bi bi-signpost-split me-2"></i>Peta perjalanan ({{ $sections->count() }})</button>
<nav id="lesson-sections" class="lesson-path collapse d-xl-block" aria-label="Submateri">
@foreach($sections as $item)
@php
$active=$item->id===$section->id;
$complete=!$isPreview&&($states[$item->id]['complete']??false);
$locked=!$isPreview&&!($states[$item->id]['open']??true);
$stateClass=$active?'is-active':($complete?'is-complete':($locked?'is-locked':'is-ready'));
$status=$active?($isPreview?'Sedang ditinjau':'Sedang dibuka'):($complete?'Selesai':($locked?'Terkunci':($isPreview?'Pratinjau':'Siap dipelajari')));
@endphp
@if($locked)<div class="path-step {{ $stateClass }}" aria-disabled="true">
@else<a class="path-step {{ $stateClass }}" href="{{ $sectionUrl($item) }}" @if($active)aria-current="page"@endif>
@endif
<span class="path-node" aria-hidden="true">@if($complete)✓@elseif($locked)<i class="bi bi-lock-fill"></i>@elseif($active)<i class="bi bi-play-fill"></i>@else{{ str_pad($loop->iteration,2,'0',STR_PAD_LEFT) }}@endif</span><span class="path-copy"><span class="path-meta">LANGKAH {{ str_pad($loop->iteration,2,'0',STR_PAD_LEFT) }}</span><strong>{{ $studioModule[$item->title]['title']??$item->title }}</strong><span class="path-state">@if($complete)<i class="bi bi-check-circle-fill me-1"></i>@endif{{ $status }}</span></span>
@if($locked)</div>@else</a>@endif
@endforeach
</nav>
