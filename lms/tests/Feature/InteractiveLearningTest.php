<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\InteractiveAttempt;
use App\Models\Module;
use App\Models\ModulePrerequisite;
use App\Models\ModuleProgress;
use App\Models\Rombel;
use App\Models\User;
use App\Services\ActivityService;
use App\Services\GameTemplates;
use App\Services\InteractiveDefinition;
use App\Services\InteractiveService;
use App\Services\LearningAccessService;
use App\Services\SshGoldenModule;
use App\Services\VirtualTerminal;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class InteractiveLearningTest extends TestCase
{
    use DatabaseTransactions;

    private function user(string $role = 'admin'): User
    {
        return User::create(['name' => 'Uji interaktif', 'username' => 'int_'.bin2hex(random_bytes(6)), 'password' => 'UjiPassword2026!', 'role' => $role, 'is_active' => true, 'must_change_password' => false]);
    }

    private function course(User $teacher, User $student): Module
    {
        $r = Rombel::create(['name' => 'XI Interaktif '.bin2hex(random_bytes(4)), 'grade' => 11, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true]);
        $r->students()->attach($student->id, ['joined_at' => now()]);
        $r->teachers()->attach($teacher->id);
        $m = Module::create(['created_by' => $teacher->id, 'code' => 'INT-'.bin2hex(random_bytes(6)), 'title' => 'Interaktif SSH', 'status' => 'published', 'published_at' => now(), 'grade' => 11]);
        $m->rombels()->attach($r->id);

        return $m;
    }

    private function data(string $kind = 'terminal', array $extra = []): array
    {
        return array_merge(['title' => 'Aktivitas '.$kind, 'kind' => $kind, 'module_section_id' => null, 'instructions' => 'Latihan', 'is_published' => true, 'is_required' => true, 'progress_weight' => 2, 'sort_order' => 10, 'passing_score' => 80, 'max_attempts' => 2, 'duration_minutes' => 30, 'question_count' => 1, 'random_questions' => true, 'shuffle_options' => true, 'min_active_seconds' => 0, 'question_ids' => [], 'scenario' => 'guided', 'game_items' => "SSH | TCP 22\nHTTPS | TCP 443\nDNS | UDP 53", 'level' => 2], $extra);
    }

    private function activity(User $teacher, Module $m, string $kind = 'terminal', array $extra = []): Activity
    {
        return app(ActivityService::class)->save($teacher, $m, $this->data($kind, $extra));
    }

    private function setupActivity(string $kind = 'terminal', array $extra = []): array
    {
        $t = $this->user('guru');
        $s = $this->user('siswa');
        $m = $this->course($t, $s);
        $a = $this->activity($t, $m, $kind, $extra);

        return [$t, $s, $m, $a];
    }

    private function start(User $s, Activity $a): InteractiveAttempt
    {
        $this->actingAs($s)->post('/siswa/interaktif/aktivitas/'.$a->id.'/mulai')->assertRedirect();

        return InteractiveAttempt::where('user_id', $s->id)->where('activity_id', $a->id)->latest('id')->firstOrFail();
    }

    private function act(InteractiveAttempt $a, string $action, array $extra = [])
    {
        return $this->postJson('/siswa/interaktif/'.$a->id.'/aksi', ['revision' => $a->fresh()->revision, 'action' => $action] + $extra);
    }

    private function commands(InteractiveAttempt $a, array $commands): void
    {
        foreach ($commands as $c) {
            $this->act($a, 'command', ['command' => $c])->assertOk();
        }
    }

    public function test_editor_and_all_interactive_types_can_be_saved_and_rendered(): void
    {
        [$t,$s,$m] = $this->setupActivity();
        $this->actingAs($t)->get('/pengajaran/modul/'.$m->id.'/aktivitas/create')->assertOk()->assertSee('Game seret dan lepas')->assertSee('interactive-editor.js');
        foreach (array_keys(InteractiveDefinition::KINDS) as $kind) {
            $items = $kind === 'sorting' ? "Periksa\nUbah\nUji" : $this->data()['game_items'];
            $this->actingAs($t)->post('/pengajaran/modul/'.$m->id.'/aktivitas', $this->data($kind, ['game_items' => $items]))->assertSessionHasNoErrors()->assertRedirect();
            $a = $m->activities()->reorder()->latest('id')->first();
            $this->assertSame($kind, $a->kind);
            $this->actingAs($s)->get('/siswa/aktivitas/'.$a->id)->assertOk()->assertSee('Mulai aktivitas');
            $attempt = $this->start($s, $a);
            $this->get('/siswa/interaktif/'.$attempt->id)->assertOk()->assertSee('interactive.js')->assertDontSee('"correct"');
        }
    }

    public function test_game_configuration_rejects_ambiguous_empty_or_oversized_items(): void
    {
        [$t,,$m] = $this->setupActivity();
        $this->actingAs($t);
        foreach (["SSH | 22\nSSH | 443", "SSH | 22\nHTTPS | 22", 'SSH |', 'Satu'] as $items) {
            $this->post('/pengajaran/modul/'.$m->id.'/aktivitas', $this->data('matching', ['game_items' => $items]))->assertSessionHasErrors('game_items');
        }
        $this->post('/pengajaran/modul/'.$m->id.'/aktivitas', $this->data('terminal', ['scenario' => 'arbitrary']))->assertSessionHasErrors('scenario');
    }

    public function test_guided_terminal_validates_state_and_records_real_progress(): void
    {
        [, $s,$m,$a] = $this->setupActivity();
        $attempt = $this->start($s, $a);
        $this->commands($attempt, ['apt update', 'apt install openssh-server', 'systemctl enable ssh', 'ssh siswa@192.168.10.2']);
        $this->act($attempt, 'checkpoint')->assertOk()->assertJsonPath('checkpoint.score', 100)->assertJsonPath('checkpoint.passed', true);
        $this->act($attempt, 'submit', ['score' => 0, 'passed' => false])->assertOk()->assertJsonPath('result.passed', true);
        $this->assertSame(100.0, $attempt->fresh()->score);
        $this->assertTrue($attempt->fresh()->passed);
        $this->assertSame('completed', ActivityProgress::where('activity_id', $a->id)->first()->status);
        $p = ModuleProgress::where('module_id', $m->id)->first();
        $this->assertSame('completed', $p->status);
        $this->assertNull($p->quiz_score);
        $this->assertSame(6, $attempt->events()->count());
    }

    public function test_client_cannot_inject_state_score_or_shell_execution(): void
    {
        [, $s,,$a] = $this->setupActivity();
        $attempt = $this->start($s, $a);
        foreach (['cat /etc/passwd', 'touch /tmp/tjkt-should-not-exist', 'apt update; whoami', '$(whoami)', 'echo hi > /tmp/no', 'ls | cat'] as $c) {
            $this->act($attempt, 'command', ['command' => $c, 'state' => ['installed' => true, 'running' => true]])->assertOk();
        }
        $this->assertFalse($attempt->fresh()->state['installed']);
        $this->assertArrayNotHasKey('/etc/passwd', $attempt->fresh()->state['files']);
        $this->act($attempt, 'submit', ['score' => 100, 'passed' => true, 'validator_result' => ['passed' => true]])->assertOk()->assertJsonPath('result.passed', false);
        $this->assertFalse($attempt->fresh()->passed);
    }

    public function test_hardening_requires_key_port_firewall_and_valid_active_config(): void
    {
        [, $s,,$a] = $this->setupActivity('terminal', ['scenario' => 'hardening']);
        $attempt = $this->start($s, $a);
        $this->commands($attempt, ['ssh-keygen -t ed25519', 'ssh-copy-id siswa@192.168.10.2', 'ufw allow 2222/tcp', 'ufw enable']);
        $text = "Port 2222\nPermitRootLogin no\nPubkeyAuthentication yes\nPasswordAuthentication no\nKbdInteractiveAuthentication no\nUsePAM yes";
        $this->act($attempt, 'write', ['content' => $text])->assertOk();
        $this->act($attempt, 'checkpoint')->assertOk()->assertJsonPath('checkpoint.passed', false);
        $this->commands($attempt, ['sshd -t', 'systemctl restart ssh', 'ssh -p 2222 -i ~/.ssh/id_ed25519 siswa@192.168.10.2']);
        $this->act($attempt, 'submit')->assertOk()->assertJsonPath('result.score', 100)->assertJsonPath('result.passed', true);
    }

    public function test_invalid_config_does_not_replace_running_listener_or_pass(): void
    {
        [, $s,,$a] = $this->setupActivity('terminal', ['scenario' => 'hardening', 'passing_score' => 1]);
        $attempt = $this->start($s, $a);
        $this->act($attempt, 'write', ['content' => "Port banana\nPermitRootLogin no"])->assertOk();
        $this->act($attempt, 'command', ['command' => 'systemctl restart ssh'])->assertOk()->assertJsonPath('message', 'Konfigurasi tidak diterapkan: Port harus 1–65535.');
        $this->assertSame(22, $attempt->fresh()->state['active_config']['port']);
        $this->act($attempt, 'submit')->assertOk()->assertJsonPath('result.passed', false);
    }

    public function test_troubleshooting_models_refusal_timeout_and_success(): void
    {
        [, $s,,$a] = $this->setupActivity('terminal', ['scenario' => 'troubleshooting']);
        $attempt = $this->start($s, $a);
        $this->act($attempt, 'command', ['command' => 'ssh siswa@192.168.10.2'])->assertOk()->assertJsonPath('message', 'Connection refused: periksa service dan port listener.');
        $this->act($attempt, 'command', ['command' => 'ssh -p 2222 siswa@192.168.10.2'])->assertOk()->assertJsonPath('message', 'Connection timed out: firewall memblokir port tujuan.');
        $this->commands($attempt, ['ufw allow 2222/tcp', 'ssh -p 2222 siswa@192.168.10.2']);
        $this->act($attempt, 'submit')->assertOk()->assertJsonPath('result.passed', true);
    }

    public function test_terminal_parser_uses_first_value_and_rejects_unsupported_directives(): void
    {
        $engine = app(VirtualTerminal::class);
        $this->assertSame('no', $engine->parse("#PasswordAuthentication yes\nPasswordAuthentication no\nPasswordAuthentication yes")['config']['passwordauthentication']);
        $this->assertArrayHasKey('error', $engine->parse("Port 22\nPort 2222"));
        foreach (['Port 0', 'Port 65536', 'PasswordAuthentication maybe', 'Include /tmp/*', 'Match User root'] as $text) {
            $this->assertArrayHasKey('error', $engine->parse($text));
        }
    }

    public function test_terminal_stopping_service_invalidates_final_objectives(): void
    {
        [, $s,,$a] = $this->setupActivity();
        $attempt = $this->start($s, $a);
        $this->commands($attempt, ['apt update', 'apt install openssh-server', 'ssh siswa@192.168.10.2', 'systemctl stop ssh']);
        $this->act($attempt, 'submit')->assertOk()->assertJsonPath('result.passed', false);
    }

    public function test_matching_and_drag_drop_are_graded_server_side(): void
    {
        foreach (['matching', 'drag_drop'] as $kind) {
            [, $s,,$a] = $this->setupActivity($kind);
            $attempt = $this->start($s, $a);
            $correct = $attempt->snapshot['correct'];
            $this->act($attempt, 'answer', ['answer' => $correct])->assertOk();
            $this->act($attempt, 'submit', ['score' => 0])->assertOk()->assertJsonPath('result.score', 100);
            $this->assertTrue($attempt->fresh()->passed);
        }
    }

    public function test_sorting_grades_positions_and_rejects_duplicates(): void
    {
        [, $s,,$a] = $this->setupActivity('sorting', ['game_items' => "Instal\nKonfigurasi\nUji"]);
        $attempt = $this->start($s, $a);
        $correct = $attempt->snapshot['correct'];
        $this->act($attempt, 'answer', ['answer' => [$correct[0], $correct[0]]])->assertUnprocessable();
        $this->act($attempt, 'answer', ['answer' => array_reverse($correct)])->assertOk();
        $this->act($attempt, 'checkpoint')->assertOk()->assertJsonPath('checkpoint.score', 33.33);
        $this->act($attempt, 'answer', ['answer' => $correct])->assertOk();
        $this->act($attempt, 'submit')->assertOk()->assertJsonPath('result.passed', true);
    }

    public function test_matching_rejects_foreign_keys_and_duplicate_targets(): void
    {
        [, $s,,$a] = $this->setupActivity('matching');
        $attempt = $this->start($s, $a);
        $correct = $attempt->snapshot['correct'];
        $keys = array_keys($correct);
        $values = array_values($correct);
        $this->act($attempt, 'answer', ['answer' => ['unknown' => 'wrong']])->assertUnprocessable();
        $this->act($attempt, 'answer', ['answer' => [$keys[0] => $values[0], $keys[1] => $values[0]]])->assertUnprocessable();
        $this->assertSame([], $attempt->fresh()->state['answer']);
    }

    public function test_network_diagram_validates_topology_service_port_and_auth(): void
    {
        [, $s,,$a] = $this->setupActivity('network', ['scenario' => 'hardening']);
        $attempt = $this->start($s, $a);
        $wrong = ['links' => ['client-server'], 'port' => '22', 'auth' => 'password', 'service' => 'stopped'];
        $this->act($attempt, 'answer', ['answer' => $wrong])->assertOk();
        $this->act($attempt, 'checkpoint')->assertOk()->assertJsonPath('checkpoint.score', 0);
        $right = ['links' => ['client-switch', 'switch-server'], 'port' => '2222', 'auth' => 'key', 'service' => 'running'];
        $this->act($attempt, 'answer', ['answer' => $right])->assertOk();
        $this->act($attempt, 'submit')->assertOk()->assertJsonPath('result.score', 100)->assertJsonPath('result.passed', true);
    }

    public function test_resume_reset_revision_conflict_and_attempt_limits_are_persisted(): void
    {
        [, $s,,$a] = $this->setupActivity();
        $attempt = $this->start($s, $a);
        $this->commands($attempt, ['apt update']);
        $this->assertSame($attempt->id, $this->start($s, $a)->id);
        $this->assertTrue($attempt->fresh()->state['updated']);
        $this->postJson('/siswa/interaktif/'.$attempt->id.'/aksi', ['revision' => 0, 'action' => 'reset'])->assertConflict();
        for ($i = 0; $i < 3; $i++) {
            $this->act($attempt, 'reset')->assertOk();
        }$this->act($attempt, 'reset')->assertUnprocessable();
        $this->assertFalse($attempt->fresh()->state['updated']);
        $this->act($attempt, 'submit')->assertOk();
        $second = $this->start($s, $a);
        $this->assertSame(2, $second->attempt_number);
        $this->act($second, 'submit')->assertOk();
        $this->post('/siswa/interaktif/aktivitas/'.$a->id.'/mulai')->assertSessionHasErrors('attempt');
    }

    public function test_late_actions_ignored_and_expiry_commits_before_quota_error(): void
    {
        [, $s,,$a] = $this->setupActivity('matching', ['max_attempts' => 1, 'duration_minutes' => 1]);
        $attempt = $this->start($s, $a);
        $deadline = $attempt->expires_at;
        $this->travel(2)->minutes();
        $this->post('/siswa/interaktif/aktivitas/'.$a->id.'/mulai')->assertSessionHasErrors('attempt');
        $this->assertSame('expired', $attempt->fresh()->status);
        $this->assertTrue($attempt->fresh()->finished_at->equalTo($deadline));
        $this->assertSame(0.0, $attempt->fresh()->score);
        $this->act($attempt, 'answer', ['answer' => $attempt->snapshot['correct']])->assertOk();
        $this->assertSame(0.0, $attempt->fresh()->score);
        $this->travelBack();
    }

    public function test_saved_answers_expire_through_existing_command(): void
    {
        [, $s,,$a] = $this->setupActivity('matching', ['duration_minutes' => 1]);
        $attempt = $this->start($s, $a);
        $this->act($attempt, 'answer', ['answer' => $attempt->snapshot['correct']])->assertOk();
        $this->travel(2)->minutes();
        $this->artisan('learning:expire-attempts')->assertSuccessful();
        $this->assertSame('expired', $attempt->fresh()->status);
        $this->assertSame(100.0, $attempt->fresh()->score);
        $this->travelBack();
    }

    public function test_snapshots_stay_immutable_and_kind_change_is_forbidden(): void
    {
        [$t,$s,$m,$a] = $this->setupActivity('matching');
        $attempt = $this->start($s, $a);
        $old = $attempt->snapshot;
        app(ActivityService::class)->save($t, $m, $this->data('matching', ['game_items' => "Autre | Nouveau\nSecond | Final"]), $a);
        $this->assertSame($old, $attempt->fresh()->snapshot);
        $this->assertNotSame($a->fresh()->current_version_id, $attempt->activity_version_id);
        $this->actingAs($t)->put('/pengajaran/modul/'.$m->id.'/aktivitas/'.$a->id, $this->data('network'))->assertSessionHasErrors('kind');
    }

    public function test_student_idor_inactive_publishing_and_old_results_are_protected(): void
    {
        [$t,$s,$m,$a] = $this->setupActivity();
        $attempt = $this->start($s, $a);
        $other = $this->user('siswa');
        $this->actingAs($other)->get('/siswa/interaktif/'.$attempt->id)->assertForbidden();
        $this->act($attempt, 'submit')->assertForbidden();
        $this->actingAs($s);
        $a->update(['is_published' => false]);
        $this->get('/siswa/interaktif/'.$attempt->id)->assertForbidden();
        $this->act($attempt, 'command', ['command' => 'help'])->assertForbidden();
        $a->update(['is_published' => true]);
        $this->act($attempt, 'submit')->assertOk();
        $a->delete();
        $m->update(['status' => 'unpublished']);
        $this->get('/siswa/interaktif/'.$attempt->id)->assertOk();
        $s->update(['is_active' => false]);
        $this->get('/siswa/interaktif/'.$attempt->id)->assertRedirect('/login');
    }

    public function test_teachers_can_only_review_assigned_students_and_export_has_no_keys(): void
    {
        [$t,$s,$m,$a] = $this->setupActivity('matching');
        $attempt = $this->start($s, $a);
        $this->act($attempt, 'answer', ['answer' => $attempt->snapshot['correct']]);
        $this->act($attempt, 'submit');
        $this->actingAs($t)->get('/pengajaran/monitoring/'.$s->id.'/'.$m->id)->assertOk()->assertSee('Riwayat lab dan game interaktif');
        $this->get('/pengajaran/interaktif/'.$attempt->id)->assertOk()->assertSee('Jejak interaksi');
        $res = $this->get('/pengajaran/monitoring/ekspor?format=interactive')->assertOk()->assertDownload();
        $path = $res->baseResponse->getFile()->getPathname();
        $z = new \ZipArchive;
        $z->open($path);
        $xml = $z->getFromName('xl/worksheets/sheet1.xml');
        $z->close();
        $this->assertStringContainsString('100', $xml);
        $this->assertStringNotContainsString(array_values($attempt->snapshot['correct'])[0], $xml);
        unlink($path);
        $this->actingAs($this->user('guru'))->get('/pengajaran/interaktif/'.$attempt->id)->assertForbidden();
    }

    public function test_lab_prerequisite_uses_all_required_published_terminal_completions(): void
    {
        [$t,$s,$m,$a] = $this->setupActivity();
        $next = $this->course($t, $s);
        ModulePrerequisite::create(['module_id' => $next->id, 'required_module_id' => $m->id, 'type' => 'lab_completed']);
        $this->assertNotEmpty(app(LearningAccessService::class)->reasons($s, $next));
        $attempt = $this->start($s, $a);
        $this->commands($attempt, ['apt update', 'apt install openssh-server', 'ssh siswa@192.168.10.2']);
        $this->act($attempt, 'submit')->assertOk();
        $this->assertSame([], app(LearningAccessService::class)->reasons($s, $next));
        $this->activity($t, $m, 'terminal', ['title' => 'Lab tambahan']);
        $this->assertNotEmpty(app(LearningAccessService::class)->reasons($s, $next));
    }

    public function test_golden_module_is_complete_draft_idempotent_and_not_assigned(): void
    {
        $t = $this->user('guru');
        $this->actingAs($t)->post('/pengajaran/template-ssh')->assertSessionHasNoErrors()->assertRedirect();
        $m = Module::where('code', 'SSH12-'.$t->id)->firstOrFail();
        $this->assertSame('draft', $m->status);
        $this->assertSame(13, $m->sections()->count());
        $this->assertSame(22, $m->activities()->count());
        $this->assertFalse($m->activities()->where('kind', 'practice')->firstOrFail()->is_published);
        $this->assertSame(0, $m->rombels()->count());
        $this->assertSame(3, $m->activities()->where('kind', 'terminal')->count());
        $this->assertSame($m->id, app(SshGoldenModule::class)->create($t)->id);
        $this->assertSame(1, Module::where('code', $m->code)->count());
        $this->get('/pengajaran/modul/'.$m->id.'/edit')->assertOk();
        $this->actingAs($this->user('siswa'))->post('/pengajaran/template-ssh')->assertForbidden();
    }

    public function test_weighted_interactive_progress_excludes_optional_games_and_quiz_grade(): void
    {
        [$teacher,$student,$module,$activity] = $this->setupActivity('matching', ['progress_weight' => 3]);
        $second = $this->activity($teacher, $module, 'sorting', ['game_items' => "Instal\nUji", 'progress_weight' => 1]);
        $this->activity($teacher, $module, 'network', ['is_required' => false, 'progress_weight' => 100]);
        $attempt = $this->start($student, $activity);
        $this->act($attempt, 'answer', ['answer' => $attempt->snapshot['correct']])->assertOk();
        $this->act($attempt, 'submit')->assertOk();
        $progress = ModuleProgress::where('user_id', $student->id)->where('module_id', $module->id)->first();
        $this->assertEquals(75, $progress->completion_percent);
        $this->assertSame(2, $progress->required_items);
        $this->assertNull($progress->quiz_score);
        $next = $this->start($student, $second);
        $this->act($next, 'answer', ['answer' => $next->snapshot['correct']])->assertOk();
        $this->act($next, 'submit')->assertOk();
        $this->assertSame('completed', $progress->fresh()->status);
    }

    public function test_student_progress_expires_saved_game_before_rendering_summary(): void
    {
        [, $student,$module,$activity] = $this->setupActivity('matching', ['duration_minutes' => 1]);
        $attempt = $this->start($student, $activity);
        $this->act($attempt, 'answer', ['answer' => $attempt->snapshot['correct']])->assertOk();
        $this->travel(2)->minutes();
        $this->get('/siswa/progres')->assertOk()->assertSee('Riwayat lab dan game saya')->assertViewHas('snapshots', fn ($rows) => $rows->get($module->id)->status === 'completed');
        $this->assertSame('expired', $attempt->fresh()->status);
        $this->travelBack();
    }

    public function test_invalid_virtual_config_prevents_install_from_starting_service(): void
    {
        [, $student,,$activity] = $this->setupActivity();
        $attempt = $this->start($student, $activity);
        $this->act($attempt, 'write', ['content' => 'Port invalid'])->assertOk();
        $this->commands($attempt, ['apt update', 'apt install openssh-server', 'ss -tlnp']);
        $state = $attempt->fresh()->state;
        $this->assertTrue($state['installed']);
        $this->assertFalse($state['running']);
        $this->assertNull($state['active_config']);
        $this->act($attempt, 'submit')->assertOk()->assertJsonPath('result.passed', false);
    }

    public function test_structured_terminal_arguments_preserve_validation_and_virtual_state(): void
    {
        [, $student,,$activity] = $this->setupActivity();
        $attempt = $this->start($student, $activity);
        foreach ([['apt', 'update'], ['apt', 'install', 'openssh-server'], ['ssh', 'siswa@192.168.10.2']] as $argv) {
            $this->act($attempt, 'command', ['argv' => $argv])->assertOk();
        }
        $this->assertTrue($attempt->fresh()->state['tested']);
        $this->act($attempt, 'command', ['argv' => [['nested']]])->assertUnprocessable();
        $this->act($attempt, 'command', ['argv' => ['echo', ';', 'whoami']])->assertOk()->assertJsonPath('message', 'Operator shell tidak didukung. Jalankan satu perintah virtual.');
        $this->act($attempt, 'submit')->assertOk()->assertJsonPath('result.passed', true);
    }

    public function test_no_quiz_route_can_start_terminal_and_submissions_are_idempotent(): void
    {
        [, $s,,$a] = $this->setupActivity();
        $this->actingAs($s)->post('/siswa/aktivitas/'.$a->id.'/mulai')->assertUnprocessable();
        $attempt = $this->start($s, $a);
        $this->act($attempt, 'submit')->assertOk();
        $score = $attempt->fresh()->score;
        $events = $attempt->events()->count();
        $this->act($attempt, 'submit')->assertOk();
        $this->assertSame($score, $attempt->fresh()->score);
        $this->assertSame($events, $attempt->events()->count());
    }

    public function test_game_library_preview_is_authorized_and_does_not_write_student_progress(): void
    {
        [$teacher, $student, $module, $activity] = $this->setupActivity('game');
        $attempts = InteractiveAttempt::count();
        $progress = ActivityProgress::count();
        $url = '/pengajaran/modul/'.$module->id.'/aktivitas/'.$activity->id.'/pratinjau';
        $this->actingAs($student)->get($url)->assertForbidden();
        $this->actingAs($this->user('guru'))->get($url)->assertForbidden();
        $this->actingAs($teacher)->get($url)->assertOk()->assertSee('Pratinjau guru')->assertSee('game-templates.js');
        $this->postJson($url, ['action' => 'checkpoint', 'revision' => 0])->assertOk()->assertJsonPath('checkpoint.score', 0);
        $this->postJson($url, ['action' => 'checkpoint', 'revision' => 0])->assertConflict();
        $this->postJson($url, ['action' => 'submit', 'revision' => 1, 'score' => 100])->assertOk()->assertJsonPath('checkpoint.score', 0);
        $this->assertSame($attempts, InteractiveAttempt::count());
        $this->assertSame($progress, ActivityProgress::count());
    }

    public function test_all_new_game_templates_save_render_and_grade_on_server(): void
    {
        foreach (['memory', 'categorize', 'word_search', 'maze', 'sudoku'] as $template) {
            [$teacher, $student, $module, $activity] = $this->setupActivity('game', ['game_template' => $template, 'game_items' => GameTemplates::CATALOG[$template][2]]);
            $this->actingAs($teacher)->get('/pengajaran/modul/'.$module->id.'/aktivitas/'.$activity->id.'/edit')->assertOk()->assertSee('Pustaka template game');
            $attempt = $this->start($student, $activity);
            $this->get('/siswa/interaktif/'.$attempt->id)->assertOk()->assertDontSee('correct_choice')->assertDontSee('"solution"')->assertDontSee('"positions"');
            $c = $attempt->snapshot;
            $public = app(InteractiveDefinition::class)->publicConfig($c);
            $this->assertArrayNotHasKey('source_items', $public);
            $this->act($attempt, 'answer', ['answer' => ['score' => 100]])->assertUnprocessable();
            if ($template === 'memory') {
                $this->assertSame([], $public['items']);
                $this->assertSame([], app(InteractiveService::class)->response($attempt)['state']['revealed']);
                foreach ($c['items'] as $item) {
                    foreach ($c['cards'] as $card) {
                        if ($card['pair'] === $item['key']) {
                            $this->act($attempt, 'play', ['input' => ['key' => $card['key']]])->assertOk();
                        }
                    }
                }
            } elseif ($template === 'categorize') {
                foreach ($c['items'] as $item) {
                    $this->act($attempt, 'play', ['input' => ['key' => $item['key'], 'target' => $item['target']]])->assertOk();
                }
            } elseif ($template === 'word_search') {
                foreach ($c['positions'] as [$start, $end]) {
                    $this->act($attempt, 'play', ['input' => ['start' => $start, 'end' => $end]])->assertOk();
                }
            } elseif ($template === 'sudoku') {
                $this->assertSame(1, app(GameTemplates::class)->solutions($c['givens']));
                foreach ($c['solution'] as $index => $value) {
                    if (! $c['givens'][$index]) {
                        $this->act($attempt, 'play', ['input' => ['cell' => $index, 'value' => $value]])->assertOk();
                    }
                }
            } else {
                $this->act($attempt, 'play', ['input' => ['direction' => 'down']])->assertUnprocessable();
                $this->act($attempt, 'play', ['input' => ['position' => 62]])->assertUnprocessable();
                // Walk the complete connected path, resolving each mission at its location.
                $path = [];
                for ($row = 0; $row < 7; $row++) {
                    $cols = $row % 4 === 2 ? array_reverse(range(0, 8)) : range(0, 8);
                    foreach ($cols as $col) {
                        if ($c['map'][$row][$col] === '.') {
                            $path[] = $row * 9 + $col;
                        }
                    }
                }
                $position = 0;
                foreach (array_slice($path, 1) as $next) {
                    $direction = [1 => 'right', -1 => 'left', 9 => 'down'][$next - $position];
                    $this->act($attempt, 'play', ['input' => ['direction' => $direction]])->assertOk();
                    $position = $next;
                    if (isset($c['missions'][$position])) {
                        $item = collect($c['items'])->firstWhere('key', $c['missions'][$position]);
                        $this->act($attempt, 'play', ['input' => ['choice' => $item['correct_choice']]])->assertOk();
                    }
                }
            }
            $this->act($attempt, 'submit', ['score' => 0])->assertOk()->assertJsonPath('result.score', 100)->assertJsonPath('result.passed', true);
            $this->assertSame('completed', ActivityProgress::where('activity_id', $activity->id)->firstOrFail()->status);
        }
    }

    public function test_game_snapshot_is_immutable_after_teacher_changes_template_and_invalid_inputs_fail(): void
    {
        [$teacher, $student, $module, $activity] = $this->setupActivity('game');
        $attempt = $this->start($student, $activity);
        $snapshot = $attempt->snapshot;
        app(ActivityService::class)->save($teacher, $module, $this->data('game', ['game_template' => 'sudoku', 'game_items' => "A\nB\nC\nD"]), $activity);
        $this->assertSame($snapshot, $attempt->fresh()->snapshot);
        $this->act($attempt, 'play', ['input' => ['key' => ['nested']]])->assertUnprocessable();
        $this->act($attempt, 'submit', ['state' => ['matched' => array_column($snapshot['items'], 'key')], 'score' => 100])->assertOk()->assertJsonPath('result.score', 0);
        $this->actingAs($teacher);
        foreach ([['sudoku', "A\nB"], ['word_search', "DUA KATA | clue\nOK | clue"], ['maze', "Q | A | A | B\nQ2 | X | Y | Z"], ['categorize', "A | Sama\nB | Sama"]] as [$template, $items]) {
            $this->post('/pengajaran/modul/'.$module->id.'/aktivitas', $this->data('game', ['game_template' => $template, 'game_items' => $items]))->assertSessionHasErrors('game_items');
        }
    }

    public function test_structured_game_rows_validate_and_compile_without_raw_command_like_text(): void
    {
        [$teacher, , $module] = $this->setupActivity();
        $data = $this->data('game', ['game_template' => 'memory']);
        unset($data['game_items']);
        $data['game_rows'] = [['SSH', 'TCP 22'], ['HTTPS', 'TCP 443']];
        $this->actingAs($teacher)->post('/pengajaran/modul/'.$module->id.'/aktivitas', $data)->assertSessionHasNoErrors()->assertRedirect();
        $activity = $module->activities()->reorder()->latest('id')->firstOrFail();
        $this->assertSame("SSH | TCP 22\nHTTPS | TCP 443", $activity->currentVersion->definition['source_items']);
        $data['game_rows'] = [[['nested'], 'x'], ['Y', 'Z']];
        $this->post('/pengajaran/modul/'.$module->id.'/aktivitas', $data)->assertSessionHasErrors('game_rows.0.0');
        $data['game_rows'] = [['SSH', 'TCP 22'], ['HTTPS', 'TCP 22']];
        $this->post('/pengajaran/modul/'.$module->id.'/aktivitas', $data)->assertSessionHasErrors('game_items');
    }

    public function test_generated_puzzles_are_valid_across_difficulties(): void
    {
        $games = app(GameTemplates::class);
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 5) as $iteration) {
                $definition = app(InteractiveDefinition::class)->compile($this->data('game', ['game_template' => 'sudoku', 'game_difficulty' => $difficulty, 'game_items' => "A\nB\nC\nD"]));
                $snapshot = app(InteractiveDefinition::class)->snapshot($definition);
                $this->assertSame(1, $games->solutions($snapshot['givens']));
                for ($row = 0; $row < 4; $row++) {
                    $this->assertCount(4, array_unique(array_slice($snapshot['solution'], $row * 4, 4)));
                    $this->assertCount(4, array_unique(array_map(fn ($i) => $snapshot['solution'][$i * 4 + $row], range(0, 3))));
                }
            }
            $definition = app(InteractiveDefinition::class)->compile($this->data('game', ['game_template' => 'word_search', 'game_difficulty' => $difficulty, 'game_items' => GameTemplates::CATALOG['word_search'][2]]));
            $snapshot = app(InteractiveDefinition::class)->snapshot($definition);
            foreach ($snapshot['items'] as $item) {
                [$start, $end] = $snapshot['positions'][$item['key']];
                $step = intdiv($start, 12) === intdiv($end, 12) ? 1 : 12;
                $word = '';
                for ($i = $start; $i <= $end; $i += $step) {
                    $word .= $snapshot['grid'][$i];
                }
                $this->assertContains($word, [$item['label'], strrev($item['label'])]);
            }
        }
    }
}
