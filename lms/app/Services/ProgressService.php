<?php

namespace App\Services;

use App\Models\ActivityProgress;
use App\Models\LearningEvent;
use App\Models\Module;
use App\Models\ModuleProgress;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class ProgressService
{
    public function recalculate(User $user, Module $module, bool $touch = false, ?CarbonInterface $at = null): ModuleProgress
    {
        if ($module->package_slug) return app(LearningPackage::class)->recalculate($user, $module, $touch);
        return DB::transaction(function () use ($user, $module, $touch, $at) {
            User::withTrashed()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $row = ModuleProgress::firstOrNew(['user_id' => $user->id, 'module_id' => $module->id]);
            $activities = $module->activities()->where('is_published', true)->whereNotNull('current_version_id')->where(fn ($q) => $q->whereNull('module_section_id')->orWhereHas('section', fn ($s) => $s->whereNull('deleted_at')->where('is_published', true)))->get();
            $progress = ActivityProgress::where('user_id', $user->id)->whereIn('activity_id', $activities->modelKeys())->get()->keyBy('activity_id');
            $total = 0;
            $earned = 0;
            $required = 0;
            $completed = 0;
            foreach ($module->sections()->where('is_published', true)->where('is_required', true)->get() as $section) {
                $total += $section->progress_weight;
                $required++;
                $checks = $activities->where('kind', 'checkpoint')->where('module_section_id', $section->id)->where('is_required', true);
                if ($checks->isNotEmpty() && $checks->every(fn ($a) => $progress->get($a->id)?->completed_at !== null)) {
                    $earned += $section->progress_weight;
                    $completed++;
                }
            }
            foreach ($activities->where('kind', '!=', 'checkpoint')->where('is_required', true) as $activity) {
                $required++;
                $total += $activity->progress_weight;
                if ($progress->get($activity->id)?->completed_at) {
                    $completed++;
                    $earned += $activity->progress_weight;
                }
            }
            if ($module->sequential_learning) {
                $total = 0;
                $earned = 0;
                $required = 0;
                $completed = 0;
                $states = app(LearningSequence::class)->states($user, $module);
                foreach ($module->sections()->where('is_published', true)->get() as $section) {
                    $total += $section->progress_weight;
                    $required++;
                    if ($states[$section->id]['complete'] ?? false) {
                        $earned += $section->progress_weight;
                        $completed++;
                    }
                }
                foreach ($activities->whereNull('module_section_id')->where('is_required', true) as $activity) {
                    $total += $activity->progress_weight;
                    $required++;
                    if ($progress->get($activity->id)?->completed_at) {
                        $earned += $activity->progress_weight;
                        $completed++;
                    }
                }
            }
            $quizzes = $activities->where('kind', 'quiz')->where('is_required', true);
            if ($quizzes->isEmpty()) {
                $quizzes = $activities->where('kind', 'quiz');
            }
            $allScored = $quizzes->isNotEmpty() && $quizzes->every(fn ($a) => $progress->get($a->id)?->best_score !== null);
            $percent = $total ? round(100 * $earned / $total, 2) : 0;
            $done = $total > 0 && $completed === $required;
            if ($touch) {
                $time = $at ?? now();
                $row->started_at ??= $time;
                if (! $row->last_activity_at || $row->last_activity_at->lt($time)) {
                    $row->last_activity_at = $time;
                }
            }
            $practices = $activities->where('kind', 'practice')->where('is_required', true);
            if ($practices->isEmpty()) {
                $practices = $activities->where('kind', 'practice');
            }
            $practiceScored = $practices->isNotEmpty() && $practices->every(fn ($a) => $progress->get($a->id)?->best_score !== null);
            $row->practice_score = $practiceScored ? round($practices->avg(fn ($a) => $progress->get($a->id)->best_score), 2) : null;
            $row->completion_percent = $percent;
            $row->required_items = $required;
            $row->completed_items = $completed;
            $row->quiz_score = $allScored ? round($quizzes->avg(fn ($a) => $progress->get($a->id)->best_score), 2) : null;
            $row->status = $done ? 'completed' : ($row->started_at ? 'in_progress' : 'not_started');
            $row->completed_at = $done ? ($row->completed_at ?? now()) : null;
            if ($done && ! $row->first_completed_at) {
                $row->first_completed_at = now();
                $this->event($user, $module, 'module.completed');
            }
            $row->save();

            return $row;
        });
    }

    public function refreshForModule(Module $module): void
    {
        ModuleProgress::where('module_id', $module->id)->select('user_id')->chunkById(100, function ($rows) use ($module) {
            foreach ($rows as $row) {
                $user = User::withTrashed()->find($row->user_id);
                if ($user && ! $user->trashed()) {
                    $this->recalculate($user, $module);
                }
            }
        }, 'user_id');
    }

    public function event(User $user, Module $module, string $event, array $metadata = [], ?int $activityId = null, ?int $sectionId = null): void
    {
        LearningEvent::create(['user_id' => $user->id, 'module_id' => $module->id, 'activity_id' => $activityId, 'module_section_id' => $sectionId, 'event' => $event, 'metadata' => $metadata ?: null, 'created_at' => now()]);
    }
}
