<?php

namespace App\Services;

use App\Models\Module;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StudentLessonRefresh
{
    public function apply(User $actor, bool $write = false): array
    {
        abort_unless($actor->is_active && $actor->role === 'admin', 403);

        return DB::transaction(function () use ($actor, $write) {
            $plans = [];
            $summary = [];
            foreach ([FirstTjktModule::CODE => 'profesi-tjkt', EntrepreneurshipTjktModule::CODE => 'usaha-tjkt'] as $code => $source) {
                $module = Module::where('code', $code)->lockForUpdate()->firstOrFail();
                $old = $this->sections(resource_path('learning/revisions/'.$source.'-before-studio.md'));
                $new = $this->sections(resource_path('learning/'.$source.'-x.md'));
                $sections = $module->sections()->lockForUpdate()->get();
                if ($sections->count() !== 14 || count($old) !== 14 || array_keys($old) !== array_keys($new)) {
                    throw ValidationException::withMessages(['module' => $code.': struktur submateri berubah; tinjau sebelum memperbarui.']);
                }
                $changed = 0;
                foreach ($sections as $section) {
                    if (! isset($old[$section->title], $new[$section->title]) || ! in_array(trim($section->content), [$old[$section->title], $new[$section->title]], true)) {
                        throw ValidationException::withMessages(['section' => $code.': submateri #'.$section->id.' memiliki suntingan tersendiri. Tidak ditimpa otomatis.']);
                    }
                    if (trim($section->content) !== $new[$section->title]) {
                        $plans[] = ['section' => $section, 'content' => $new[$section->title]];
                        $changed++;
                    }
                }
                $summary[] = ['id' => $module->id, 'code' => $code, 'status' => $module->status, 'changed_sections' => $changed];
            }
            $backup = null;
            if ($write && $plans) {
                $backup = 'lesson-revisions/'.Str::uuid().'.json';
                $snapshot = array_map(fn ($plan) => $plan['section']->only(['id', 'module_id', 'title', 'content', 'kind', 'is_published', 'is_required', 'sort_order', 'progress_weight']), $plans);
                if (! Storage::disk('local')->put($backup, json_encode(['created_at' => now()->toIso8601String(), 'actor_id' => $actor->id, 'sections' => $snapshot], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR))) {
                    throw new \RuntimeException('Cadangan materi belum tersimpan; pembaruan dibatalkan.');
                }
                foreach ($plans as $plan) {
                    $plan['section']->update(['content' => $plan['content']]);
                }
                app(AuditService::class)->record('module.student_lessons_refreshed', $actor->id, ['modules' => $summary, 'backup' => $backup]);
            }

            return ['applied' => $write, 'modules' => $summary, 'changed_sections' => count($plans), 'backup' => $backup];
        });
    }

    private function sections(string $path): array
    {
        preg_match_all('/<!-- section:[a-z_]+\|([^\n]+) -->\s*(.*?)(?=<!-- section:|\z)/s', file_get_contents($path), $matches, PREG_SET_ORDER);

        return collect($matches)->mapWithKeys(fn ($match) => [trim($match[1]) => trim($match[2])])->all();
    }
}
