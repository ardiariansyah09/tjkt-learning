<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Module;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class PracticeTemplate
{
    public function attach(User $author, Module $module): Activity
    {
        Gate::forUser($author)->authorize('update', $module);

        return DB::transaction(function () use ($author, $module) {
            Module::whereKey($module->id)->lockForUpdate()->firstOrFail();
            $existing = $module->activities()->withTrashed()->whereHas('currentVersion', fn ($q) => $q->where('definition->template_key', 'ssh12-evidence-v1'))->first();
            if ($existing) {
                return $existing;
            }
            $section = $module->sections()->where('kind', 'reflection')->first();
            $a = app(ActivityService::class)->save($author, $module, ['kind' => 'practice', 'title' => 'Praktik laptop: SSH Debian 12', 'module_section_id' => $section?->id, 'instructions' => 'Pada VM Debian 12 milik sendiri, pasang OpenSSH Server, atur dan uji public key, port 2222, pembatasan root serta firewall. Sertakan bukti status service, listener, konfigurasi tersamarkan dan koneksi akun biasa. Jelaskan diagnosis kendala serta prosedur pemulihan. Jangan unggah password atau private key.', 'is_published' => false, 'is_required' => true, 'progress_weight' => 3, 'sort_order' => 30, 'passing_score' => 80, 'max_attempts' => 5, 'rubric' => "Instalasi dan pengelolaan service: 25 poin\nKonfigurasi serta autentikasi public key: 25 poin\nFirewall dan bukti uji koneksi: 25 poin\nDiagnosis, refleksi dan kerapian laporan tanpa rahasia: 25 poin", 'due_at' => null, 'template_key' => 'ssh12-evidence-v1', 'question_ids' => []]);
            if ($section) {
                $section->update(['content' => str_replace('Unggahan dan penilaian bukti laptop tersedia pada Fase 6; untuk saat ini diskusikan hasil langsung dengan guru.', 'Gunakan aktivitas praktik laptop setelah diterbitkan guru untuk mengirim laporan dan bukti privat. Tinjau catatan guru dan kirim pengumpulan baru jika diminta perbaikan.', $section->content)]);
            }
            app(AuditService::class)->record('practice.template_added', $author->id, ['module_id' => $module->id, 'activity_id' => $a->id]);

            return $a;
        });
    }
}
