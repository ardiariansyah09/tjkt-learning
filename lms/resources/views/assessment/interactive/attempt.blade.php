@extends('layouts.app')
@section('title',$attempt->snapshot['title'])
@section('content')
@if($config['preview']??false)<div class="alert alert-warning">Pratinjau guru — tidak membuat percobaan, nilai, atau progres siswa. Tombol kirim menampilkan simulasi nilai. <a href="{{ route('assessment.activities.index',$attempt->activity->module) }}">Kembali ke aktivitas</a></div>@endif
<p class="text-preline">{{ $attempt->snapshot['instructions']??'' }}</p>
@if($config['kind']==='terminal')
<div class="alert alert-light border"><strong>Tujuan lab:</strong>
@if($config['scenario']==='guided') Pasang OpenSSH Server, pastikan konfigurasi valid, service aktif dan enabled, lalu uji koneksi akun siswa.
@elseif($config['scenario']==='hardening') Gunakan port 2222, aktifkan firewall dan izin TCP 2222, larang login root, matikan password dan keyboard-interactive, pasang public key akun siswa, lalu uji koneksi menggunakan key.
@else Periksa listener TCP 2222 dan aturan firewall. Pulihkan jalur koneksi akun siswa tanpa mengubah port layanan.
@endif Semua tujuan harus terpenuhi. Gunakan <code>help</code> untuk daftar perintah.</div>
@endif
<div class="d-flex flex-wrap justify-content-between gap-3 mb-4"><div><div class="eyebrow text-primary">{{ \App\Models\Activity::KINDS[$config['kind']] }} · LEVEL {{ $attempt->level }}</div><h1 class="h3 fw-bold mt-2">{{ $attempt->snapshot['title'] }}</h1><p class="text-secondary">Percobaan #{{ $attempt->attempt_number }} · Versi {{ $attempt->activity_version_id }}</p></div>@if(!$staff && $attempt->status==='in_progress')<strong id="interactive-clock" class="badge text-bg-primary align-self-start p-3" role="timer">Menghitung waktu…</strong>@endif</div>
@if($staff)<a class="btn btn-outline-secondary mb-3" href="{{ route('assessment.reports.detail',['student'=>$attempt->user_id,'module'=>$attempt->activity->module_id]+request()->only(['academic_year','semester','rombel_id'])) }}">Kembali ke monitoring</a>@else<a class="btn btn-outline-secondary mb-3" href="{{ route('student.modules.index') }}">Katalog materi</a>@endif
@if($attempt->status!=='in_progress')
<div class="card border-0 rounded-4 p-4 mb-4"><h2 class="h4">{{ $attempt->passed?'Lulus':'Belum lulus' }} · Skor {{ $attempt->score }}</h2><p>{{ $attempt->status==='expired'?'Waktu habis.':'Percobaan telah dikirim.' }} Selesai {{ $attempt->finished_at->format('d/m/Y H:i:s') }} · {{ $attempt->resets_count }} reset.</p><ul class="list-group list-group-flush">@foreach($attempt->result['checks'] as $label=>$ok)<li class="list-group-item">{{ $ok?'✓':'○' }} {{ $label }} — {{ $ok?'Terpenuhi':'Belum terpenuhi' }}</li>@endforeach</ul></div>
@endif
@if(!$staff && $attempt->status==='in_progress')
<div id="interactive-app" class="card border-0 rounded-4 p-4 mb-4" data-url="{{ $previewUrl ?? route('interactive.action',$attempt) }}">
<div id="interactive-status" class="alert alert-info" role="status" aria-live="polite">Kondisi terakhir dimuat dari server.</div>
<div id="interactive-engine"></div>
<div class="d-flex flex-wrap gap-2 mt-4"><button id="interactive-checkpoint" type="button" class="btn btn-outline-primary">Periksa checkpoint</button><button id="interactive-reset" type="button" class="btn btn-outline-secondary">Reset kondisi</button><button id="interactive-submit" type="button" class="btn btn-primary">Kirim dan nilai</button></div>
<p class="small text-secondary mt-3 mb-0">Perubahan harus berhasil tersimpan sebelum meninggalkan halaman. Dua tab yang berbeda akan diminta memuat ulang saat versinya bertabrakan.</p><div id="interactive-feedback" class="mt-3" aria-live="polite"></div></div>
<script>window.tjktInteractive = {config: {{ \Illuminate\Support\Js::from($config) }}, runtime: {{ \Illuminate\Support\Js::from($runtime) }}};</script>
@push('scripts')<script src="{{ asset('assets/game-templates.js') }}?v={{ filemtime(public_path('assets/game-templates.js')) }}" defer></script><script src="{{ asset('assets/interactive.js') }}?v={{ filemtime(public_path('assets/interactive.js')) }}" defer></script>@endpush
@endif
<div class="card border-0 rounded-4 p-4"><h2 class="h5">Jejak interaksi tersimpan</h2><p class="small text-secondary">Riwayat mencakup perintah, perubahan konfigurasi, checkpoint, dan reset.</p>@forelse($events as $event)<details class="border-bottom py-2"><summary>{{ $event->created_at->format('d/m/Y H:i:s') }} · #{{ $event->revision }} · {{ ['play'=>'Aksi game','command'=>'Perintah terminal','write'=>'Simpan konfigurasi','answer'=>'Jawaban permainan','checkpoint'=>'Periksa checkpoint','reset'=>'Reset','submit'=>'Kirim hasil'][$event->action] }}</summary><pre class="bg-light rounded p-3 text-wrap mb-0">{{ json_encode($event->payload,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) }}</pre></details>@empty<p class="text-secondary">Belum ada interaksi.</p>@endforelse{{ $events->links() }}</div>
@endsection
