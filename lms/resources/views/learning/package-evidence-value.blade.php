@if(($depth??0)>5)
<span class="text-secondary">Buka catatan pada materi untuk rincian lebih lanjut.</span>
@elseif(is_array($value))
<dl class="mb-1 ms-2">@foreach(array_slice($value,0,50,true) as $key=>$item)<dt class="small">{{ is_int($key)?'Bagian '.($key+1):\Illuminate\Support\Str::headline($key) }}</dt><dd>@include('learning.package-evidence-value',['value'=>$item,'depth'=>($depth??0)+1])</dd>@endforeach</dl>
@else
<span style="white-space:pre-wrap">{{ is_bool($value)?($value?'Ya':'Tidak'):($value===null?'Belum ada':$value) }}</span>
@endif
