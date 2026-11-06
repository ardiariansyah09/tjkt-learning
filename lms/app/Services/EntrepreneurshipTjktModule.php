<?php

namespace App\Services;

use App\Models\Module;
use App\Models\Rombel;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EntrepreneurshipTjktModule
{
    public const CODE = 'TJKT-E-X-02';

    public function create(User $author): Module
    {
        abort_unless($author->is_active && $author->role === 'admin', 403);

        return DB::transaction(function () use ($author) {
            User::whereKey($author->id)->lockForUpdate()->firstOrFail();
            $existing = Module::withTrashed()->where('code', self::CODE)->first();
            if ($existing) {
                if ($existing->trashed()) {
                    throw ValidationException::withMessages(['module' => 'Modul kewirausahaan sudah diarsipkan. Pulihkan atau buat salinan, bukan menimpa riwayat.']);
                }

                return $existing;
            }
            $rombels = Rombel::whereIn('name', ['TJKT X-1', 'TJKT X-2', 'TJKT X-3', 'TJKT X-4'])->where('grade', 10)->where('academic_year', '2026/2027')->where('semester', 1)->where('is_active', true)->pluck('id')->all();
            if (count($rombels) !== 4) {
                throw ValidationException::withMessages(['rombel_ids' => 'Diperlukan empat rombel TJKT kelas X pada 2026/2027 semester 1.']);
            }
            $module = app(ModuleService::class)->save($author, [
                'code' => self::CODE, 'title' => 'Kewirausahaan dan Peluang Usaha TJKT: Dari Kebutuhan ke Layanan',
                'description' => 'Lanjutan ATP Fase E TP 1.1–1.3: kewirausahaan, technopreneurship, analisis peluang, biaya simulasi, lingkup layanan, vision dan passion berbasis bukti. Draft untuk ditinjau pengajar.',
                'phase' => 'E', 'grade' => 10, 'competency' => 'Wawasan Dunia Kerja Bidang Teknik Jaringan Komputer dan Telekomunikasi',
                'objectives' => "Lanjutan TP 1.1 serta TP 1.2–1.3 ATP kelas X.\nMembedakan wirausaha, teknisi, dan technopreneur melalui manfaat dan hasil kerja.\nMenganalisis sedikitnya dua peluang layanan dengan bukti kebutuhan, kemampuan, izin, sumber daya, dan risiko.\nMerancang lingkup layanan beserta keluaran dan kriteria selesai.\nMenghitung biaya, pendapatan, surplus model dan perubahan kondisi menggunakan spreadsheet.\nMenghubungkan vision dan passion dengan target latihan teknis, umpan balik, dan bukti revisi.",
                'estimated_minutes' => 270, 'sort_order' => 20, 'status' => 'draft', 'sequential_learning' => true, 'rombel_ids' => $rombels,
            ]);
            $source = file_get_contents(resource_path('learning/usaha-tjkt-x.md'));
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
            foreach (require resource_path('learning/usaha-tjkt-questions.php') as [$prompt,$options,$explanation]) {
                $questions[] = app(QuestionService::class)->save($author, ['type' => 'single', 'prompt' => $prompt, 'options' => array_map(fn ($label, $i) => ['label' => $label, 'is_correct' => $i === 0], $options, array_keys($options)), 'points' => 1, 'is_shared' => true, 'explanation' => $explanation]);
            }
            $base = ['instructions' => 'Baca kasus dan jelaskan alasan keputusanmu. Gunakan hasil percobaan sebagai bahan perbaikan.', 'is_published' => true, 'is_required' => true, 'progress_weight' => 1, 'sort_order' => 10, 'passing_score' => 80, 'max_attempts' => 3, 'duration_minutes' => 15, 'question_count' => 1, 'random_questions' => true, 'shuffle_options' => true, 'min_active_seconds' => 0, 'level' => 1, 'question_ids' => []];
            foreach ($required as $index => $sectionIndex) {
                app(ActivityService::class)->save($author, $module, array_merge($base, ['kind' => 'checkpoint', 'title' => 'Cek pemahaman: '.$sections[$sectionIndex]->title, 'module_section_id' => $sections[$sectionIndex]->id, 'question_ids' => [$questions[$index]->id], 'passing_score' => 100]));
            }
            foreach ([
                ['matching', 'Pasangkan konsep layanan dan buktinya', "Kebutuhan | Hasil yang diperlukan pengguna\nLingkup | Batas pekerjaan yang disepakati\nBiaya | Sumber daya yang digunakan\nPendapatan | Nilai paket layanan dalam model\nKriteria selesai | Syarat hasil yang diperiksa saat serah terima"],
                ['sorting', 'Susun alur rancangan layanan', "Perjelas kebutuhan dan kumpulkan bukti\nPeriksa kemampuan izin dan risiko\nSepakati lingkup hasil dan biaya\nKerjakan dalam batas izin\nUji hasil sesuai kriteria\nSerahkan hasil dan catat umpan balik"],
                ['game', 'Pilah fakta asumsi dan batas izin', "Ada 8 komputer pada diagram U-04 | Fakta simulasi\nDua sambungan U-04 belum berlabel | Fakta simulasi\nRouter U-01 pasti rusak | Asumsi belum diuji\nSemua pelanggan pasti membeli | Asumsi belum diuji\nMembuka Wi-Fi tetangga tanpa izin | Tindakan tidak diizinkan\nReset router U-04 tanpa persetujuan | Tindakan tidak diizinkan"],
            ] as [$kind,$title,$items]) {
                app(ActivityService::class)->save($author, $module, array_merge($base, ['kind' => $kind, 'title' => $title, 'module_section_id' => $sections[10]->id, 'game_items' => $items, 'game_template' => 'categorize', 'game_difficulty' => 'easy', 'is_required' => false, 'sort_order' => 20]));
            }
            app(ActivityService::class)->save($author, $module, array_merge($base, ['kind' => 'quiz', 'title' => 'Evaluasi: peluang dan keputusan layanan TJKT', 'module_section_id' => $sections[11]->id, 'question_ids' => array_map(fn ($q) => $q->id, $questions), 'question_count' => count($questions), 'duration_minutes' => 20, 'progress_weight' => 2, 'sort_order' => 20]));
            app(ActivityService::class)->save($author, $module, array_merge($base, ['kind' => 'practice', 'title' => 'Rancangan layanan TJKT: kebutuhan biaya dan bukti revisi', 'module_section_id' => $sections[11]->id, 'instructions' => 'Unggah satu PDF ringkas maksimal 1 MB: analisis U-04, rancangan lingkup dan hasil, tabel biaya beserta rumus serta satu perubahan kondisi, bukti uji kecil versi awal/revisi, dua risiko dan mitigasi, serta target latihan. Angka dan pelanggan bersifat simulasi. Simpan spreadsheet untuk diperlihatkan kepada guru. Tidak perlu poster atau promosi. Jangan menggunakan sandi, data pribadi, atau mengubah jaringan nyata.', 'rubric' => "Lima kriteria masing-masing 0–20: (1) analisis kebutuhan dan perbandingan peluang berbukti; (2) kesesuaian lingkup, izin, keluaran dan kriteria selesai; (3) ketepatan rumus biaya, pendapatan, surplus, asumsi dan perubahan kondisi; (4) risiko, mitigasi, pengujian dan keterbatasan bukti; (5) revisi strategi, refleksi, serta target vision/passion yang terukur.\nPedoman per aspek: 0 tidak ada bukti; 8 ada upaya namun banyak kekeliruan; 14 sebagian besar tepat dengan bagian yang perlu diperjelas; 20 tepat, konsisten, berbukti dan mampu dijelaskan. Total 0–100; target 80.\nNilai isi dan alasan, bukan hiasan. Minta revisi bila ada data rahasia, hasil uji palsu, atau tindakan di luar izin. Berikan umpan balik spesifik dan langkah perbaikan.", 'due_at' => null, 'progress_weight' => 2, 'sort_order' => 30]));
            app(AuditService::class)->record('module.entrepreneurship_tjkt_created', $author->id, ['module_id' => $module->id, 'code' => self::CODE, 'sections' => count($sections), 'questions' => count($questions), 'status' => 'draft']);

            return $module;
        });
    }
}
