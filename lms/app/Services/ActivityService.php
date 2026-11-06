<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\Module;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ActivityService
{
    public function save(User $u, Module $module, array $data, ?Activity $activity = null): Activity
    {
        $result = DB::transaction(function () use ($u, $module, $data, $activity) {
            Module::whereKey($module->id)->lockForUpdate()->firstOrFail();
            $new = $activity === null;
            if ($activity) {
                $activity = Activity::whereKey($activity->id)->lockForUpdate()->firstOrFail();
                if (($activity->kind !== $data['kind'] || $activity->module_section_id !== (isset($data['module_section_id']) ? (int) $data['module_section_id'] : null)) && ($activity->attempts()->exists() || $activity->interactiveAttempts()->exists() || $activity->submissions()->exists() || ActivityProgress::where('activity_id', $activity->id)->exists())) {
                    throw ValidationException::withMessages(['kind' => 'Jenis dan submateri aktivitas yang sudah dikerjakan tidak dapat diubah. Buat aktivitas baru.']);
                }
            }
            $interactive = isset(InteractiveDefinition::KINDS[$data['kind']]);
            $ids = ($interactive || $data['kind'] === 'practice') ? [] : array_values($data['question_ids'] ?? []);
            $questions = app(QuestionService::class)->visible($u)->whereIn('id', $ids)->with('options')->get()->keyBy('id');
            if (count($ids) !== $questions->count()) {
                throw ValidationException::withMessages(['question_ids' => 'Ada soal yang tidak tersedia dalam bank soal Anda.']);
            }
            if (in_array($data['kind'], ['checkpoint', 'quiz'], true) && $data['is_published'] && (! $ids || $data['question_count'] > count($ids))) {
                throw ValidationException::withMessages(['question_count' => 'Jumlah soal harus tersedia dalam bank pilihan sebelum aktivitas diterbitkan.']);
            }
            $fields = collect($data)->only(['module_section_id', 'title', 'kind', 'instructions', 'is_published', 'is_required', 'progress_weight', 'sort_order'])->all();
            $fields['module_section_id'] = $data['module_section_id'] ?? null;
            if (! $activity) {
                $activity = $module->activities()->create($fields);
            } else {
                $activity->update($fields);
            }
            $activity->questions()->sync(collect($ids)->mapWithKeys(fn ($id, $i) => [$id => ['position' => $i]])->all());
            $definition = collect($data)->only(['passing_score', 'max_attempts', 'duration_minutes', 'question_count', 'random_questions', 'shuffle_options', 'min_active_seconds'])->all();
            $definition['kind'] = $activity->kind;
            $definition['questions'] = array_map(fn ($id) => app(QuestionService::class)->compile($questions[$id]), $ids);
            if ($interactive) {
                $definition = app(InteractiveDefinition::class)->compile($data);
            }
            if ($data['kind'] === 'practice') {
                $definition = ['kind' => 'practice', 'passing_score' => (int) $data['passing_score'], 'max_attempts' => (int) $data['max_attempts'], 'template_key' => $data['template_key'] ?? null, 'rubric' => $data['rubric'] ?? null, 'due_at' => empty($data['due_at']) ? null : CarbonImmutable::parse($data['due_at'], config('app.timezone'))->toIso8601String()];
            }
            $version = $activity->versions()->create(['created_by' => $u->id, 'version' => ($activity->versions()->max('version') ?? 0) + 1, 'definition' => $definition]);
            $activity->update(['current_version_id' => $version->id]);
            app(AuditService::class)->record($new ? 'activity.created' : 'activity.updated', $u->id, ['module_id' => $module->id, 'activity_id' => $activity->id, 'version' => $version->version]);

            return $activity;
        });
        app(ProgressService::class)->refreshForModule($module);

        return $result;
    }

    public function archive(User $u, Activity $a): void
    {
        DB::transaction(function () use ($u, $a) {
            $a->update(['is_published' => false]);
            $a->delete();
            app(AuditService::class)->record('activity.archived', $u->id, ['activity_id' => $a->id]);
        });
        app(ProgressService::class)->refreshForModule($a->module);
    }
}
