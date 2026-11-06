<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\InteractiveAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class InteractiveService
{
    public function initial(array $snapshot): array
    {
        if ($snapshot['kind'] === 'game') {
            return app(GameTemplates::class)->initial($snapshot);
        }

        return $snapshot['kind'] === 'terminal' ? app(VirtualTerminal::class)->initial($snapshot['scenario']) : ['answer' => []];
    }

    public function start(User $user, Activity $activity): InteractiveAttempt
    {
        abort_unless(isset(InteractiveDefinition::KINDS[$activity->kind]), 404);
        $result = DB::transaction(function () use ($user, $activity) {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $activity = Activity::findOrFail($activity->id);
            Gate::forUser($user)->authorize('view', $activity);
            $open = InteractiveAttempt::where('user_id', $user->id)->where('activity_id', $activity->id)->where('status', 'in_progress')->first();
            if ($open && $open->expires_at->isFuture()) {
                return $open;
            }
            if ($open) {
                $this->finish($user, $open, true);
            }
            $definition = $activity->currentVersion->definition;
            $count = InteractiveAttempt::where('user_id', $user->id)->where('activity_id', $activity->id)->count();
            if ($count >= $definition['max_attempts']) {
                return null;
            }
            $snapshot = app(InteractiveDefinition::class)->snapshot($definition) + ['title' => $activity->title, 'instructions' => $activity->instructions];
            $attempt = InteractiveAttempt::create(['user_id' => $user->id, 'activity_id' => $activity->id, 'activity_version_id' => $activity->current_version_id, 'attempt_number' => $count + 1, 'snapshot' => $snapshot, 'state' => $this->initial($snapshot), 'started_at' => now(), 'expires_at' => now()->addMinutes($snapshot['duration_minutes']), 'level' => $snapshot['level']]);
            $p = ActivityProgress::firstOrNew(['user_id' => $user->id, 'activity_id' => $activity->id]);
            $p->started_at ??= now();
            $p->last_activity_at = now();
            $p->attempts_count = $count + 1;
            $p->status = $p->completed_at ? 'completed' : 'in_progress';
            $p->save();
            app(ProgressService::class)->event($user, $activity->module, 'interactive.started', ['attempt_id' => $attempt->id, 'kind' => $activity->kind, 'level' => $attempt->level], $activity->id, $activity->module_section_id);
            app(ProgressService::class)->recalculate($user, $activity->module, true);

            return $attempt;
        });
        if (! $result) {
            throw ValidationException::withMessages(['attempt' => 'Batas percobaan aktivitas telah tercapai.']);
        }

        return $result;
    }

    public function act(User $user, InteractiveAttempt $attempt, array $data): array
    {
        return DB::transaction(function () use ($user, $attempt, $data) {
            User::withTrashed()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $a = InteractiveAttempt::whereKey($attempt->id)->lockForUpdate()->firstOrFail();
            abort_unless($a->user_id === $user->id, 403);
            if ($a->status !== 'in_progress') {
                return $this->response($a, 'Percobaan telah dinilai.');
            }
            if (! $a->expires_at->isFuture()) {
                return $this->response($this->finish($user, $a, true), 'Waktu habis. Kondisi terakhir yang tersimpan telah dinilai.');
            }
            Gate::forUser($user)->authorize('view', $a->activity);
            abort_unless($a->revision === (int) $data['revision'], 409, 'Versi tampilan sudah berubah. Muat ulang percobaan.');
            if ($a->revision >= 1000 && $data['action'] !== 'submit') {
                throw ValidationException::withMessages(['action' => 'Batas 1.000 interaksi tercapai. Kirim hasil atau mulai percobaan berikutnya.']);
            }
            $s = $a->state;
            $output = 'Tersimpan.';
            $kind = $a->snapshot['kind'];
            $payload = [];
            switch ($data['action']) {
                case 'command':
                    abort_unless($kind === 'terminal', 422);
                    [$s,$output] = app(VirtualTerminal::class)->command($s, $data['command']);
                    $payload = ['command' => $data['command'], 'output' => $output];
                    break;
                case 'write':
                    abort_unless($kind === 'terminal', 422);
                    $s['files'][VirtualTerminal::CONFIG] = $data['content'];
                    $s['tested'] = false;
                    $output = 'Konfigurasi virtual disimpan. Uji sshd -t, lalu restart/reload service.';
                    $payload = ['path' => VirtualTerminal::CONFIG, 'content' => $data['content']];
                    break;
                case 'play':
                    abort_unless($kind === 'game', 422);
                    $s = app(GameTemplates::class)->play($a->snapshot, $s, $data['input'] ?? []);
                    $payload = ['input' => $data['input'] ?? []];
                    break;
                case 'answer':
                    abort_unless(! in_array($kind, ['terminal', 'game'], true), 422);
                    $s['answer'] = $this->validateAnswer($a->snapshot, $data['answer'] ?? []);
                    $payload = ['answer' => $s['answer']];
                    break;
                case 'reset':
                    if ($a->resets_count >= 3) {
                        throw ValidationException::withMessages(['action' => 'Maksimal tiga reset per percobaan.']);
                    }
                    $s = $this->initial($a->snapshot);
                    $a->resets_count++;
                    $output = 'Kondisi direset. Batas waktu dan jumlah percobaan tetap berjalan.';
                    break;
                case 'checkpoint':
                    $output = 'Checkpoint diperiksa dari kondisi yang tersimpan.';
                    break;
                case 'submit': break;
                default: abort(422);
            }
            $a->state = $s;
            $a->revision++;
            $a->save();
            $a->events()->create(['revision' => $a->revision, 'action' => $data['action'], 'payload' => $payload, 'created_at' => now()]);
            ActivityProgress::where('user_id', $user->id)->where('activity_id', $a->activity_id)->update(['last_activity_at' => now()]);
            app(ProgressService::class)->recalculate($user, $a->activity->module, true);
            if ($data['action'] === 'submit') {
                $a = $this->finish($user, $a, false);
            }
            $response = $this->response($a, $output);
            if ($data['action'] === 'checkpoint') {
                $response['checkpoint'] = $this->evaluate($a);
            }

            return $response;
        });
    }

    public function validateAnswer(array $c, array $answer): array
    {
        if ($c['kind'] === 'network') {
            $valid = array_diff(array_keys($answer), ['links', 'port', 'auth', 'service']) === [] && is_array($answer['links'] ?? null) && count($answer['links']) <= 3 && count(array_unique($answer['links'], SORT_REGULAR)) === count($answer['links']) && collect($answer['links'])->every(fn ($v) => is_string($v) && in_array($v, ['client-switch', 'switch-server', 'client-server'], true)) && in_array($answer['port'] ?? null, ['22', '2222'], true) && in_array($answer['auth'] ?? null, ['password', 'key'], true) && in_array($answer['service'] ?? null, ['running', 'stopped'], true);
        } elseif ($c['kind'] === 'sorting') {
            $keys = array_column($c['items'], 'key');
            $valid = array_is_list($answer) && count($answer) <= count($keys) && collect($answer)->every(fn ($v) => is_string($v) && in_array($v, $keys, true)) && count(array_unique($answer, SORT_REGULAR)) === count($answer);
        } else {
            $left = array_column($c['items'], 'key');
            $right = array_column($c['right'], 'key');
            $valid = count($answer) <= count($left) && collect($answer)->every(fn ($v, $k) => in_array($k, $left, true) && is_string($v) && ($v === '' || in_array($v, $right, true)));
            $chosen = array_filter($answer, fn ($v) => $v !== '');
            $valid = $valid && count(array_unique($chosen, SORT_REGULAR)) === count($chosen);
        }
        if (! $valid) {
            throw ValidationException::withMessages(['answer' => 'Jawaban tidak sesuai konfigurasi permainan.']);
        }

        return $answer;
    }

    public function evaluate(InteractiveAttempt $a): array
    {
        $c = $a->snapshot;
        $s = $a->state;
        $answer = $s['answer'] ?? [];
        if ($c['kind'] === 'game') {
            $checks = app(GameTemplates::class)->checks($c, $s);
        } elseif ($c['kind'] === 'terminal') {
            $checks = app(VirtualTerminal::class)->validateState($s, $c['scenario']);
        } elseif ($c['kind'] === 'network') {
            $checks = ['Klien terhubung ke switch' => in_array('client-switch', $answer['links'] ?? [], true), 'Switch terhubung ke server' => in_array('switch-server', $answer['links'] ?? [], true), 'Port sesuai listener server' => ($answer['port'] ?? '') === ($c['scenario'] === 'guided' ? '22' : '2222'), 'Service SSH aktif' => ($answer['service'] ?? '') === 'running', 'Metode autentikasi sesuai kebijakan' => ($answer['auth'] ?? '') === ($c['scenario'] === 'hardening' ? 'key' : 'password')];
        } elseif ($c['kind'] === 'sorting') {
            $checks = [];
            foreach ($c['correct'] as $i => $key) {
                $checks['Posisi '.($i + 1)] = ($answer[$i] ?? null) === $key;
            }
        } else {
            $checks = [];
            foreach ($c['items'] as $item) {
                $checks[$item['label']] = ($answer[$item['key']] ?? null) === $c['correct'][$item['key']];
            }
        }
        $score = round(100 * count(array_filter($checks)) / count($checks), 2);
        // Labs require every objective, even when a teacher sets a lower KKM.
        $passed = $score >= $c['passing_score'] && ($c['kind'] !== 'terminal' || ! in_array(false, $checks, true));

        return ['checks' => $checks, 'score' => $score, 'passed' => $passed, 'level' => $a->level];
    }

    private function finish(User $u, InteractiveAttempt $a, bool $expired): InteractiveAttempt
    {
        if ($a->status !== 'in_progress') {
            return $a;
        }
        $result = $this->evaluate($a);
        $time = $expired ? $a->expires_at : now();
        $a->update(['status' => $expired ? 'expired' : 'submitted', 'finished_at' => $time, 'score' => $result['score'], 'passed' => $result['passed'], 'result' => $result]);
        $p = ActivityProgress::firstOrNew(['user_id' => $u->id, 'activity_id' => $a->activity_id]);
        $p->started_at ??= $a->started_at;
        if (! $p->last_activity_at || $p->last_activity_at->lt($time)) {
            $p->last_activity_at = $time;
        }
        $p->last_score = $a->score;
        $p->best_score = max($p->best_score ?? 0, $a->score);
        $p->attempts_count = InteractiveAttempt::where('user_id', $u->id)->where('activity_id', $a->activity_id)->count();
        if ($a->passed) {
            $p->completed_at ??= $time;
        }
        $p->status = $p->completed_at ? 'completed' : 'in_progress';
        $p->validator_result = $result + ['interactive_attempt_id' => $a->id, 'expired' => $expired];
        $p->save();
        app(ProgressService::class)->event($u, $a->activity->module, 'interactive.submitted', ['attempt_id' => $a->id, 'kind' => $a->snapshot['kind'], 'score' => $a->score, 'passed' => $a->passed], $a->activity_id, $a->activity->module_section_id);
        app(ProgressService::class)->recalculate($u, $a->activity->module, true, $time);

        return $a;
    }

    public function expire(InteractiveAttempt $attempt): InteractiveAttempt
    {
        return DB::transaction(function () use ($attempt) {
            $u = User::withTrashed()->whereKey($attempt->user_id)->lockForUpdate()->firstOrFail();
            $a = InteractiveAttempt::whereKey($attempt->id)->lockForUpdate()->firstOrFail();

            return $a->status === 'in_progress' && ! $a->expires_at->isFuture() ? $this->finish($u, $a, true) : $a;
        });
    }

    public function response(InteractiveAttempt $a, string $message = ''): array
    {
        $state = $a->snapshot['kind'] === 'terminal' ? ['config' => $a->state['files'][VirtualTerminal::CONFIG], 'logs' => $a->state['logs'], 'cwd' => $a->state['cwd']] : $a->state;

        if ($a->snapshot['kind'] === 'game') {
            $state = app(GameTemplates::class)->publicState($a->snapshot, $a->state);
        }

        return ['revision' => $a->revision, 'status' => $a->status, 'state' => $state, 'result' => $a->result, 'resets_count' => $a->resets_count, 'expires_at' => $a->expires_at->toIso8601String(), 'server_now' => now()->toIso8601String(), 'message' => $message];
    }
}
