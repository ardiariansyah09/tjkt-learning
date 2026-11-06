<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\Module;
use App\Models\ModuleSection;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LearningSequence
{
    public function states(User $user, Module $module): array
    {
        $sections = $module->sections()->where('is_published', true)->with(['activities' => fn ($q) => $q->where('is_published', true)->where('is_required', true)->whereNotNull('current_version_id')])->get();
        $ids = $sections->flatMap(fn ($s) => $s->activities->modelKeys());
        $done = ActivityProgress::where('user_id', $user->id)->whereIn('activity_id', $ids)->whereNotNull('completed_at')->pluck('activity_id')->all();
        $read = DB::table('section_completions')->where('user_id', $user->id)->whereIn('module_section_id', $sections->modelKeys())->pluck('module_section_id')->all();
        $states = [];
        $priorDone = true;
        foreach ($sections as $s) {
            $checks = $s->activities;
            $complete = $checks->isNotEmpty() ? $checks->every(fn ($a) => in_array($a->id, $done, true)) : (! $s->is_required && in_array($s->id, $read, true));
            if ($s->is_required && $checks->isEmpty()) {
                $complete = false;
            }
            $states[$s->id] = ['complete' => $complete, 'open' => ! $module->sequential_learning || $priorDone, 'needs_assessment' => $checks->isNotEmpty() || $s->is_required];
            $priorDone = $priorDone && $complete;
        }

        return $states;
    }

    public function allows(User $user, ModuleSection $section): bool
    {
        if (! $section->module->sequential_learning) {
            return true;
        }

        return $this->states($user, $section->module)[$section->id]['open'] ?? false;
    }

    public function activityAllows(User $user, Activity $activity): bool
    {
        if (! $activity->module->sequential_learning) {
            return true;
        }
        if ($activity->module_section_id) {
            return $activity->section && $this->allows($user, $activity->section);
        }

        return ! collect($this->states($user, $activity->module))->contains(fn ($state) => ! $state['complete']);
    }
}
