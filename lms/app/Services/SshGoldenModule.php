<?php

namespace App\Services;

use App\Models\Module;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SshGoldenModule
{
    public function create(User $author): Module
    {
        abort_unless($author->is_active && in_array($author->role, ['admin', 'guru'], true), 403);

        return DB::transaction(function () use ($author) {
            User::whereKey($author->id)->lockForUpdate()->firstOrFail();
            $code = 'SSH12-'.$author->id;
            $existing = Module::withTrashed()->where('code', $code)->first();
            if ($existing) {
                if ($existing->trashed()) {
                    throw ValidationException::withMessages(['module' => 'Template SSH sudah diarsipkan. Gunakan modul salinan untuk edisi baru.']);
                }

                app(PracticeTemplate::class)->attach($author, $existing);

                return $existing;
            }
            $m = Module::create(['created_by' => $author->id, 'code' => $code, 'title' => 'Remote Server SSH pada Debian 12', 'description' => 'Modul lengkap SSH: teori, diagram jaringan, terminal Debian virtual, game dan evaluasi.', 'status' => 'draft', 'sequential_learning' => true, 'grade' => 11, 'phase' => 'F', 'estimated_minutes' => 270, 'objectives' => 'Memasang, mengonfigurasi, mengamankan dan mendiagnosis layanan SSH berdasarkan bukti.', 'sort_order' => 10]);
            $content = require resource_path('learning/ssh-debian12.php');
            $sections = [];
            foreach ($content as $i => [$title,$kind,$text]) {
                $sections[] = $m->sections()->create(['title' => $title, 'kind' => $kind, 'content' => $text, 'is_published' => true, 'is_required' => true, 'progress_weight' => 1, 'sort_order' => ($i + 1) * 10]);
            }
            $questions = [];
            foreach ($this->questions() as [$prompt,$options,$explanation]) {
                $questions[] = app(QuestionService::class)->save($author, ['type' => 'single', 'prompt' => $prompt, 'options' => array_map(fn ($label, $i) => ['label' => $label, 'is_correct' => $i === 0], $options, array_keys($options)), 'points' => 1, 'is_shared' => false, 'explanation' => $explanation]);
            }
            $base = ['instructions' => 'Kerjakan sesuai tujuan pada submateri. Gunakan checkpoint untuk memeriksa hasil.', 'is_published' => true, 'is_required' => true, 'progress_weight' => 2, 'sort_order' => 10, 'passing_score' => 80, 'max_attempts' => 3, 'duration_minutes' => 30, 'question_count' => 1, 'random_questions' => true, 'shuffle_options' => true, 'min_active_seconds' => 0, 'level' => 1, 'question_ids' => []];
            foreach ($sections as $i => $section) {
                app(ActivityService::class)->save($author, $m, array_merge($base, ['kind' => 'checkpoint', 'title' => 'Checkpoint: '.$section->title, 'module_section_id' => $section->id, 'question_ids' => [$questions[$i % count($questions)]->id], 'passing_score' => 100, 'min_active_seconds' => 30, 'duration_minutes' => 10]));
            }
            foreach ([
                ['terminal', 'Guided Lab instalasi SSH', 7, 'guided', 1, null],
                ['terminal', 'Challenge SSH hardening', 8, 'hardening', 2, null],
                ['terminal', 'Troubleshooting firewall SSH', 9, 'troubleshooting', 2, null],
                ['network', 'Diagram jalur SSH', 6, 'guided', 1, null],
                ['matching', 'Matching port dan layanan', 10, 'guided', 1, "SSH | TCP 22\nHTTP | TCP 80\nHTTPS | TCP 443\nDNS | UDP/TCP 53"],
                ['drag_drop', 'Pasangkan gejala dan pemeriksaan', 10, 'guided', 2, "Connection refused | Periksa listener dan port\nConnection timed out | Periksa jalur dan firewall\nPermission denied | Periksa metode autentikasi\nSintaks tidak valid | Jalankan sshd -t"],
                ['sorting', 'Urutkan hardening SSH', 10, 'guided', 2, "Uji akses awal akun biasa\nBuat dan pasang public key\nUji login menggunakan key\nIzinkan port baru pada firewall\nUbah konfigurasi dan uji sshd -t\nTerapkan service dan uji sesi kedua"],
            ] as [$kind,$title,$section,$scenario,$level,$items]) {
                app(ActivityService::class)->save($author, $m, array_merge($base, ['kind' => $kind, 'title' => $title, 'module_section_id' => $sections[$section]->id, 'scenario' => $scenario, 'level' => $level, 'game_items' => $items, 'sort_order' => 20, 'duration_minutes' => 45]));
            }
            app(ActivityService::class)->save($author, $m, array_merge($base, ['kind' => 'quiz', 'title' => 'Evaluasi akhir SSH Debian 12', 'module_section_id' => $sections[11]->id, 'question_ids' => array_map(fn ($q) => $q->id, $questions), 'question_count' => count($questions), 'sort_order' => 20]));
            app(AuditService::class)->record('module.ssh_template_created', $author->id, ['module_id' => $m->id]);

            app(PracticeTemplate::class)->attach($author, $m);

            return $m;
        });
    }

    private function questions(): array
    {
        return [
            ['Apa fungsi utama SSH?', ['Akses jarak jauh dengan kanal terenkripsi', 'Membagikan private key kepada server', 'Menghapus autentikasi jaringan', 'Menggantikan seluruh fungsi firewall'], 'SSH melindungi sesi remote; kebijakan akses dan firewall tetap diperlukan.'],
            ['Port standar layanan SSH adalah…', ['TCP 22', 'UDP 22', 'TCP 80', 'UDP 53'], 'SSH umumnya menggunakan TCP 22; port dapat dikonfigurasi.'],
            ['Service Debian yang diperiksa untuk OpenSSH Server adalah…', ['ssh.service', 'http.service', 'dns.service', 'ftp.service'], 'Daemon bernama sshd, sedangkan unit service Debian adalah ssh.service.'],
            ['Apa tujuan sshd -t?', ['Memeriksa validitas konfigurasi server', 'Membuka firewall', 'Memasang public key', 'Mengubah alamat IP'], 'Pemeriksaan sintaks tidak membuktikan konektivitas atau autentikasi.'],
            ['Di mana public key pengguna dipasang?', ['~/.ssh/authorized_keys', 'Berkas private key pengguna lain', '/etc/shadow', 'Log koneksi firewall'], 'Private key tetap di klien; authorized_keys berisi public key yang diizinkan.'],
            ['Password sudah dimatikan. Apa langkah yang seharusnya dilakukan sebelumnya?', ['Uji login public key dari sesi lain', 'Hapus semua akun biasa', 'Tutup semua sesi sebelum pengujian', 'Matikan firewall tanpa pemeriksaan'], 'Uji akses alternatif sebelum mengubah jalur autentikasi yang masih bekerja.'],
            ['Ping berhasil, tetapi SSH Connection refused. Pemeriksaan pertama yang relevan adalah…', ['Status service dan port listener', 'Mengirim private key ke guru', 'Menghapus seluruh aturan jaringan', 'Mengganti nama pengguna acak'], 'ICMP dan TCP SSH berbeda. Service atau port tujuan bisa tidak sesuai.'],
            ['Server mendengarkan 2222, firewall hanya mengizinkan 22. Perbaikan yang tepat…', ['Izinkan TCP 2222 dan uji klien dengan -p 2222', 'Pakai UDP 2222', 'Matikan autentikasi', 'Menganggap ping membuktikan SSH berhasil'], 'Listener, firewall, dan port klien harus cocok.'],
            ['Perbedaan active dan enabled adalah…', ['Sedang berjalan dan disiapkan saat boot', 'Keduanya selalu sama', 'Enabled membuktikan port terbuka', 'Active membuktikan key benar'], 'Periksa status runtime dan kebijakan boot secara terpisah.'],
            ['Apa yang dilakukan setelah menyunting konfigurasi SSH?', ['Validasi, terapkan service, lalu uji dari sesi kedua', 'Menganggap listener langsung berubah', 'Menghapus host key klien tanpa pemeriksaan', 'Membagikan password di laporan'], 'Perubahan berkas perlu validasi dan penerapan; uji akses sebelum menutup sesi lama.'],
            ['Mengapa mengganti port bukan hardening yang cukup?', ['Tidak menggantikan autentikasi kuat dan pembaruan', 'Port baru menjamin semua serangan gagal', 'Firewall otomatis mengikuti port baru', 'Public key tidak diperlukan lagi'], 'Gunakan pertahanan berlapis dan verifikasi konfigurasi efektif.'],
            ['Apa yang dilakukan saat host key server berubah tanpa penjelasan?', ['Verifikasi identitas dan penyebab perubahan', 'Abaikan seluruh peringatan', 'Kirim private key ke server', 'Nonaktifkan enkripsi'], 'Host key mengidentifikasi server; perubahan perlu diverifikasi.'],
        ];
    }
}
