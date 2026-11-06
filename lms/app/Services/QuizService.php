<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\ModuleProgress;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class QuizService
{
    private function snapshot(Activity $activity): array
    {
        $config = $activity->currentVersion->definition;
        $questions = $config['questions'];
        if ($config['random_questions']) {
            shuffle($questions);
        }$questions = array_slice($questions, 0, $config['question_count']);
        $snapshot = [];
        foreach ($questions as $q) {
            $q['key'] = Str::random(24);
            if ($q['type'] === 'matching') {
                $left = $q['choices'];
                $right = [];
                $map = [];
                foreach ($left as $choice) {
                    $id = Str::random(20);
                    $right[] = ['key' => $id, 'label' => $q['correct'][$choice['key']]];
                    $map[$choice['key']] = $id;
                }$q['correct'] = $map;
                $q['right'] = $right;
                shuffle($q['right']);
            }
            if ($config['shuffle_options'] || $q['type'] === 'ordering') {
                shuffle($q['choices']);
            }$snapshot[] = $q;
        }$config['questions'] = $snapshot;
        $config['title'] = $activity->title;

        return $config;
    }

    public function start(User $user, Activity $activity): QuizAttempt
    {
        abort_unless(in_array($activity->kind, ['checkpoint', 'quiz'], true), 422);
        $result = DB::transaction(function () use ($user, $activity) {
            User::withTrashed()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $open = QuizAttempt::where('user_id', $user->id)->where('activity_id', $activity->id)->where('status', 'in_progress')->first();
            if ($open) {
                if ($open->expires_at->isFuture()) {
                    return $open;
                }$this->finishLocked($user, $open, true);
            }
            $config = $activity->currentVersion->definition;
            $count = QuizAttempt::where('user_id', $user->id)->where('activity_id', $activity->id)->count();
            if ($count >= $config['max_attempts']) {
                return ['error' => 'Batas percobaan aktivitas telah tercapai.'];
            }
            if ($activity->kind === 'checkpoint' && app(ReadingTracker::class)->seconds($user, $activity->module_section_id) < $config['min_active_seconds']) {
                return ['error' => 'Durasi aktif materi belum mencapai '.$config['min_active_seconds'].' detik. Lanjutkan membaca dan berinteraksi sebelum membuka checkpoint.'];
            }
            $attempt = QuizAttempt::create(['user_id' => $user->id, 'activity_id' => $activity->id, 'activity_version_id' => $activity->current_version_id, 'attempt_number' => $count + 1, 'snapshot' => $this->snapshot($activity), 'started_at' => now(), 'expires_at' => now()->addMinutes($config['duration_minutes'])]);
            $progress = ActivityProgress::firstOrNew(['user_id' => $user->id, 'activity_id' => $activity->id]);
            $progress->started_at ??= now();
            $progress->last_activity_at = now();
            $progress->attempts_count = $count + 1;
            $progress->status = $progress->completed_at ? 'completed' : 'in_progress';
            $progress->save();
            app(ProgressService::class)->event($user, $activity->module, 'quiz.started', ['attempt_id' => $attempt->id], $activity->id, $activity->module_section_id);
            app(ProgressService::class)->recalculate($user, $activity->module, true);

            return $attempt;
        });
        if (is_array($result)) {
            throw ValidationException::withMessages(['attempt' => $result['error']]);
        }

        return $result;
    }

    public function publicQuestion(array $question): array
    {
        return collect($question)->only(['key', 'type', 'prompt', 'scenario', 'points', 'choices', 'right'])->all();
    }

    private function validateAnswers(QuizAttempt $attempt, array $answers): void
    {
        if (strlen(json_encode($answers)) > 200000) {
            throw ValidationException::withMessages(['answers' => 'Jawaban terlalu besar.']);
        }$questions = collect($attempt->snapshot['questions'])->keyBy('key');
        foreach ($answers as $key => $answer) {
            $q = $questions->get($key);
            if (! $q) {
                throw ValidationException::withMessages(['answers' => 'Ada soal yang bukan bagian dari percobaan ini.']);
            }$choiceKeys = array_column($q['choices'], 'key');
            $valid = match ($q['type']) {
                'short' => is_string($answer) && mb_strlen($answer) <= 2000,
                'boolean' => is_string($answer) && in_array($answer, ['true', 'false', ''], true),
                'single','scenario' => is_string($answer) && ($answer === '' || in_array($answer, $choiceKeys, true)),
                'multiple','ordering' => is_array($answer) && count($answer) <= 12 && collect($answer)->every(fn ($v) => is_string($v) && ($v === '' || in_array($v, $choiceKeys, true))),
                'matching' => is_array($answer) && count($answer) <= 12 && collect($answer)->every(fn ($v, $k) => in_array($k, $choiceKeys, true) && is_string($v) && ($v === '' || in_array($v, array_column($q['right'], 'key'), true))),default => false
            };
            if (! $valid) {
                throw ValidationException::withMessages(['answers' => 'Bentuk jawaban tidak sesuai jenis soal.']);
            }
        }
    }

    public function save(User $user, QuizAttempt $attempt, array $answers, bool $submit = false): QuizAttempt
    {
        return DB::transaction(function () use ($user, $attempt, $answers, $submit) {
            User::withTrashed()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $attempt = QuizAttempt::whereKey($attempt->id)->lockForUpdate()->firstOrFail();
            abort_unless($attempt->user_id === $user->id, 403);
            if ($attempt->status !== 'in_progress') {
                return $attempt;
            }
            if (! $attempt->expires_at->isFuture()) {
                return $this->finishLocked($user, $attempt, true);
            }
            ActivityProgress::where('user_id', $user->id)->where('activity_id', $attempt->activity_id)->update(['last_activity_at' => now()]);
            ModuleProgress::where('user_id', $user->id)->where('module_id', $attempt->activity->module_id)->update(['last_activity_at' => now()]);
            if ($submit) {
                foreach ($attempt->snapshot['questions'] as $q) {
                    if (! array_key_exists($q['key'], $answers)) {
                        $answers[$q['key']] = in_array($q['type'], ['multiple', 'matching', 'ordering'], true) ? [] : '';
                    }
                }
            }
            $this->validateAnswers($attempt, $answers);
            foreach ($answers as $key => $answer) {
                $attempt->answers()->updateOrCreate(['question_key' => $key], ['answer' => ['value' => $answer]]);
            }
            if ($submit) {
                return $this->finishLocked($user, $attempt, false);
            }

            return $attempt;
        });
    }

    public function expire(QuizAttempt $attempt): QuizAttempt
    {
        return $this->save(User::withTrashed()->findOrFail($attempt->user_id), $attempt, [], false);
    }

    private function finishLocked(User $user, QuizAttempt $attempt, bool $expired): QuizAttempt
    {
        if ($attempt->status !== 'in_progress') {
            return $attempt;
        }$answers = $attempt->answers()->get()->keyBy('question_key');
        $earned = 0;
        $total = 0;
        $outcomes = [];
        foreach ($attempt->snapshot['questions'] as $q) {
            $value = $answers->get($q['key'])?->answer['value'] ?? null;
            $correct = app(QuizScorer::class)->correct($q, $value);
            $points = $correct ? $q['points'] : 0;
            $total += $q['points'];
            $earned += $points;
            $attempt->answers()->updateOrCreate(['question_key' => $q['key']], ['answer' => ['value' => $value], 'is_correct' => $correct, 'awarded_points' => $points]);
            $outcomes[$q['key']] = $correct;
        }
        $score = $total ? round(100 * $earned / $total, 2) : 0;
        $passed = $score >= $attempt->snapshot['passing_score'];
        $endedAt = $expired ? $attempt->expires_at : now();
        $attempt->update(['status' => $expired ? 'expired' : 'submitted', 'submitted_at' => $endedAt, 'score' => $score, 'passed' => $passed]);
        $progress = ActivityProgress::firstOrNew(['user_id' => $user->id, 'activity_id' => $attempt->activity_id]);
        $progress->started_at ??= $attempt->started_at;
        $progress->last_activity_at = $endedAt;
        $progress->last_score = $score;
        $progress->best_score = max($score, $progress->best_score ?? 0);
        $progress->attempts_count = QuizAttempt::where('user_id', $user->id)->where('activity_id', $attempt->activity_id)->count();
        if ($passed) {
            $progress->completed_at ??= $endedAt;
        }$progress->status = $progress->completed_at ? 'completed' : 'in_progress';
        $progress->validator_result = ['passed' => $passed, 'score' => $score, 'expired' => $expired, 'attempt_id' => $attempt->id];
        $progress->save();
        app(ProgressService::class)->event($user, $attempt->activity->module, 'quiz.submitted', ['attempt_id' => $attempt->id, 'score' => $score, 'passed' => $passed, 'expired' => $expired], $attempt->activity_id, $attempt->activity->module_section_id);
        app(ProgressService::class)->recalculate($user, $attempt->activity->module, true, $endedAt);

        return $attempt;
    }

    public function canReview(QuizAttempt $attempt): bool
    {
        return $attempt->status !== 'in_progress' && QuizAttempt::where('user_id', $attempt->user_id)->where('activity_id', $attempt->activity_id)->count() >= $attempt->snapshot['max_attempts'] && ! QuizAttempt::where('user_id', $attempt->user_id)->where('activity_id', $attempt->activity_id)->where('status', 'in_progress')->exists();
    }
}
