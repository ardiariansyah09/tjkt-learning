<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\LearningVerification;
use App\Models\Module;
use App\Models\ModuleAccessOverride;
use App\Models\ModulePrerequisite;
use App\Models\ModuleProgress;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class LearningAccessService
{
    public function catalog(User $student): Builder
    {
        return Module::where('status', 'published')->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))->whereHas('rombels', fn ($q) => $q->where('is_active', true)->whereHas('students', fn ($s) => $s->where('users.id', $student->id)->whereNull('rombel_students.left_at')));
    }

    public function discover(User $student, Module $module): bool
    {
        return $student->is_active && $student->role === 'siswa' && $this->catalog($student)->whereKey($module->id)->exists();
    }

    public function reasons(User $student, Module $module): array
    {
        if (! $this->discover($student, $module)) {
            return ['Materi belum terbit atau tidak ditugaskan ke rombel aktif Anda.'];
        }
        if (ModuleAccessOverride::where('user_id', $student->id)->where('module_id', $module->id)->whereNull('revoked_at')->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->exists()) {
            return [];
        }
        $reasons = [];
        if ($module->sequential_learning) {
            $previous = $this->catalog($student)->where('grade', $module->grade)->where(fn ($q) => $q->where('sort_order', '<', $module->sort_order)->orWhere(fn ($q) => $q->where('sort_order', $module->sort_order)->where('id', '<', $module->id)))->orderByDesc('sort_order')->orderByDesc('id')->first();
            if ($previous && ! ModuleProgress::where('user_id', $student->id)->where('module_id', $previous->id)->where('status', 'completed')->exists()) {
                $reasons[] = 'Selesaikan materi sebelumnya: '.$previous->title;
            }
        }
        $rules = $module->prerequisites()->with('requiredModule')->get();
        $proofs = $rules->isEmpty() ? collect() : LearningVerification::where('user_id', $student->id)->whereIn('module_id', $rules->pluck('required_module_id'))->whereNull('revoked_at')->get(['module_id', 'type', 'score']);
        $automatic = ModuleProgress::where('user_id', $student->id)->whereIn('module_id', $rules->pluck('required_module_id'))->get()->keyBy('module_id');
        foreach ($rules as $rule) {
            $fulfilled = $proofs->contains(fn ($proof) => $proof->module_id === $rule->required_module_id && $proof->type === $rule->type && ($rule->type !== 'quiz_score' || ($proof->score !== null && $proof->score >= $rule->min_score)));
            $auto = $automatic->get($rule->required_module_id);
            $fulfilled = $fulfilled || ($rule->type === 'module_completed' && $auto?->status === 'completed') || ($rule->type === 'quiz_score' && $auto?->quiz_score !== null && $auto?->quiz_score >= $rule->min_score);
            if ($rule->type === 'lab_completed') {
                $labs = Activity::where('module_id', $rule->required_module_id)->whereIn('kind', ['terminal', 'practice'])->where('is_required', true)->where('is_published', true)->whereNotNull('current_version_id')->where(fn ($q) => $q->whereNull('module_section_id')->orWhereHas('section', fn ($s) => $s->whereNull('deleted_at')->where('is_published', true)))->get();
                $done = ActivityProgress::where('user_id', $student->id)->whereIn('activity_id', $labs->modelKeys())->whereNotNull('completed_at')->count();
                $fulfilled = $fulfilled || ($labs->isNotEmpty() && $done === $labs->count());
            }
            if (! $fulfilled) {
                $reasons[] = (ModulePrerequisite::TYPES[$rule->type] ?? 'Prasyarat').' — '.($rule->requiredModule?->title ?? 'Materi diarsipkan').($rule->type === 'quiz_score' ? ' (minimal '.$rule->min_score.')' : '');
            }
        }

        return $reasons;
    }

    public function accessible(User $student, Module $module): bool
    {
        return $this->discover($student, $module) && $this->reasons($student, $module) === [];
    }

    public function teacherCanVerify(User $teacher, User $student, Module $module): bool
    {
        if (! $teacher->is_active || $student->role !== 'siswa' || ! $student->is_active || $student->trashed()) {
            return false;
        }
        if ($teacher->role === 'admin') {
            return true;
        }
        if ($teacher->role !== 'guru') {
            return false;
        }
        $assigned = $student->rombels()->wherePivotNull('left_at')->where('is_active', true)->whereHas('teachers', fn ($q) => $q->where('users.id', $teacher->id))->exists();

        return $assigned && ($module->created_by === $teacher->id || $module->rombels()->whereHas('teachers', fn ($q) => $q->where('users.id', $teacher->id))->exists());
    }
}
