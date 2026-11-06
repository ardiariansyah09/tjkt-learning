<?php

namespace App\Services;

use App\Models\Module;
use App\Models\Rombel;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FirstTjktModule
{
    public const CODE = 'TJKT-E-X-01';

    public function create(User $author): Module
    {
        abort_unless($author->is_active && $author->role === 'admin', 403);

        return DB::transaction(function () use ($author) {
            User::whereKey($author->id)->lockForUpdate()->firstOrFail();
            $existing = Module::withTrashed()->where('code', self::CODE)->first();
            if ($existing) {
                if ($existing->trashed()) {
                    throw ValidationException::withMessages(['module' => 'Modul pertama sudah diarsipkan. Pulihkan atau buat salinan, bukan menimpa riwayat.']);
                }

                return $existing;
            }
            $rombels = Rombel::whereIn('name', ['TJKT X-1', 'TJKT X-2', 'TJKT X-3', 'TJKT X-4'])->where('grade', 10)->where('academic_year', '2026/2027')->where('semester', 1)->where('is_active', true)->pluck('id')->all();
            if (count($rombels) !== 4) {
                throw ValidationException::withMessages(['rombel_ids' => 'Diperlukan empat rombel TJKT kelas X pada 2026/2027 semester 1.']);
            }
            $module = app(ModuleService::class)->save($author, [
                'code' => self::CODE, 'title' => 'Profesi dan Sertifikasi Bidang TJKT: Langkah Awal Menjadi Teknisi',
                'description' => 'Materi Fase E berbasis ATP kelas X: peran kerja TJKT, bukti kompetensi, triase tiket, sertifikasi, latihan spreadsheet, dan refleksi perbaikan strategi. Draft untuk ditinjau pengajar.',
                'phase' => 'E', 'grade' => 10, 'competency' => 'Wawasan Dunia Kerja Bidang Teknik Jaringan Komputer dan Telekomunikasi',
                'objectives' => "Bagian awal TP 1.1 ATP kelas X, fokus profesi dan sertifikasi.\nMembandingkan sedikitnya empat peran kerja melalui tugas, alat, dan hasil kerja.\nMemilih penanganan serta eskalasi berdasarkan minimal dua bukti dan batas kewenangan.\nMembedakan sertifikat keikutsertaan, sertifikasi kompetensi, dan sertifikasi vendor.\nMenyusun rencana latihan teknis berdasarkan bukti, umpan balik, dan perbaikan strategi.",
                'estimated_minutes' => 180, 'sort_order' => 10, 'status' => 'draft', 'sequential_learning' => true, 'rombel_ids' => $rombels,
            ]);
            $source = file_get_contents(resource_path('learning/profesi-tjkt-x.md'));
            preg_match_all('/<!-- section:([a-z_]+)\|([^\n]+) -->\s*(.*?)(?=<!-- section:|\z)/s', $source, $matches, PREG_SET_ORDER);
            if (count($matches) !== 14) {
                throw new \RuntimeException('Sumber materi harus memuat 14 submateri.');
            }
            $required = range(2, 9);
            $sections = [];
            foreach ($matches as $i => $match) {
                $sections[] = $module->sections()->create(['title' => trim($match[2]), 'kind' => $match[1], 'content' => trim($match[3]), 'is_published' => true, 'is_required' => in_array($i, $required, true), 'progress_weight' => 1, 'sort_order' => ($i + 1) * 10]);
            }
            $questions = [];
            foreach (require resource_path('learning/profesi-tjkt-questions.php') as [$prompt,$options,$explanation]) {
                $questions[] = app(QuestionService::class)->save($author, ['type' => 'single', 'prompt' => $prompt, 'options' => array_map(fn ($label, $i) => ['label' => $label, 'is_correct' => $i === 0], $options, array_keys($options)), 'points' => 1, 'is_shared' => true, 'explanation' => $explanation]);
            }
            $base = ['instructions' => 'Baca kasus dan jelaskan alasan keputusanmu. Gunakan hasil percobaan sebagai bahan perbaikan.', 'is_published' => true, 'is_required' => true, 'progress_weight' => 1, 'sort_order' => 10, 'passing_score' => 80, 'max_attempts' => 3, 'duration_minutes' => 15, 'question_count' => 1, 'random_questions' => true, 'shuffle_options' => true, 'min_active_seconds' => 0, 'level' => 1, 'question_ids' => []];
            foreach ($required as $index => $sectionIndex) {
                app(ActivityService::class)->save($author, $module, array_merge($base, ['kind' => 'checkpoint', 'title' => 'Cek pemahaman: '.$sections[$sectionIndex]->title, 'module_section_id' => $sections[$sectionIndex]->id, 'question_ids' => [$questions[$index]->id], 'passing_score' => 100]));
            }
            foreach ([
                ['matching', 'Pasangkan profesi dan hasil kerja', "IT support | Tiket keluhan pengguna dan pemeriksaan awal\nTeknisi jaringan lokal | Catatan sambungan LAN dan label port\nAdministrator server | Catatan status layanan pada server\nOperator NOC | Laporan alarm dan eskalasi pemantauan\nTeknisi fiber optik | Laporan pengukuran jalur serat optik"],
                ['sorting', 'Urutkan penanganan awal tiket', "Terima dan perjelas laporan\nCatat cakupan dan dampak\nKumpulkan bukti awal berizin\nTentukan batas penanganan\nLakukan pemeriksaan atau eskalasi\nUji hasil dan dokumentasikan"],
                ['game', 'Kelompokkan fakta dan dugaan', "LAB-04 membuka LMS pukul 07.22 | Fakta pengamatan\nGuru melihat konektor LAB-07 longgar | Fakta pengamatan\nRouter pasti rusak tanpa hasil uji | Dugaan belum diuji\nSemua gangguan pasti karena kabel | Dugaan belum diuji"],
            ] as [$kind,$title,$items]) {
                app(ActivityService::class)->save($author, $module, array_merge($base, ['kind' => $kind, 'title' => $title, 'module_section_id' => $sections[10]->id, 'game_items' => $items, 'game_template' => 'categorize', 'game_difficulty' => 'easy', 'is_required' => false, 'sort_order' => 20]));
            }
            app(ActivityService::class)->save($author, $module, array_merge($base, ['kind' => 'quiz', 'title' => 'Evaluasi: keputusan teknisi berbasis bukti', 'module_section_id' => $sections[11]->id, 'question_ids' => array_map(fn ($q) => $q->id, $questions), 'question_count' => count($questions), 'duration_minutes' => 20, 'progress_weight' => 2, 'sort_order' => 20]));
            app(ActivityService::class)->save($author, $module, array_merge($base, ['kind' => 'practice', 'title' => 'Laporan teknisi pemula: triase dan serah terima', 'module_section_id' => $sections[11]->id, 'instructions' => 'Unggah satu PDF maksimal 1 MB: ringkasan T-101–103, analisis mandiri T-201, pemeriksaan satu sumber sertifikasi, dan perbandingan keputusan sebelum/sesudah umpan balik. Simpan spreadsheet untuk diperlihatkan kepada guru. Jangan memuat password atau konfigurasi jaringan nyata.', 'rubric' => "Lima kriteria, masing-masing 0–20 poin: (1) perbandingan peran dan jalur eskalasi; (2) pemisahan fakta/dugaan dan kualitas pertanyaan; (3) alur penanganan, izin, keselamatan dan verifikasi hasil; (4) penelusuran sumber sertifikasi dan batas klaim; (5) bukti revisi strategi serta refleksi pribadi.\nPedoman per kriteria: 0 tidak ada bukti; 8 ada upaya namun belum tepat/terlacak; 14 sebagian besar tepat tetapi ada bagian yang perlu diperjelas; 20 tepat, berbukti, konsisten, dan mampu dijelaskan. Jumlahkan menjadi 0–100. Target 80.\nBerikan catatan spesifik dan tindakan perbaikan. Minta revisi bila laporan memuat rahasia, mengklaim pengujian yang tidak dilakukan, atau tindakan di luar izin. Nilai isi, bukan hiasan atau penggunaan AI.", 'due_at' => null, 'progress_weight' => 2, 'sort_order' => 30]));
            app(AuditService::class)->record('module.first_tjkt_created', $author->id, ['module_id' => $module->id, 'code' => self::CODE, 'sections' => count($sections), 'questions' => count($questions), 'status' => 'draft']);

            return $module;
        });
    }
}
