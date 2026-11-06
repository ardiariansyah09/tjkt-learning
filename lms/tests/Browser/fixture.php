<?php

use App\Models\Module;
use App\Models\Rombel;
use App\Models\User;
use App\Services\ActivityService;
use App\Services\QuestionService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

// Explicit, isolated UAT fixtures. No existing account or teaching module is modified.
require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (getenv('TJKT_ALLOW_BROWSER_FIXTURE') !== '1') {
    throw new RuntimeException('Set TJKT_ALLOW_BROWSER_FIXTURE=1 explicitly.');
}
$path = $argv[1] ?? '';
if (! str_starts_with($path, '/tmp/tjkt-uat-') || str_contains($path, '..')) {
    throw new RuntimeException('Context must be a private /tmp/tjkt-uat-* file.');
}
if (($argv[2] ?? '') === 'archive') {
    $c = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
    DB::transaction(function () use ($c) {
        $m = Module::withTrashed()->findOrFail($c['module']);
        if ($m->code !== $c['tag'] || ! str_starts_with($c['tag'], 'UAT-')) {
            throw new RuntimeException('Fixture marker mismatch.');
        }
        foreach ($m->activities()->get() as $a) {
            $a->update(['is_published' => false]);
            $a->delete();
        }
        $m->update(['status' => 'archived']);
        $m->delete();
        $r = Rombel::withTrashed()->findOrFail($c['rombel']);
        $r->update(['is_active' => false]);
        $r->delete();
        foreach ($c['accounts'] as $u) {
            $row = User::withTrashed()->findOrFail($u['id']);
            if ($row->username !== $u['username']) {
                throw new RuntimeException('Account marker mismatch.');
            }$row->update(['is_active' => false]);
            $row->delete();
        }
    });
    foreach ($c['accounts'] as &$u) {
        unset($u['password']);
    }unset($u);
    $c['archived_at'] = now()->toIso8601String();
    file_put_contents($path, json_encode($c, JSON_PRETTY_PRINT));
    chmod($path, 0600);
    echo "UAT accounts, rombel and module archived; evidence retained for audit.\n";
    exit;
}
if (file_exists($path)) {
    throw new RuntimeException('Refusing to replace an existing fixture context.');
}
$c = DB::transaction(function () {
    $tag = 'UAT-'.now()->format('YmdHis').'-'.bin2hex(random_bytes(3));
    $accounts = [];
    foreach (['teacher' => 'guru', 'student' => 'siswa', 'outsider' => 'siswa'] as $name => $role) {
        $password = bin2hex(random_bytes(16)).'Aa9!';
        $u = User::create(['name' => $tag.' '.$name, 'username' => strtolower($tag.'-'.$name), 'password' => $password, 'role' => $role, 'is_active' => true, 'must_change_password' => false]);
        $accounts[$name] = ['id' => $u->id, 'username' => $u->username, 'password' => $password];
    }
    $t = User::findOrFail($accounts['teacher']['id']);
    $r = Rombel::create(['name' => $tag, 'grade' => 11, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true]);
    $r->teachers()->attach($t->id);
    $r->students()->attach($accounts['student']['id'], ['joined_at' => now()]);
    $m = Module::create(['created_by' => $t->id, 'code' => $tag, 'title' => $tag.' Pengujian browser', 'description' => 'Fixture UAT terisolasi; bukan materi siswa.', 'grade' => 11, 'status' => 'published', 'published_at' => now()]);
    $m->rombels()->attach($r->id);
    $base = ['instructions' => 'Aktivitas pengujian terisolasi.', 'is_published' => true, 'is_required' => true, 'progress_weight' => 1, 'sort_order' => 10, 'passing_score' => 100, 'max_attempts' => 5, 'duration_minutes' => 45, 'question_count' => 1, 'random_questions' => true, 'shuffle_options' => true, 'min_active_seconds' => 0, 'level' => 1, 'scenario' => 'guided', 'module_section_id' => null, 'question_ids' => []];
    $activities = [];
    foreach (['matching', 'drag_drop', 'sorting', 'network', 'terminal', 'practice'] as $kind) {
        $data = $base + ['kind' => $kind, 'title' => 'UAT '.$kind, 'game_items' => $kind === 'sorting' ? "Instal\nKonfigurasi\nUji" : "SSH | TCP 22\nHTTPS | TCP 443", 'rubric' => 'Bukti pengujian browser', 'due_at' => null];
        if ($kind === 'practice') {
            $data['passing_score'] = 80;
        }$a = app(ActivityService::class)->save($t, $m, $data);
        $activities[$kind] = $a->id;
    }
    $q = app(QuestionService::class)->save($t, ['type' => 'single', 'prompt' => 'Port standar SSH adalah?', 'points' => 1, 'is_shared' => false, 'explanation' => 'SSH memakai TCP 22.', 'options' => [['label' => 'TCP 22', 'is_correct' => true], ['label' => 'UDP 53', 'is_correct' => false]]]);
    $quiz = app(ActivityService::class)->save($t, $m, array_merge($base, ['kind' => 'quiz', 'title' => 'UAT kuis', 'question_ids' => [$q->id]]));
    $activities['quiz'] = $quiz->id;

    return ['tag' => $tag, 'module' => $m->id, 'rombel' => $r->id, 'accounts' => $accounts, 'activities' => $activities, 'base_url' => 'https://learning.tkjwikrama.my.id'];
});
umask(0077);
file_put_contents($path, json_encode($c, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
chmod($path, 0600);
echo 'UAT fixture prepared: '.$c['tag'].'; module #'.$c['module'].". Credentials stored only in private context.\n";
