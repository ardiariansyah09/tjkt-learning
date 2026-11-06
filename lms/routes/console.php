<?php

use App\Models\InteractiveAttempt;
use App\Models\LabSubmissionFile;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Services\InteractiveService;
use App\Services\QuizService;
use App\Services\SshGoldenModule;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

Artisan::command('tjkt:user', function () {
    $data = ['name' => $this->ask('Nama lengkap'), 'username' => $this->ask('Username'), 'role' => $this->choice('Role', ['admin', 'guru', 'siswa'], 2), 'password' => $this->secret('Password awal (minimal 12 karakter, huruf dan angka)')];
    $v = Validator::make($data, ['name' => 'required|string|max:255', 'username' => 'required|alpha_dash|max:100|unique:users,username', 'role' => 'in:admin,guru,siswa', 'password' => ['required', Password::min(12)->letters()->numbers()]]);
    if ($v->fails()) {
        $this->error($v->errors()->first());

        return 1;
    }User::create($data + ['is_active' => true, 'must_change_password' => true]);
    $this->info('Akun dibuat. Pengguna wajib mengganti password saat login.');

    return 0;
})->purpose('Membuat akun TJKT secara interaktif tanpa password dalam source code');

Artisan::command('learning:expire-attempts', function () {
    $count = 0;
    QuizAttempt::where('status', 'in_progress')->where('expires_at', '<=', now())->chunkById(100, function ($attempts) use (&$count) {
        foreach ($attempts as $attempt) {
            app(QuizService::class)->expire($attempt);
            $count++;
        }
    });
    InteractiveAttempt::where('status', 'in_progress')->where('expires_at', '<=', now())->chunkById(100, function ($attempts) use (&$count) {
        foreach ($attempts as $a) {
            app(InteractiveService::class)->expire($a);
            $count++;
        }
    });
    $this->info($count.' percobaan kedaluwarsa diproses.');
})->purpose('Menilai jawaban tersimpan pada percobaan yang kedaluwarsa');
Schedule::command('learning:expire-attempts')->everyMinute()->withoutOverlapping();

Artisan::command('learning:ssh-module {--author= : ID admin atau guru pemilik draft}', function () {
    $author = User::where('is_active', true)->whereIn('role', ['admin', 'guru']);
    $id = $this->option('author');
    $author = $id ? $author->find($id) : $author->where('role', 'admin')->orderBy('id')->first();
    if (! $author) {
        $this->error('Pemilik aktif tidak ditemukan.');

        return 1;
    }
    $module = app(SshGoldenModule::class)->create($author);
    $this->info('Draft SSH tersedia: modul #'.$module->id.' ('.$module->code.'). Tinjau, pilih rombel, lalu terbitkan melalui aplikasi.');

    return 0;
})->purpose('Membuat draft SSH Golden Module secara idempoten tanpa penugasan siswa');

Artisan::command('learning:health {--write : Uji tulis/hapus berkas probe privat}', function () {
    $checks = [];
    try {
        DB::select('SELECT 1');
        $checks['Database TJKT tersambung'] = true;
    } catch (Throwable) {
        $checks['Database TJKT tersambung'] = false;
    }
    foreach (['lab_submissions', 'lab_submission_files', 'lab_assessments'] as $table) {
        try {
            $checks['Tabel '.$table] = Schema::hasTable($table);
        } catch (Throwable) {
            $checks['Tabel '.$table] = false;
        }
    }
    foreach (['fileinfo', 'pdo_mysql', 'zip', 'mbstring', 'openssl'] as $extension) {
        $checks['Ekstensi '.$extension] = extension_loaded($extension);
    }
    foreach ([storage_path('app/private'), storage_path('framework'), base_path('bootstrap/cache')] as $directory) {
        $checks['Direktori dapat ditulis: '.str_replace(base_path().'/', '', $directory)] = is_dir($directory) && is_writable($directory);
    }

    if ($this->option('write')) {
        $probe = '.health-'.bin2hex(random_bytes(12));
        try {
            $checks['Uji tulis bukti privat'] = Storage::disk('evidence')->put($probe, 'TJKT health probe', ['visibility' => 'private']);
        } catch (Throwable) {
            $checks['Uji tulis bukti privat'] = false;
        } finally {
            try {
                Storage::disk('evidence')->delete($probe);
            } catch (Throwable) {
                $checks['Pembersihan probe privat'] = false;
            }
        }
    }
    $checks['APP_KEY tersedia'] = filled(config('app.key'));
    foreach ($checks as $label => $ok) {
        $this->line(($ok ? 'OK' : 'GAGAL').' — '.$label);
    }
    $this->line('Periksa scheduler melalui schedule:list; command ini tidak membuktikan cron aktif, HTTPS, atau akses PHP-FPM.');

    return in_array(false, $checks, true) ? 1 : 0;
})->purpose('Memeriksa kesiapan aplikasi tanpa menampilkan kredensial atau mengubah konfigurasi');

Artisan::command('learning:check-evidence {--hash : Cocokkan SHA-256 seluruh berkas}', function () {
    $missing = 0;
    $damaged = 0;
    $total = 0;
    LabSubmissionFile::chunkById(100, function ($files) use (&$missing, &$damaged, &$total) {
        foreach ($files as $file) {
            $total++;
            if (! Storage::disk('evidence')->exists($file->path)) {
                $missing++;
                $this->error('Berkas #'.$file->id.' tidak ditemukan.');

                continue;
            }
            if ($this->option('hash') && ! hash_equals($file->sha256, hash_file('sha256', Storage::disk('evidence')->path($file->path)))) {
                $damaged++;
                $this->error('Hash berkas #'.$file->id.' tidak cocok.');
            }
        }
    });
    $this->info($total.' berkas diperiksa; hilang '.$missing.'; hash tidak cocok '.$damaged.'. Tidak ada data diubah.');

    return $missing || $damaged ? 1 : 0;
})->purpose('Memeriksa keberadaan/integritas bukti privat tanpa menghapus atau memperbaiki data');
