<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\LabSubmission;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PracticeService
{
    public function submit(User $user, Activity $activity, array $data, array $files): LabSubmission
    {
        $stored = [];
        try {
            return DB::transaction(function () use ($user, $activity, $data, $files, &$stored) {
                User::whereKey($user->id)->lockForUpdate()->firstOrFail();
                $activity = Activity::findOrFail($activity->id);
                abort_unless($activity->kind === 'practice', 422);
                Gate::forUser($user)->authorize('view', $activity);
                $existing = LabSubmission::where('user_id', $user->id)->where('request_key', $data['request_key'])->first();
                if ($existing) {
                    if ($existing->activity_id !== $activity->id) {
                        $this->invalid('Token pengiriman sudah digunakan. Muat ulang formulir.');
                    }

return $existing;
                }
                $definition = $activity->currentVersion->definition;
                if (! empty($definition['due_at']) && now()->gt(CarbonImmutable::parse($definition['due_at']))) {
                    $this->invalid('Batas pengumpulan sudah lewat. Hubungi guru untuk penyesuaian jadwal.');
                }
                $last = $activity->submissions()->where('user_id', $user->id)->latest('attempt_number')->first();
                if ($last && $last->status !== 'revision_requested') {
                    $this->invalid($last->status === 'approved' ? 'Praktik sudah disetujui.' : 'Pengumpulan sebelumnya masih menunggu penilaian.');
                }
                $number = ($last?->attempt_number ?? 0) + 1;
                if ($number > $definition['max_attempts']) {
                    $this->invalid('Batas pengumpulan tercapai. Hubungi guru.');
                }
                app(EvidenceStorage::class)->validate($files);
                $snapshot = $definition + ['title' => $activity->title, 'instructions' => $activity->instructions];
                $submission = $activity->submissions()->create(['user_id' => $user->id, 'activity_version_id' => $activity->current_version_id, 'attempt_number' => $number, 'request_key' => $data['request_key'], 'snapshot' => $snapshot, 'report' => $data['report'], 'submitted_at' => now()]);
                foreach ($files as $file) {
                    $meta = app(EvidenceStorage::class)->put($file);
                    $stored[] = $meta['path'];
                    $submission->files()->create($meta);
                }
                $p = ActivityProgress::firstOrNew(['user_id' => $user->id, 'activity_id' => $activity->id]);
                $p->started_at ??= now();
                $p->last_activity_at = now();
                $p->attempts_count = $number;
                $p->status = 'in_progress';
                $p->save();
                app(ProgressService::class)->event($user, $activity->module, 'practice.submitted', ['submission_id' => $submission->id, 'attempt_number' => $number], $activity->id, $activity->module_section_id);
                app(ProgressService::class)->recalculate($user, $activity->module, true);
                app(AuditService::class)->record('practice.submitted', $user->id, ['submission_id' => $submission->id, 'file_count' => count($files)]);

                return $submission;
            });
        } catch (\Throwable $e) {
            foreach ($stored as $path) {
                Storage::disk('evidence')->delete($path);
            }throw $e;
        }
    }

    public function assess(User $teacher, LabSubmission $submission, array $data): LabSubmission
    {
        return DB::transaction(function () use ($teacher, $submission, $data) {
            User::withTrashed()->whereKey($submission->user_id)->lockForUpdate()->firstOrFail();
            $submission = LabSubmission::whereKey($submission->id)->lockForUpdate()->firstOrFail();
            Gate::forUser($teacher)->authorize('assess', $submission);
            if ($submission->status !== 'pending') {
                $this->invalid('Pengumpulan ini sudah dinilai. Muat ulang untuk melihat hasil terbaru.');
            }
            $score = isset($data['score']) ? (float) $data['score'] : null;
            if (! in_array($data['decision'], ['approved', 'revision_requested'], true) || ($score !== null && ($score < 0 || $score > 100))) {
                $this->invalid('Keputusan atau nilai tidak valid.');
            }
            if ($data['decision'] === 'approved' && ($score === null || $score < $submission->snapshot['passing_score'])) {
                $this->invalid('Persetujuan membutuhkan nilai minimal KKM versi pengumpulan: '.$submission->snapshot['passing_score'].'. Pilih perlu perbaikan jika belum memenuhi.');
            }
            $submission->assessment()->create(['assessed_by' => $teacher->id, 'decision' => $data['decision'], 'score' => $score, 'feedback' => $data['feedback'], 'assessed_at' => now()]);
            $submission->update(['status' => $data['decision'], 'assessed_at' => now()]);
            $p = ActivityProgress::where('user_id', $submission->user_id)->where('activity_id', $submission->activity_id)->firstOrFail();
            $p->last_score = $score;
            if ($data['decision'] === 'approved') {
                $p->completed_at ??= now();
                $p->best_score = max($p->best_score ?? 0, $score);
            }
            $p->status = $p->completed_at ? 'completed' : 'in_progress';
            // Teacher assessment does not falsify the student's last active time.
            $p->validator_result = ['decision' => $data['decision'], 'score' => $score, 'submission_id' => $submission->id, 'assessed_by' => $teacher->id];
            $p->save();
            $student = User::withTrashed()->findOrFail($submission->user_id);
            app(ProgressService::class)->recalculate($student, $submission->activity->module);
            app(ProgressService::class)->event($student, $submission->activity->module, 'practice.assessed', ['submission_id' => $submission->id, 'decision' => $data['decision'], 'score' => $score], $submission->activity_id, $submission->activity->module_section_id);
            app(AuditService::class)->record('practice.assessed', $teacher->id, ['submission_id' => $submission->id, 'student_id' => $student->id, 'decision' => $data['decision'], 'score' => $score]);

            return $submission;
        });
    }

    public function scoped(User $actor, array $filters = [])
    {
        $q = LabSubmission::query();
        if ($actor->role === 'siswa') {
            return $q->where('user_id', $actor->id);
        }
        abort_unless(in_array($actor->role, ['admin', 'guru'], true), 403);
        if ($actor->role === 'admin' && empty($filters['academic_year']) && empty($filters['semester']) && empty($filters['rombel_id']) && empty($filters['module_id'])) {
            return $q;
        }
        $pairs = app(LearningReportService::class)->pairs($actor, collect($filters)->only(['academic_year', 'semester', 'rombel_id', 'module_id'])->all() + ['history' => true]);

        return $q->whereHas('activity', fn ($a) => $a->whereExists(fn ($s) => $s->selectRaw('1')->fromSub($pairs, 'scope')->whereColumn('scope.student_id', 'lab_submissions.user_id')->whereColumn('scope.module_id','activities.module_id')));
    }

    private function invalid(string $message): never
    {
        throw ValidationException::withMessages(['practice' => $message]);
    }
}
