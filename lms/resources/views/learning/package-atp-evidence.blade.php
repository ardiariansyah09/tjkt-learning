@php
 $reports=json_decode($data['tjkt:'.$module->package_slug.':activity-reports:v1']??'{}',true);
 $reports=is_array($reports)?array_slice(array_filter($reports,'is_array'),0,45,true):[];
 $atpLabs=[];
 foreach($data as $key=>$raw){
  if(!str_starts_with($key,'tjkt:'.$module->package_slug.':atp-practice:'))continue;
  $lab=json_decode($raw,true);if(is_array($lab)&&is_array($lab['history']??null))$atpLabs[]=$lab;
 }
@endphp
<section class="card p-4 mt-4"><h2 class="h5">Laporan singkat dan latihan ATP</h2>
<p class="small text-secondary">Bukti dilaporkan siswa. Bedakan simulasi/dataset dengan praktik perangkat nyata; belum menjadi nilai praktik terverifikasi.</p>
@forelse($reports as $report)
@php($reportKind=is_string($report['kind']??null)?$report['kind']:'')
<details class="border rounded p-3 mb-2"><summary>{{ is_string($report['activity']??null)?$report['activity']:'Aktivitas' }}</summary>
<p class="mt-2">Sumber: {{ ['model'=>'Simulasi/model','dataset'=>'Dataset/contoh','practice'=>'Praktik perangkat/VM berizin'][$reportKind]??'Belum ditentukan' }}</p>
<h3 class="h6">Hasil yang diamati</h3><p style="white-space:pre-wrap">{{ is_string($report['result']??null)?$report['result']:'Belum diisi' }}</p>
<h3 class="h6">Kesimpulan dan perbaikan</h3><p style="white-space:pre-wrap">{{ is_string($report['conclusion']??null)?$report['conclusion']:'Belum diisi' }}</p></details>
@empty<p>Belum ada laporan singkat yang tersinkron.</p>@endforelse
@foreach($atpLabs as $lab)
<details class="border rounded p-3 mb-2"><summary>Latihan {{ is_string($lab['type']??null)?$lab['type']:'ATP' }} · {{ min(8,count($lab['history'])) }} percobaan</summary>
@foreach(array_slice(array_filter($lab['history'],'is_array'),-8) as $trial)
<div class="border-top mt-3 pt-3"><strong>Percobaan {{ $loop->iteration }} · {{ is_string($trial['action']??null)?$trial['action']:'uji' }}</strong>
<ul>@foreach(is_array($trial['result']['steps']??null)?$trial['result']['steps']:[] as $step)@if(is_string($step))<li>{{ $step }}</li>@endif @endforeach</ul>
<details><summary>Masukan yang diterapkan</summary>@include('learning.package-evidence-value',['value'=>$trial['applied']??$trial['draft']??[],'depth'=>0])</details></div>
@endforeach</details>
@endforeach
</section>
