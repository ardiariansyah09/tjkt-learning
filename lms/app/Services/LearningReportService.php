<?php

namespace App\Services;

use App\Models\InteractiveAttempt;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LearningReportService
{
    public function pairs(User $actor, array $filters = [])
    {
        $q = DB::table('users as u')->join('rombel_students as rs', 'rs.user_id', '=', 'u.id')->join('rombels as r', 'r.id', '=', 'rs.rombel_id')->join('module_assignments as ma', 'ma.rombel_id', '=', 'r.id')->join('modules as m', 'm.id', '=', 'ma.module_id')->leftJoin('module_progress as mp', fn ($join) => $join->on('mp.user_id', '=', 'u.id')->on('mp.module_id', '=', 'm.id'))->where('u.role', 'siswa')->where(fn ($q) => $q->where('m.status', 'published')->orWhereNotNull('m.published_at')->orWhereNotNull('mp.id'));
        if ($actor->role === 'guru') {
            $q->whereExists(fn ($s) => $s->selectRaw('1')->from('teacher_rombel as tr')->whereColumn('tr.rombel_id', 'r.id')->where('tr.user_id', $actor->id));
        }
        if (empty($filters['academic_year']) && empty($filters['semester']) && empty($filters['history'])) {
            $q->whereNull('rs.left_at')->whereNull('u.deleted_at')->whereNull('r.deleted_at');
        }
        foreach (['academic_year' => 'r.academic_year', 'semester' => 'r.semester', 'rombel_id' => 'r.id', 'module_id' => 'm.id'] as $key => $column) {
            if (! empty($filters[$key])) {
                $q->where($column, $filters[$key]);
            }
        }
        if (! empty($filters['q'])) {
            $value = '%'.addcslashes($filters['q'], '%_\\').'%';
            $q->where(fn ($s) => $s->where('u.name', 'like', $value)->orWhere('u.nis', 'like', $value)->orWhere('u.username', 'like', $value));
        }
        if (! empty($filters['status'])) {
            $q->whereRaw("COALESCE(mp.status,'not_started') = ?", [$filters['status']]);
        }
        if (! empty($filters['from'])) {
            $q->whereDate('mp.last_activity_at', '>=', $filters['from']);
        }if (! empty($filters['to'])) {
            $q->whereDate('mp.last_activity_at', '<=', $filters['to']);
        }

        return $q->select(['u.id as student_id', 'u.name', 'u.nis', 'u.username', 'm.id as module_id', 'm.title', 'm.status as module_status', 'mp.last_activity_at', 'mp.completed_items', 'mp.required_items', 'mp.quiz_score', 'mp.practice_score', 'mp.final_score', 'm.package_slug'])->selectRaw("COALESCE(mp.status,'not_started') as progress_status, COALESCE(mp.completion_percent,0) as completion_percent")->distinct();
    }

    public function authorize(User $actor, int $studentId, int $moduleId, array $filters = []): void
    {
        $scope = collect($filters)->only(['academic_year', 'semester', 'rombel_id'])->all() + ['module_id' => $moduleId];
        if ($actor->role === 'admin') {
            $scope['history'] = true;
        }abort_unless(in_array($actor->role, ['admin', 'guru'], true) && $this->pairs($actor, $scope)->where('u.id', $studentId)->exists(), 403);
    }

    public function expireScoped(User $actor, array $filters = []): void
    {
        $filters = collect($filters)->except(['status', 'from', 'to'])->all();
        $pairs = $this->pairs($actor, $filters);
        $attempts = QuizAttempt::join('activities as exp_a', 'exp_a.id', '=', 'quiz_attempts.activity_id')->where('quiz_attempts.status', 'in_progress')->where('quiz_attempts.expires_at', '<=', now())->whereExists(fn ($q) => $q->selectRaw('1')->fromSub($pairs, 'assigned')->whereColumn('assigned.student_id', 'quiz_attempts.user_id')->whereColumn('assigned.module_id', 'exp_a.module_id'))->select('quiz_attempts.*')->limit(100)->get();
        $interactive = InteractiveAttempt::join('activities as exp_a', 'exp_a.id', '=', 'interactive_attempts.activity_id')->where('interactive_attempts.status', 'in_progress')->where('interactive_attempts.expires_at', '<=', now())->whereExists(fn ($q) => $q->selectRaw('1')->fromSub($pairs, 'assigned')->whereColumn('assigned.student_id', 'interactive_attempts.user_id')->whereColumn('assigned.module_id', 'exp_a.module_id'))->select('interactive_attempts.*')->limit(100)->get();
        foreach ($interactive as $a) {
            app(InteractiveService::class)->expire($a);
        }
        foreach ($attempts as $attempt) {
            app(QuizService::class)->expire($attempt);
        }
    }
}
