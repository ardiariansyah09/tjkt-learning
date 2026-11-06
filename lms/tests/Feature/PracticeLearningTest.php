<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\LabAssessment;
use App\Models\LabSubmission;
use App\Models\LabSubmissionFile;
use App\Models\Module;
use App\Models\ModulePrerequisite;
use App\Models\ModuleProgress;
use App\Models\Rombel;
use App\Models\User;
use App\Services\ActivityService;
use App\Services\EvidenceStorage;
use App\Services\LearningAccessService;
use App\Services\PracticeService;
use App\Services\PracticeTemplate;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PracticeLearningTest extends TestCase
{
    use DatabaseTransactions;

    private array $temp = [];

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('evidence');
    }

    protected function tearDown(): void
    {
        foreach ($this->temp as $p) {
            if (is_file($p)) {
                unlink($p);
            }
        }parent::tearDown();
    }

    private function user(string $role = 'guru'): User
    {
        return User::create(['name' => 'Peserta praktik '.bin2hex(random_bytes(3)), 'username' => 'p_'.bin2hex(random_bytes(6)), 'password' => 'PasswordUji2026!', 'role' => $role, 'is_active' => true, 'must_change_password' => false]);
    }

    private function course(User $t, User $s): array
    {
        $r = Rombel::create(['name' => 'XI Praktik '.bin2hex(random_bytes(4)), 'grade' => 11, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true]);
        $r->students()->attach($s->id, ['joined_at' => now()]);
        $r->teachers()->attach($t->id);
        $m = Module::create(['created_by' => $t->id, 'code' => 'PR-'.bin2hex(random_bytes(6)), 'title' => 'Praktik SSH '.bin2hex(random_bytes(3)), 'status' => 'published', 'published_at' => now(), 'grade' => 11]);
        $m->rombels()->attach($r->id);

        return [$m, $r];
    }

    private function data(array $extra = []): array
    {
        return array_merge(['title' => 'Bukti SSH laptop', 'kind' => 'practice', 'module_section_id' => null, 'instructions' => 'Unggah hasil uji akses SSH.', 'rubric' => 'Bukti service, konfigurasi dan koneksi.', 'due_at' => null, 'is_published' => true, 'is_required' => true, 'progress_weight' => 2, 'sort_order' => 10, 'passing_score' => 80, 'max_attempts' => 3, 'question_count' => 1, 'random_questions' => true, 'shuffle_options' => true, 'min_active_seconds' => 0, 'duration_minutes' => 15, 'question_ids' => []], $extra);
    }

    private function fixture(array $extra = []): array
    {
        $t = $this->user();
        $s = $this->user('siswa');
        [$m,$r] = $this->course($t, $s);
        $a = app(ActivityService::class)->save($t, $m, $this->data($extra));

        return [$t, $s, $m, $a, $r];
    }

    private function file(string $name = 'hasil.pdf', ?string $contents = null): UploadedFile
    {
        $p = tempnam(sys_get_temp_dir(), 'tjkt-practice-');
        $this->temp[] = $p;
        file_put_contents($p, $contents ?? "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");

        return new UploadedFile($p, $name, null, null, true);
    }

    private function submit(User $s, Activity $a, array $extra = []): LabSubmission
    {
        $this->actingAs($s)->post('/siswa/praktik/'.$a->id, array_merge(['request_key' => (string) Str::uuid(), 'report' => 'Saya memasang SSH dan menguji koneksi sebagai akun biasa.', 'evidence' => [$this->file()]], $extra))->assertSessionHasNoErrors()->assertRedirect();

        return LabSubmission::where('user_id', $s->id)->where('activity_id', $a->id)->latest('id')->firstOrFail();
    }

    private function grade(User $t, LabSubmission $submission, array $extra = [])
    {
        return $this->actingAs($t)->post('/pengajaran/praktik/'.$submission->id.'/nilai', array_merge(['decision' => 'approved', 'score' => 90, 'feedback' => 'Bukti lengkap, konfigurasi dan pengujian benar.'], $extra));
    }

    public function test_practice_editor_form_and_student_route_render_real_upload_controls(): void
    {
        [$t,$s,$m,$a] = $this->fixture();
        $this->actingAs($t)->get('/pengajaran/modul/'.$m->id.'/aktivitas/'.$a->id.'/edit')->assertOk()->assertSee('Rubrik penilaian')->assertSee('Batas pengumpulan');
        $this->actingAs($s)->get('/siswa/aktivitas/'.$a->id)->assertRedirect(route('practice.activity', $a));
        $this->get('/siswa/praktik/'.$a->id)->assertOk()->assertSee('multipart/form-data', false)->assertSee('Kirim bukti praktik');
    }

    public function test_upload_is_private_immutable_and_pending_without_client_score(): void
    {
        [, $s,$m,$a] = $this->fixture();
        $submission = $this->submit($s, $a, ['score' => 100, 'status' => 'approved', 'user_id' => 999]);
        $file = $submission->files()->firstOrFail();
        $this->assertSame($s->id, $submission->user_id);
        $this->assertSame('pending', $submission->status);
        Storage::disk('evidence')->assertExists($file->path);
        $this->assertNotSame('hasil.pdf', $file->path);
        $this->assertSame(hash_file('sha256', Storage::disk('evidence')->path($file->path)), $file->sha256);
        $this->assertFalse(str_contains(json_encode($file), $file->path));
        $this->assertNull(ActivityProgress::where('activity_id', $a->id)->first()->completed_at);
        $p = ModuleProgress::where('module_id', $m->id)->first();
        $this->assertEquals(0, $p->completion_percent);
        $this->assertNull($p->practice_score);
        $this->get('/praktik/pengumpulan/'.$submission->id)->assertOk()->assertSee('Menunggu penilaian');
        $res = $this->get('/praktik/bukti/'.$file->id)->assertOk()->assertDownload('hasil.pdf');
        $this->assertStringContainsString('private', $res->headers->get('Cache-Control'));
        $this->assertStringContainsString('no-store', $res->headers->get('Cache-Control'));
        $this->assertSame('application/octet-stream', $res->headers->get('Content-Type'));
    }

    public function test_approval_updates_practice_grade_and_progress_but_never_quiz_score(): void
    {
        [$t,$s,$m,$a] = $this->fixture();
        $submission = $this->submit($s, $a);
        $last = ModuleProgress::where('module_id', $m->id)->first()->last_activity_at;
        $this->travel(2)->days();
        $this->grade($t, $submission)->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('approved', $submission->fresh()->status);
        $this->assertSame(90.0, $submission->assessment->score);
        $p = ModuleProgress::where('module_id', $m->id)->first();
        $this->assertEquals(100, $p->completion_percent);
        $this->assertSame(90.0, $p->practice_score);
        $this->assertNull($p->quiz_score);
        $this->assertTrue($last->equalTo($p->last_activity_at));
        $this->travelBack();
    }

    public function test_revision_requires_new_submission_and_retains_all_files_and_assessments(): void
    {
        [$t,$s,,$a] = $this->fixture();
        $first = $this->submit($s, $a);
        $oldFile = $first->files()->first();
        $this->grade($t, $first, ['decision' => 'revision_requested', 'score' => 60, 'feedback' => 'Tambahkan bukti uji public key.'])->assertSessionHasNoErrors();
        $second = $this->submit($s, $a);
        $this->assertSame(2, $second->attempt_number);
        $this->assertSame('revision_requested', $first->fresh()->status);
        Storage::disk('evidence')->assertExists($oldFile->path);
        $this->assertSame(60.0, $first->assessment->score);
        $this->grade($t, $second)->assertSessionHasNoErrors();
        $this->assertSame(2, LabSubmission::count());
        $this->assertSame(2, LabAssessment::count());
    }

    public function test_duplicate_post_is_idempotent_and_parallel_pending_is_rejected(): void
    {
        [, $s,,$a] = $this->fixture();
        $key = (string) Str::uuid();
        $first = $this->submit($s, $a, ['request_key' => $key]);
        $second = $this->submit($s, $a, ['request_key' => $key]);
        $this->assertSame($first->id, $second->id);
        $this->assertCount(1, Storage::disk('evidence')->allFiles());
        $this->actingAs($s)->post('/siswa/praktik/'.$a->id, ['request_key' => (string) Str::uuid(), 'report' => str_repeat('laporan ', 5), 'evidence' => [$this->file()]])->assertSessionHasErrors('practice');
        $this->assertSame(1, LabSubmission::count());
    }

    public function test_score_below_snapshot_kkm_cannot_be_approved_and_teacher_decision_is_single_use(): void
    {
        [$t,$s,,$a] = $this->fixture();
        $submission = $this->submit($s, $a);
        $this->grade($t, $submission, ['score' => 70])->assertSessionHasErrors('practice');
        $this->assertSame('pending', $submission->fresh()->status);
        $this->grade($t, $submission)->assertSessionHasNoErrors();
        $this->grade($t, $submission, ['score' => 100])->assertSessionHasErrors('practice');
        $this->assertSame(90.0, $submission->assessment->score);
    }

    public function test_submission_freezes_version_rubric_and_kkm_when_activity_changes(): void
    {
        [$t,$s,$m,$a] = $this->fixture();
        $submission = $this->submit($s, $a);
        $version = $submission->activity_version_id;
        app(ActivityService::class)->save($t, $m, $this->data(['passing_score' => 50, 'rubric' => 'Rubrik baru']), $a);
        $this->assertSame($version, $submission->fresh()->activity_version_id);
        $this->assertSame(80, $submission->snapshot['passing_score']);
        $this->grade($t, $submission, ['score' => 60])->assertSessionHasErrors('practice');
        $this->assertNotSame($a->fresh()->current_version_id, $version);
    }

    public function test_foreign_students_unassigned_teachers_and_guests_cannot_read_or_grade(): void
    {
        [$t,$s,,$a] = $this->fixture();
        $submission = $this->submit($s, $a);
        $file = $submission->files()->first();
        $this->actingAs($this->user('siswa'))->get('/praktik/pengumpulan/'.$submission->id)->assertForbidden();
        $this->get('/praktik/bukti/'.$file->id)->assertForbidden();
        $this->grade($this->user(), $submission)->assertForbidden();
        $this->actingAs($s)->post('/pengajaran/praktik/'.$submission->id.'/nilai', ['decision' => 'approved', 'score' => 100, 'feedback' => 'Palsu'])->assertForbidden();
        auth()->logout();
        $this->get('/praktik/bukti/'.$file->id)->assertRedirect('/login');
    }

    public function test_upload_rechecks_publication_prerequisites_and_inactive_accounts(): void
    {
        [, $s,$m,$a] = $this->fixture();
        $a->update(['is_published' => false]);
        $this->actingAs($s)->post('/siswa/praktik/'.$a->id, [])->assertForbidden();
        $a->update(['is_published' => true]);
        $m->update(['status' => 'unpublished']);
        $this->get('/siswa/praktik/'.$a->id)->assertForbidden();
        $m->update(['status' => 'published']);
        $s->update(['is_active' => false]);
        $this->get('/siswa/praktik/'.$a->id)->assertRedirect('/login');
    }

    public function test_historical_evidence_remains_accessible_after_archiving_activity_and_student(): void
    {
        [$t,$s,$m,$a] = $this->fixture();
        $submission = $this->submit($s, $a);
        $file = $submission->files()->first();
        $a->delete();
        $m->update(['status' => 'unpublished']);
        $this->get('/praktik/bukti/'.$file->id)->assertOk();
        $this->get('/praktik/pengumpulan/'.$submission->id)->assertOk();
        $s->delete();
        $this->grade($t, $submission)->assertSessionHasNoErrors();
        $this->actingAs($this->user('admin'))->get('/praktik/bukti/'.$file->id)->assertOk();
    }

    public function test_upload_rejects_html_svg_wrong_extension_empty_and_large_files(): void
    {
        [, $s,,$a] = $this->fixture();
        $this->actingAs($s);
        foreach ([['evil.html', '<html><script>alert(1)</script></html>'], ['evil.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>'], ['lie.png', null], ['empty.pdf', ''], ['big.pdf', "%PDF-1.4\n".str_repeat('x', 1024 * 1024)]] as [$name,$body]) {
            $this->post('/siswa/praktik/'.$a->id, ['request_key' => (string) Str::uuid(), 'report' => str_repeat('laporan ', 5), 'evidence' => [$this->file($name, $body)]])->assertSessionHasErrors();
        }
        $this->assertSame(0, LabSubmission::count());
        $this->assertCount(0, Storage::disk('evidence')->allFiles());
    }

    public function test_real_png_is_accepted_and_html_filename_is_escaped_in_views(): void
    {
        [, $s,,$a] = $this->fixture();
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5X0AAAAASUVORK5CYII=');
        $submission = $this->submit($s, $a, ['evidence' => [$this->file('<img onerror=alert(1)>.png', $png)], 'report' => '<script>alert(1)</script> Laporan praktik dari siswa.']);
        $this->get('/praktik/pengumpulan/'.$submission->id)->assertOk()->assertDontSee('<script>alert(1)</script>', false)->assertDontSee('<img onerror=alert(1)>', false);
    }

    public function test_total_size_and_file_count_are_bounded(): void
    {
        [, $s,,$a] = $this->fixture();
        $this->actingAs($s);
        $files = [];
        for ($i = 0; $i < 3; $i++) {
            $files[] = $this->file('bukti.pdf', "%PDF-1.4\n".str_repeat(' ', 800000)."\n%%EOF");
        }$this->post('/siswa/praktik/'.$a->id, ['request_key' => (string) Str::uuid(), 'report' => str_repeat('laporan ', 5), 'evidence' => $files])->assertSessionHasErrors('evidence');
        $this->post('/siswa/praktik/'.$a->id, ['request_key' => (string) Str::uuid(), 'report' => str_repeat('laporan ', 5), 'evidence' => [$this->file(), $this->file(), $this->file(), $this->file()]])->assertSessionHasErrors('evidence');
        $this->assertSame(0, LabSubmission::count());
    }

    public function test_disk_failure_rolls_back_rows_and_cleans_previous_files(): void
    {
        [, $s,,$a] = $this->fixture();
        $real = new EvidenceStorage;
        $calls = 0;
        $mock = \Mockery::mock(EvidenceStorage::class)->makePartial();
        $mock->shouldReceive('put')->twice()->andReturnUsing(function ($f) use ($real, &$calls) {
            if (++$calls === 2) {
                throw new \RuntimeException('disk test failure');
            }

            return $real->put($f);
        });
        $this->app->instance(EvidenceStorage::class, $mock);
        try {
            app(PracticeService::class)->submit($s, $a, ['request_key' => (string) Str::uuid(), 'report' => str_repeat('laporan ', 5)], [$this->file(), $this->file()]);
            $this->fail('Expected disk failure');
        } catch (\RuntimeException $e) {
            $this->assertSame('disk test failure', $e->getMessage());
        }
        $this->assertSame(0, LabSubmission::count());
        $this->assertCount(0, Storage::disk('evidence')->allFiles());
        $this->assertSame(0, ActivityProgress::where('activity_id', $a->id)->count());
    }

    public function test_deadline_and_quota_prevent_new_uploads_but_not_teacher_assessment(): void
    {
        [$t,$s,$m,$a] = $this->fixture(['due_at' => now()->addMinute()->toIso8601String(), 'max_attempts' => 1]);
        $submission = $this->submit($s, $a);
        $this->travel(2)->minutes();
        $this->grade($t, $submission, ['decision' => 'revision_requested', 'score' => 40])->assertSessionHasNoErrors();
        $this->actingAs($s)->post('/siswa/praktik/'.$a->id, ['request_key' => (string) Str::uuid(), 'report' => str_repeat('laporan ', 5), 'evidence' => [$this->file()]])->assertSessionHasErrors('practice');
        $this->travelBack();
        app(ActivityService::class)->save($t, $m, $this->data(['max_attempts' => 1]), $a);
        $this->actingAs($s)->post('/siswa/praktik/'.$a->id, ['request_key' => (string) Str::uuid(), 'report' => str_repeat('laporan ', 5), 'evidence' => [$this->file()]])->assertSessionHasErrors('practice');
    }

    public function test_required_practice_unlocks_lab_prerequisite_only_after_approval(): void
    {
        [$t,$s,$m,$a] = $this->fixture();
        [$next] = $this->course($t, $s);
        ModulePrerequisite::create(['module_id' => $next->id, 'required_module_id' => $m->id, 'type' => 'lab_completed']);
        $submission = $this->submit($s, $a);
        $this->assertNotEmpty(app(LearningAccessService::class)->reasons($s, $next));
        $this->grade($t, $submission)->assertSessionHasNoErrors();
        $this->assertSame([], app(LearningAccessService::class)->reasons($s, $next));
    }

    public function test_queue_and_export_are_scoped_and_include_feedback_without_private_paths(): void
    {
        [$t,$s,$m,$a] = $this->fixture();
        $own = $this->submit($s, $a);
        $this->grade($t, $own)->assertSessionHasNoErrors();
        [$other,$outside,$hidden,$hiddenActivity] = $this->fixture();
        $secret = $this->submit($outside, $hiddenActivity);
        $this->actingAs($t)->get('/pengajaran/praktik')->assertOk()->assertSee($s->name)->assertDontSee($outside->name)->assertViewHas('summary', fn ($v) => (int) $v->total === 1);
        $res = $this->get('/pengajaran/praktik/ekspor')->assertOk()->assertDownload();
        $path = $res->baseResponse->getFile()->getPathname();
        $z = new \ZipArchive;
        $z->open($path);
        $xml = $z->getFromName('xl/worksheets/sheet1.xml');
        $z->close();
        unlink($path);
        $this->assertStringContainsString($s->name, $xml);
        $this->assertStringNotContainsString($outside->name, $xml);
        $this->assertStringNotContainsString($own->files()->first()->path, $xml);
        $this->assertStringContainsString('Bukti lengkap', $xml);
        $this->get('/pengajaran/praktik?module_id='.$hidden->id)->assertViewHas('summary', fn ($v) => (int) $v->total === 0);
    }

    public function test_queue_history_stays_authorized_after_student_moves_rombel(): void
    {
        [$t,$s,,$a,$r] = $this->fixture();
        $submission = $this->submit($s, $a);
        $r->students()->updateExistingPivot($s->id, ['left_at' => now()]);
        $this->actingAs($t)->get('/praktik/pengumpulan/'.$submission->id)->assertOk();
        $this->get('/pengajaran/praktik?academic_year=2026%2F2027&semester=1')->assertOk()->assertSee($s->name);
        $this->actingAs($this->user())->get('/praktik/pengumpulan/'.$submission->id)->assertForbidden();
    }

    public function test_analytics_are_real_scoped_and_separate_quiz_practice_and_events(): void
    {
        [$t,$s,$m,$a] = $this->fixture();
        $submission = $this->submit($s, $a);
        $this->grade($t, $submission)->assertSessionHasNoErrors();
        [, $outsider,$hidden,$hiddenActivity] = $this->fixture();
        $this->submit($outsider, $hiddenActivity);
        $this->actingAs($t)->get('/pengajaran/analitik')->assertOk()->assertViewHas('summary', fn ($v) => (int) $v->assignments === 1 && (int) $v->completed === 1 && (float) $v->practice_score === 90.0 && $v->quiz_score === null)->assertViewHas('practice', fn ($v) => (int) $v->approved === 1 && (int) $v->pending === 0)->assertViewHas('days', fn ($days) => array_sum(array_column($days, 'total')) >= 3)->assertDontSee($outsider->name)->assertViewHas('activityStats', fn ($rows) => $rows->count() === 1);
        $this->get('/pengajaran/analitik?from=2026-01-01&to=2026-10-22')->assertSessionHasErrors('from');
        $this->actingAs($s)->get('/pengajaran/analitik')->assertForbidden();
    }

    public function test_dashboard_pending_count_and_student_report_include_practice(): void
    {
        [$t,$s,$m,$a] = $this->fixture();
        $submission = $this->submit($s, $a);
        $this->get('/siswa/progres')->assertOk()->assertSee('Bukti dan nilai praktik laptop');
        $this->actingAs($t)->get('/guru/dashboard')->assertOk()->assertViewHas('stats', fn ($v) => $v['Praktik menunggu penilaian'] === 1);
        $this->get('/pengajaran/monitoring/'.$s->id.'/'.$m->id)->assertOk()->assertSee('Bukti dan nilai praktik laptop');
    }

    public function test_template_task_is_idempotent_draft_and_does_not_change_module_publication(): void
    {
        [$t,,$m] = $this->fixture();
        $a = app(PracticeTemplate::class)->attach($t, $m);
        $second = app(PracticeTemplate::class)->attach($t, $m);
        $this->assertSame($a->id, $second->id);
        $this->assertFalse($a->is_published);
        $this->assertSame('published', $m->fresh()->status);
        $this->assertSame('ssh12-evidence-v1', $a->currentVersion->definition['template_key']);
    }

    public function test_health_probe_checks_write_access_and_leaves_no_evidence(): void
    {
        $this->artisan('learning:health', ['--write' => true])->assertSuccessful();
        $this->assertCount(0, Storage::disk('evidence')->allFiles());
    }

    public function test_integrity_command_detects_missing_and_modified_evidence_without_deleting(): void
    {
        [, $s,,$a] = $this->fixture();
        $submission = $this->submit($s, $a);
        $file = $submission->files()->first();
        $this->artisan('learning:check-evidence', ['--hash' => true])->assertSuccessful();
        Storage::disk('evidence')->put($file->path, 'modified');
        $this->artisan('learning:check-evidence', ['--hash' => true])->assertFailed();
        Storage::disk('evidence')->assertExists($file->path);
        Storage::disk('evidence')->delete($file->path);
        $this->artisan('learning:check-evidence')->assertFailed();
        $this->assertSame(1, LabSubmissionFile::count());
    }

    public function test_actionable_revision_count_excludes_superseded_submission(): void
    {
        [$t,$s,,$a] = $this->fixture();
        $first = $this->submit($s, $a);
        $this->grade($t, $first, ['decision' => 'revision_requested', 'score' => 50])->assertSessionHasNoErrors();
        $this->actingAs($t)->get('/pengajaran/analitik')->assertOk()->assertViewHas('practice', fn ($v) => (int) $v->revisions === 1);
        $second = $this->submit($s, $a);
        $this->actingAs($t)->get('/pengajaran/analitik')->assertOk()->assertViewHas('practice', fn ($v) => (int) $v->revisions === 0 && (int) $v->pending === 1);
    }

    public function test_optional_practice_does_not_block_module_or_increase_quiz_grade(): void
    {
        [$t,$s,$m,$a] = $this->fixture(['is_required' => false]);
        $required = app(ActivityService::class)->save($t, $m, $this->data(['title' => 'Praktik wajib', 'progress_weight' => 1]));
        $submission = $this->submit($s, $required);
        $this->grade($t, $submission)->assertSessionHasNoErrors();
        $progress = ModuleProgress::where('module_id', $m->id)->first();
        $this->assertSame('completed', $progress->status);
        $this->assertSame(90.0, $progress->practice_score);
        $this->assertNull($progress->quiz_score);
    }

    public function test_module_duplication_clones_practice_configuration_but_no_evidence(): void
    {
        [$t,$s,$m,$a] = $this->fixture();
        $this->submit($s, $a);
        $this->actingAs($t)->post('/pengajaran/modul/'.$m->id.'/duplikasi')->assertRedirect();
        $copy = Module::where('id', '!=', $m->id)->firstOrFail();
        $cloned = $copy->activities()->firstOrFail();
        $this->assertSame('practice', $cloned->kind);
        $this->assertFalse($cloned->is_published);
        $this->assertSame(0, $cloned->submissions()->count());
        $this->assertSame($a->currentVersion->definition, $cloned->currentVersion->definition);
    }

    public function test_evidence_preview_is_inline_private_authorized_and_embedded_beside_grading(): void
    {
        [$teacher,$student,,$activity] = $this->fixture();
        $submission = $this->submit($student, $activity);
        $file = $submission->files()->firstOrFail();
        $url = '/praktik/bukti/'.$file->id.'/pratinjau';
        $this->actingAs($teacher)->get($url)->assertOk()->assertHeader('Content-Type', 'application/pdf')->assertHeader('X-Content-Type-Options', 'nosniff')->assertHeader('X-Frame-Options', 'SAMEORIGIN')->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'self'");
        $this->get('/praktik/bukti/'.$file->id.'/lihat')->assertOk()->assertSee('id="pdf-reader"', false)->assertSee('Nomor halaman')->assertSee('pdf-reader.js');
        $response = $this->get($url)->assertOk();
        $this->assertStringStartsWith('inline;', $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->get('/praktik/pengumpulan/'.$submission->id)->assertOk()->assertSee('<iframe', false)->assertSee('Buka pratinjau tab baru')->assertSee('Simpan penilaian')->assertDontSee('Unduh bukti');
        $outsider = $this->user();
        $this->actingAs($outsider)->get($url)->assertForbidden();
        $this->get('/praktik/bukti/'.$file->id.'/lihat')->assertForbidden();
        $this->actingAs($this->user('siswa'))->get($url)->assertForbidden();
        $this->actingAs($student)->get($url)->assertOk();
        Storage::disk('evidence')->delete($file->path);
        $this->actingAs($teacher)->get($url)->assertNotFound();
    }
}
