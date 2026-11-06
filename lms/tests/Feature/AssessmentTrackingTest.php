<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\LearningEvent;
use App\Models\LearningSession;
use App\Models\Module;
use App\Models\ModuleProgress;
use App\Models\ModuleSection;
use App\Models\Question;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\Rombel;
use App\Models\User;
use App\Services\ActivityService;
use App\Services\QuestionService;
use App\Services\QuizScorer;
use App\Services\QuizService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AssessmentTrackingTest extends TestCase
{
    use DatabaseTransactions;

    private array $files = [];

    private function user(string $role = 'admin', string $name = 'Pengguna Asesmen'): User
    {
        return User::create(['name' => $name, 'username' => 'assess_'.bin2hex(random_bytes(5)), 'role' => $role, 'is_active' => true, 'must_change_password' => false, 'password' => 'PasswordUji2026!']);
    }

    private function course(User $author, User $student): array
    {
        $rombel = Rombel::create(['name' => 'X Asesmen '.bin2hex(random_bytes(4)), 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true]);
        $rombel->students()->attach($student->id, ['joined_at' => now()]);
        $rombel->teachers()->attach($author->id);
        $module = Module::create(['created_by' => $author->id, 'code' => 'ASM-'.bin2hex(random_bytes(5)), 'title' => 'Modul Asesmen', 'status' => 'published', 'published_at' => now(), 'grade' => 10]);
        $module->rombels()->attach($rombel->id);

        return [$module, $rombel];
    }

    private function questionData(string $type = 'single', array $extra = []): array
    {
        return array_merge(['type' => $type, 'prompt' => 'Pilih layanan SSH yang benar.', 'scenario' => $type === 'scenario' ? 'Administrator memeriksa koneksi server Debian.' : null, 'explanation' => 'PEMBAHASAN_RAHASIA_JANGAN_BOCOR', 'points' => 1, 'is_shared' => 0, 'accepted_answers' => "RAHASIA_JAWABAN_SINGKAT\nsecure shell", 'case_sensitive' => 0, 'boolean_answer' => 'true', 'options' => [['label' => 'SSH', 'is_correct' => 1, 'target' => 'Port 22'], ['label' => 'HTTP', 'is_correct' => 0, 'target' => 'Port 80']]], $extra);
    }

    private function question(User $author, string $type = 'single', array $extra = []): Question
    {
        return app(QuestionService::class)->save($author, $this->questionData($type, $extra));
    }

    private function activity(User $author, Module $module, array $questions, array $extra = []): Activity
    {
        return app(ActivityService::class)->save($author, $module, array_merge(['title' => 'Asesmen jaringan', 'kind' => 'quiz', 'instructions' => 'Kerjakan sesuai pemahaman Anda.', 'module_section_id' => null, 'is_published' => 1, 'is_required' => 1, 'progress_weight' => 1, 'sort_order' => 10, 'passing_score' => 75, 'max_attempts' => 2, 'duration_minutes' => 5, 'question_count' => count($questions), 'random_questions' => 1, 'shuffle_options' => 1, 'min_active_seconds' => 0, 'question_ids' => array_map(fn ($q) => $q->id, $questions)], $extra));
    }

    private function correctAnswers(QuizAttempt $attempt): array
    {
        $answers = [];
        foreach ($attempt->snapshot['questions'] as $q) {
            $answers[$q['key']] = $q['type'] === 'short' ? $q['correct']['accepted'][0] : $q['correct'];
        }

        return $answers;
    }

    private function section(Module $m, array $extra = []): ModuleSection
    {
        return $m->sections()->create(array_merge(['title' => 'Bacaan jaringan', 'kind' => 'theory', 'content' => 'Konsep SSH dan port jaringan.', 'is_published' => true, 'is_required' => true, 'progress_weight' => 3, 'sort_order' => 1], $extra));
    }

    protected function tearDown(): void
    {
        foreach ($this->files as $path) {
            if (is_file($path)) {
                unlink($path);
            }
        }parent::tearDown();
    }

    public function test_staff_pages_and_activity_editor_render_with_specific_configuration(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $q = $this->question($a);
        $activity = $this->activity($a, $m, [$q]);
        $this->actingAs($a);
        foreach (['/pengajaran/bank-soal', '/pengajaran/bank-soal/create', '/pengajaran/bank-soal/'.$q->id.'/edit', '/pengajaran/modul/'.$m->id.'/aktivitas', '/pengajaran/modul/'.$m->id.'/aktivitas/create', '/pengajaran/modul/'.$m->id.'/aktivitas/'.$activity->id.'/edit', '/pengajaran/monitoring'] as $url) {
            $this->get($url)->assertOk();
        }$this->get('/pengajaran/modul/'.$m->id.'/edit')->assertOk()->assertSee('Kelola checkpoint dan kuis');
    }

    public function test_question_editor_validates_all_seven_types_and_ownership(): void
    {
        $a = $this->user('guru');
        $this->actingAs($a);
        foreach (array_keys(Question::TYPES) as $type) {
            $this->post('/pengajaran/bank-soal', $this->questionData($type))->assertSessionHasNoErrors()->assertRedirect();
        }$this->assertSame(7, Question::count());
        $bad = $this->questionData('single');
        $bad['options'][1]['is_correct'] = 1;
        $this->post('/pengajaran/bank-soal', $bad)->assertSessionHasErrors('options');
        $q = Question::first();
        $other = $this->user('guru');
        $this->actingAs($other)->get('/pengajaran/bank-soal/'.$q->id.'/edit')->assertForbidden();
        $this->actingAs($this->user('siswa'))->get('/pengajaran/bank-soal')->assertForbidden();
    }

    public function test_student_sees_no_answer_keys_and_server_grades_every_question_type(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $questions = array_map(fn ($type) => $this->question($a, $type), array_keys(Question::TYPES));
        $activity = $this->activity($a, $m, $questions);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai')->assertRedirect();
        $attempt = QuizAttempt::firstOrFail();
        $this->get('/siswa/percobaan/'.$attempt->id)->assertOk()->assertDontSee('PEMBAHASAN_RAHASIA_JANGAN_BOCOR')->assertDontSee('RAHASIA_JAWABAN_SINGKAT')->assertDontSee('answer_config');
        foreach ($attempt->snapshot['questions'] as $q) {
            $public = app(QuizService::class)->publicQuestion($q);
            $this->assertArrayNotHasKey('correct', $public);
            $this->assertArrayNotHasKey('explanation', $public);
        }
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt), 'score' => 0, 'passed' => false])->assertRedirect();
        $this->assertSame(100.0, $attempt->fresh()->score);
        $this->assertTrue($attempt->fresh()->passed);
        $this->assertSame(7, QuizAnswer::where('quiz_attempt_id', $attempt->id)->where('is_correct', true)->count());
        $this->assertSame(100.0, ModuleProgress::first()->completion_percent);
        $this->assertSame(100.0, ModuleProgress::first()->quiz_score);
        $this->get('/siswa/percobaan/'.$attempt->id)->assertOk()->assertDontSee('PEMBAHASAN_RAHASIA_JANGAN_BOCOR');
    }

    public function test_forged_grade_is_ignored_and_all_or_nothing_answers_are_checked(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $q = $this->question($a, 'multiple', ['options' => [['label' => 'SSH', 'is_correct' => 1], ['label' => 'SFTP', 'is_correct' => 1], ['label' => 'HTTP', 'is_correct' => 0]]]);
        $activity = $this->activity($a, $m, [$q]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $question = $attempt->snapshot['questions'][0];
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => [$question['key'] => [$question['correct'][0]]], 'score' => 100, 'passed' => true])->assertRedirect();
        $this->assertSame(0.0, $attempt->fresh()->score);
        $this->assertFalse($attempt->fresh()->passed);
        $this->assertSame(0.0, ModuleProgress::first()->completion_percent);
    }

    public function test_autosave_resume_clear_all_choices_and_submit_are_idempotent(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a, 'multiple')]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->post('/siswa/percobaan/'.$attempt->id.'/simpan', ['answers' => $this->correctAnswers($attempt)])->assertOk()->assertJsonPath('status', 'in_progress');
        $this->post('/siswa/aktivitas/'.$activity->id.'/mulai')->assertRedirect('/siswa/percobaan/'.$attempt->id);
        $this->assertSame(1, QuizAttempt::count());
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => []])->assertRedirect();
        $this->assertSame(0.0, $attempt->fresh()->score);
        $events = LearningEvent::where('event', 'quiz.submitted')->count();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)])->assertRedirect();
        $this->assertSame(0.0, $attempt->fresh()->score);
        $this->assertSame($events, LearningEvent::where('event', 'quiz.submitted')->count());
    }

    public function test_deadline_grades_only_saved_answers_and_rejects_late_changes(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a)], ['duration_minutes' => 1]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->travel(61)->seconds();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)])->assertRedirect();
        $this->assertSame('expired', $attempt->fresh()->status);
        $this->assertSame(0.0, $attempt->fresh()->score);
        $this->travelBack();
        $this->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $second = QuizAttempt::latest('id')->first();
        $this->post('/siswa/percobaan/'.$second->id.'/simpan', ['answers' => $this->correctAnswers($second)])->assertOk();
        $this->travel(61)->seconds();
        $this->get('/siswa/percobaan/'.$second->id)->assertOk();
        $this->assertSame('expired', $second->fresh()->status);
        $this->assertSame(100.0, $second->fresh()->score);
        $this->travelBack();
    }

    public function test_expired_attempt_commits_grading_even_when_new_attempt_quota_is_exhausted(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a)], ['duration_minutes' => 1, 'max_attempts' => 1]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->post('/siswa/percobaan/'.$attempt->id.'/simpan', ['answers' => $this->correctAnswers($attempt)]);
        $this->travel(61)->seconds();
        $this->post('/siswa/aktivitas/'.$activity->id.'/mulai')->assertSessionHasErrors('attempt');
        $this->assertSame('expired', $attempt->fresh()->status);
        $this->assertSame(100.0, $attempt->fresh()->score);
        $this->assertSame(1, QuizAttempt::count());
        $this->travelBack();
    }

    public function test_activity_versions_preserve_existing_attempts_after_question_edits(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $q = $this->question($a);
        $activity = $this->activity($a, $m, [$q]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $old = $this->correctAnswers($attempt);
        app(QuestionService::class)->save($a, $this->questionData('single', ['prompt' => 'Soal yang berubah', 'options' => [['label' => 'SSH', 'is_correct' => 0], ['label' => 'HTTP', 'is_correct' => 1]]]), $q);
        app(ActivityService::class)->save($a, $m, array_merge($activity->only(['title', 'kind', 'instructions', 'module_section_id', 'is_published', 'is_required', 'progress_weight', 'sort_order']), $activity->currentVersion->definition, ['question_ids' => [$q->id]]), $activity);
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $old])->assertRedirect();
        $this->assertSame(100.0, $attempt->fresh()->score);
        $this->assertSame('Pilih layanan SSH yang benar.', $attempt->fresh()->snapshot['questions'][0]['prompt']);
    }

    public function test_reading_credits_only_server_elapsed_time_and_never_completes_on_page_open(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $section = $this->section($m);
        $this->actingAs($s)->get('/siswa/materi/'.$m->id.'/submateri/'.$section->id)->assertOk()->assertSee('Menyiapkan sesi belajar');
        $this->assertSame(0, LearningSession::count());
        $response = $this->postJson('/siswa/baca/'.$section->id.'/mulai')->assertOk();
        $id = $response->json('session_id');
        $this->postJson('/siswa/baca/sesi/'.$id, ['active_seconds' => 99999])->assertOk()->assertJsonPath('active_seconds', 0);
        $this->travel(20)->seconds();
        $this->postJson('/siswa/baca/sesi/'.$id, ['active_seconds' => 99999])->assertOk()->assertJsonPath('active_seconds', 20);
        $this->travel(120)->seconds();
        $this->postJson('/siswa/baca/sesi/'.$id)->assertOk()->assertJsonPath('active_seconds', 20);
        $this->assertSame(0.0, ModuleProgress::first()->completion_percent);
        $this->assertSame(0, ActivityProgress::count());
        $this->travelBack();
    }

    public function test_reading_session_prevents_double_tabs_and_cross_user_heartbeats(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $section = $this->section($m);
        $this->actingAs($s);
        $first = $this->postJson('/siswa/baca/'.$section->id.'/mulai')->json('session_id');
        $second = $this->postJson('/siswa/baca/'.$section->id.'/mulai')->json('session_id');
        $this->postJson('/siswa/baca/sesi/'.$first)->assertStatus(409);
        $this->actingAs($this->user('siswa'))->postJson('/siswa/baca/sesi/'.$second)->assertForbidden();
    }

    public function test_checkpoint_reading_weight_and_quiz_grade_are_separate(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $section = $this->section($m);
        $question = $this->question($a);
        $checkpoint = $this->activity($a, $m, [$question], ['kind' => 'checkpoint', 'module_section_id' => $section->id, 'min_active_seconds' => 20, 'passing_score' => 100]);
        $quiz = $this->activity($a, $m, [$question], ['progress_weight' => 1]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$checkpoint->id.'/mulai')->assertSessionHasErrors('attempt');
        $id = $this->postJson('/siswa/baca/'.$section->id.'/mulai')->json('session_id');
        $this->travel(20)->seconds();
        $this->postJson('/siswa/baca/sesi/'.$id);
        $this->post('/siswa/aktivitas/'.$checkpoint->id.'/mulai')->assertRedirect();
        $attempt = QuizAttempt::first();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)]);
        $this->assertSame(75.0, ModuleProgress::first()->completion_percent);
        $this->assertNull(ModuleProgress::first()->quiz_score);
        $this->post('/siswa/aktivitas/'.$quiz->id.'/mulai');
        $attempt = QuizAttempt::latest('id')->first();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)]);
        $this->assertSame(100.0, ModuleProgress::first()->completion_percent);
        $this->assertSame(100.0, ModuleProgress::first()->quiz_score);
        $this->assertSame('completed', ModuleProgress::first()->status);
        $this->travelBack();
    }

    public function test_automatic_module_progress_unlocks_phase_three_prerequisites(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$source,$r] = $this->course($a, $s);
        $activity = $this->activity($a, $source, [$this->question($a)]);
        $target = Module::create(['created_by' => $a->id, 'code' => 'NEXT-'.bin2hex(random_bytes(4)), 'title' => 'Materi Lanjutan', 'status' => 'published']);
        $target->rombels()->attach($r->id);
        $target->prerequisites()->create(['required_module_id' => $source->id, 'type' => 'module_completed']);
        $target->prerequisites()->create(['required_module_id' => $source->id, 'type' => 'quiz_score', 'min_score' => 90]);
        $section = $this->section($target);
        $this->actingAs($s)->get('/siswa/materi/'.$target->id.'/submateri/'.$section->id)->assertForbidden();
        $this->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)]);
        $this->get('/siswa/materi/'.$target->id.'/submateri/'.$section->id)->assertOk();
    }

    public function test_student_cannot_access_another_attempt_or_inject_unknown_answers(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a)]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->postJson('/siswa/percobaan/'.$attempt->id.'/simpan', ['answers' => ['injected' => 'secret']])->assertUnprocessable();
        $this->assertSame(0, QuizAnswer::count());
        $this->actingAs($this->user('siswa'))->get('/siswa/percobaan/'.$attempt->id)->assertForbidden();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)])->assertForbidden();
        $this->postJson('/siswa/percobaan/'.$attempt->id.'/simpan', ['answers' => []])->assertForbidden();
    }

    public function test_teacher_reports_are_scoped_and_export_contains_only_allowed_students(): void
    {
        $teacher = $this->user('guru');
        $own = $this->user('siswa', 'Siswa Diampu');
        [$m] = $this->course($teacher, $own);
        $otherTeacher = $this->user('guru');
        $outside = $this->user('siswa', 'Siswa Luar Rahasia');
        [$other] = $this->course($otherTeacher, $outside);
        $this->actingAs($teacher)->get('/pengajaran/monitoring')->assertOk()->assertSee('Siswa Diampu')->assertDontSee('Siswa Luar Rahasia');
        $this->get('/pengajaran/monitoring/'.$outside->id.'/'.$other->id)->assertForbidden();
        $this->get('/pengajaran/monitoring/'.$own->id.'/'.$m->id)->assertOk();
        $res = $this->get('/pengajaran/monitoring/ekspor')->assertOk()->assertDownload();
        $path = $res->baseResponse->getFile()->getPathname();
        $this->files[] = $path;
        $zip = new \ZipArchive;
        $zip->open($path);
        $xml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();
        $this->assertStringContainsString('Siswa Diampu', $xml);
        $this->assertStringNotContainsString('Siswa Luar Rahasia', $xml);
        $this->actingAs($own)->get('/pengajaran/monitoring')->assertForbidden();
        $this->get('/pengajaran/monitoring/ekspor')->assertForbidden();
    }

    public function test_published_activity_config_and_bank_scope_are_enforced(): void
    {
        $t = $this->user('guru');
        $s = $this->user('siswa');
        [$m] = $this->course($t, $s);
        $private = $this->question($this->user('guru'));
        $data = ['title' => 'Kuis baru', 'kind' => 'quiz', 'is_published' => 1, 'is_required' => 1, 'progress_weight' => 1, 'sort_order' => 0, 'passing_score' => 75, 'max_attempts' => 2, 'duration_minutes' => 5, 'question_count' => 1, 'random_questions' => 1, 'shuffle_options' => 1, 'min_active_seconds' => 0, 'question_ids' => [$private->id]];
        $this->actingAs($t)->post('/pengajaran/modul/'.$m->id.'/aktivitas', $data)->assertSessionHasErrors('question_ids');
        $data['question_ids'] = [];
        $this->post('/pengajaran/modul/'.$m->id.'/aktivitas', $data)->assertSessionHasErrors('question_count');
        $this->assertSame(0, Activity::count());
    }

    public function test_curriculum_change_recalculates_completion_without_erasing_history(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a)]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)]);
        $first = ModuleProgress::first()->first_completed_at;
        $this->activity($a, $m, [$this->question($a)]);
        $row = ModuleProgress::first();
        $this->assertSame(50.0, $row->completion_percent);
        $this->assertTrue($row->first_completed_at->equalTo($first));
        $this->assertNull($row->completed_at);
        $this->assertSame(1, QuizAttempt::count());
    }

    public function test_activity_archiving_keeps_answers_scores_and_student_history(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a)]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)]);
        $this->actingAs($a)->delete('/pengajaran/modul/'.$m->id.'/aktivitas/'.$activity->id)->assertRedirect();
        $this->assertSoftDeleted('activities', ['id' => $activity->id]);
        $this->assertSame(1, QuizAnswer::count());
        $this->actingAs($s)->get('/siswa/percobaan/'.$attempt->id)->assertOk()->assertSee('100');
        $this->get('/siswa/progres')->assertOk();
    }

    public function test_student_activity_page_and_results_are_visible_but_publishing_changes_are_rechecked(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a)]);
        $this->actingAs($s)->get('/siswa/materi/'.$m->id)->assertOk()->assertSee('Asesmen jaringan');
        $this->get('/siswa/aktivitas/'.$activity->id)->assertOk();
        $this->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $activity->update(['is_published' => false]);
        $this->postJson('/siswa/percobaan/'.$attempt->id.'/simpan', ['answers' => []])->assertForbidden();
        $this->get('/siswa/percobaan/'.$attempt->id)->assertForbidden();
    }

    public function test_report_history_preserves_previous_rombel_membership(): void
    {
        $teacher = $this->user('guru');
        $student = $this->user('siswa');
        [$module,$rombel] = $this->course($teacher, $student);
        $rombel->students()->updateExistingPivot($student->id, ['left_at' => now()]);
        $this->actingAs($teacher)->get('/pengajaran/monitoring')->assertOk()->assertDontSee('Pengguna Asesmen</td>', false);
        $this->get('/pengajaran/monitoring?academic_year=2026%2F2027&semester=1')->assertOk()->assertViewHas('rows', fn ($rows) => $rows->total() === 1);
        $this->get('/pengajaran/monitoring/'.$student->id.'/'.$module->id.'?academic_year=2026%2F2027&semester=1')->assertOk();
    }

    public function test_weighted_scores_and_short_answer_rules_are_checked(): void
    {
        $scorer = app(QuizScorer::class);
        $this->assertTrue($scorer->correct(['type' => 'short', 'correct' => ['accepted' => ['Secure Shell'], 'case_sensitive' => false]], '  secure   SHELL  '));
        $this->assertFalse($scorer->correct(['type' => 'short', 'correct' => ['accepted' => ['Secure Shell'], 'case_sensitive' => true]], 'secure shell'));
        $this->assertFalse($scorer->correct(['type' => 'ordering', 'correct' => ['instal', 'konfigurasi', 'uji']], ['uji', 'konfigurasi', 'instal']));
        $this->assertFalse($scorer->correct(['type' => 'matching', 'correct' => ['ssh' => '22', 'http' => '80']], ['ssh' => '80', 'http' => '22']));
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a, 'single', ['points' => 2]), $this->question($a, 'boolean', ['points' => 1])], ['passing_score' => 70]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $answers = $this->correctAnswers($attempt);
        foreach ($attempt->snapshot['questions'] as $q) {
            if ($q['type'] === 'boolean') {
                $answers[$q['key']] = 'false';
            }
        }
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $answers])->assertRedirect();
        $this->assertSame(66.67, $attempt->fresh()->score);
        $this->assertFalse($attempt->fresh()->passed);
    }

    public function test_module_duplication_clones_activity_configuration_but_no_attempts(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $section = $this->section($m);
        $activity = $this->activity($a, $m, [$this->question($a)], ['kind' => 'checkpoint', 'module_section_id' => $section->id]);
        $this->actingAs($a)->post('/pengajaran/modul/'.$m->id.'/duplikasi')->assertRedirect();
        $copy = Module::where('id', '!=', $m->id)->firstOrFail();
        $cloned = $copy->activities()->firstOrFail();
        $this->assertSame('draft', $copy->status);
        $this->assertFalse($cloned->is_published);
        $this->assertNotSame($activity->current_version_id, $cloned->current_version_id);
        $this->assertSame($copy->id, $cloned->section->module_id);
        $this->assertSame(1, $cloned->versions()->count());
        $this->assertSame(0, QuizAttempt::count());
    }

    public function test_activity_republication_does_not_mutate_an_in_progress_snapshot(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $q = $this->question($a);
        $activity = $this->activity($a, $m, [$q]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $version = $attempt->activity_version_id;
        $data = array_merge($activity->only(['title', 'kind', 'instructions', 'module_section_id', 'is_published', 'is_required', 'progress_weight', 'sort_order']), $activity->currentVersion->definition, ['duration_minutes' => 1, 'passing_score' => 100, 'question_ids' => [$q->id]]);
        $changed = app(ActivityService::class)->save($a, $m, $data, $activity);
        $this->assertNotSame($version, $changed->current_version_id);
        $this->assertSame(5, $attempt->fresh()->snapshot['duration_minutes']);
        $this->assertSame($version, $attempt->fresh()->activity_version_id);
    }

    public function test_review_opens_after_quota_and_audit_is_admin_only(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a)], ['max_attempts' => 1]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)]);
        $this->get('/siswa/percobaan/'.$attempt->id)->assertOk()->assertSee('PEMBAHASAN_RAHASIA_JANGAN_BOCOR');
        $this->get('/admin/riwayat')->assertForbidden();
        $this->get('/admin/riwayat/ekspor')->assertForbidden();
        $this->actingAs($a)->get('/admin/riwayat')->assertOk();
        $res = $this->get('/admin/riwayat/ekspor')->assertOk()->assertDownload();
        $this->files[] = $res->baseResponse->getFile()->getPathname();
    }

    public function test_expiry_records_deadline_time_and_command_finalizes_saved_answers(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a)], ['duration_minutes' => 1]);
        $this->actingAs($s)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->postJson('/siswa/percobaan/'.$attempt->id.'/simpan', ['answers' => $this->correctAnswers($attempt)]);
        $deadline = $attempt->expires_at;
        $this->travel(10)->minutes();
        $this->artisan('learning:expire-attempts')->assertSuccessful();
        $this->assertSame('expired', $attempt->fresh()->status);
        $this->assertTrue($attempt->fresh()->submitted_at->equalTo($deadline));
        $this->assertSame(100.0, $attempt->fresh()->score);
        $this->travelBack();
    }

    public function test_dashboard_learning_counts_and_cohort_chart_follow_teacher_scope(): void
    {
        $teacher = $this->user('guru');
        $own = $this->user('siswa');
        [$module,$rombel] = $this->course($teacher, $own);
        $other = $this->user('guru');
        $outside = $this->user('siswa');
        [$hidden,$hiddenRombel] = $this->course($other, $outside);
        $this->actingAs($teacher)->get('/guru/dashboard')->assertOk()->assertViewHas('stats', fn ($stats) => $stats['Siswa belum mulai'] === 1 && $stats['Siswa sudah mulai'] === 0)->assertViewHas('cohorts', fn ($cohorts) => $cohorts->count() === 1 && $cohorts->first()->id === $rombel->id);
        $activity = $this->activity($teacher, $module, [$this->question($teacher)]);
        $this->actingAs($own)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $this->actingAs($teacher)->get('/guru/dashboard')->assertOk()->assertViewHas('stats', fn ($stats) => $stats['Siswa belum mulai'] === 0 && $stats['Siswa sudah mulai'] === 1 && $stats['Siswa aktif 7 hari'] === 1);
    }

    public function test_student_progress_lists_unstarted_assignments_and_pending_activities(): void
    {
        $a = $this->user();
        $s = $this->user('siswa');
        [$m] = $this->course($a, $s);
        $activity = $this->activity($a, $m, [$this->question($a)]);
        $this->actingAs($s)->get('/siswa/progres')->assertOk()->assertSee($m->title)->assertSee($activity->title)->assertViewHas('pending', fn ($items) => $items->total() === 1);
        $this->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)]);
        $this->get('/siswa/progres')->assertOk()->assertViewHas('pending', fn ($items) => $items->total() === 0);
    }

    public function test_detailed_activity_and_quiz_exports_are_scoped_and_exclude_keys(): void
    {
        $teacher = $this->user('guru');
        $student = $this->user('siswa', 'Peserta Ekspor');
        [$module] = $this->course($teacher, $student);
        $activity = $this->activity($teacher, $module, [$this->question($teacher)]);
        $this->actingAs($student)->post('/siswa/aktivitas/'.$activity->id.'/mulai');
        $attempt = QuizAttempt::first();
        $this->post('/siswa/percobaan/'.$attempt->id.'/kirim', ['answers' => $this->correctAnswers($attempt)]);
        $this->actingAs($teacher);
        foreach (['activities', 'quiz'] as $format) {
            $res = $this->get('/pengajaran/monitoring/ekspor?format='.$format)->assertOk()->assertDownload();
            $path = $res->baseResponse->getFile()->getPathname();
            $this->files[] = $path;
            $zip = new \ZipArchive;
            $zip->open($path);
            $xml = $zip->getFromName('xl/worksheets/sheet1.xml');
            $zip->close();
            $this->assertStringContainsString('Peserta Ekspor', $xml);
            $this->assertStringContainsString('100', $xml);
            $this->assertStringNotContainsString('PEMBAHASAN_RAHASIA_JANGAN_BOCOR',$xml);
        }
    }
}
