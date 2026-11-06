<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\LearningVerification;
use App\Models\Module;
use App\Models\ModuleAccessOverride;
use App\Models\ModuleSection;
use App\Models\Rombel;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LearningManagementTest extends TestCase
{
    use DatabaseTransactions;

    private function user(string $role = 'admin'): User
    {
        return User::create(['name' => 'Pengguna Pembelajaran', 'username' => 'learn_'.bin2hex(random_bytes(6)), 'role' => $role, 'password' => 'PasswordUji2026!', 'is_active' => true, 'must_change_password' => false]);
    }

    private function rombel(?User $teacher = null, ?User $student = null): Rombel
    {
        $r = Rombel::create(['name' => 'X Learning '.bin2hex(random_bytes(4)), 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true]);
        if ($teacher) {
            $r->teachers()->attach($teacher->id);
        }if ($student) {
            $r->students()->attach($student->id, ['joined_at' => now()]);
        }

        return $r;
    }

    private function data(array $extra = []): array
    {
        return array_merge(['code' => 'MOD-'.bin2hex(random_bytes(6)), 'title' => 'Materi Jaringan', 'description' => 'Deskripsi materi pembelajaran', 'phase' => 'E', 'grade' => 10, 'competency' => 'Administrasi jaringan', 'objectives' => 'Siswa memahami konsep dan penerapan jaringan.', 'estimated_minutes' => 90, 'sort_order' => 10, 'status' => 'draft'], $extra);
    }

    private function module(User $author, ?Rombel $r = null, string $status = 'draft'): Module
    {
        $m = Module::create($this->data(['created_by' => $author->id, 'status' => $status]));
        if ($r) {
            $m->rombels()->attach($r->id);
        }

        return $m;
    }

    private function section(Module $m, array $extra = []): ModuleSection
    {
        return $m->sections()->create(array_merge(['title' => 'Konsep jaringan', 'kind' => 'theory', 'content' => '# Isi Materi Rahasia\n\nPembahasan konsep jaringan.', 'is_published' => true, 'is_required' => true, 'sort_order' => 10, 'progress_weight' => 1], $extra));
    }

    private function proof(User $actor, User $student, Module $source, string $type = 'module_completed', ?int $score = null): LearningVerification
    {
        return LearningVerification::create(['user_id' => $student->id, 'module_id' => $source->id, 'type' => $type, 'score' => $score, 'note' => 'Bukti pekerjaan telah diperiksa pengajar.', 'verified_by' => $actor->id, 'verified_at' => now()]);
    }

    public function test_management_pages_render_for_admin_and_teacher(): void
    {
        foreach (['admin', 'guru'] as $role) {
            $u = $this->user($role);
            $this->actingAs($u);
            $m = $this->module($u);
            $s = $this->section($m);
            foreach (['/pengajaran/modul', '/pengajaran/modul/create', '/pengajaran/modul/'.$m->id.'/edit', '/pengajaran/modul/'.$m->id.'/preview', '/pengajaran/modul/'.$m->id.'/submateri/create', '/pengajaran/modul/'.$m->id.'/submateri/'.$s->id.'/edit', '/pengajaran/verifikasi'] as $url) {
                $this->get($url)->assertOk();
            }
        }
    }

    public function test_module_crud_publication_assignments_and_unpublish_preserve_history(): void
    {
        $a = $this->user();
        $this->actingAs($a);
        $r = $this->rombel();
        $data = $this->data(['rombel_ids' => [$r->id]]);
        $this->post('/pengajaran/modul', $data)->assertSessionHasNoErrors();
        $m = Module::where('code', $data['code'])->firstOrFail();
        $this->assertSame($a->id, $m->created_by);
        $this->assertDatabaseHas('module_assignments', ['module_id' => $m->id, 'rombel_id' => $r->id]);
        $data['status'] = 'published';
        $this->put('/pengajaran/modul/'.$m->id, $data)->assertSessionHasErrors('status');
        $this->section($m);
        $this->put('/pengajaran/modul/'.$m->id, $data)->assertSessionHasNoErrors();
        $this->assertSame('published', $m->fresh()->status);
        $this->assertNotNull($m->fresh()->published_at);
        $student = $this->user('siswa');
        $this->proof($a, $student, $m);
        $data['status'] = 'unpublished';
        $this->put('/pengajaran/modul/'.$m->id, $data)->assertSessionHasNoErrors();
        $this->assertDatabaseHas('learning_verifications', ['module_id' => $m->id, 'user_id' => $student->id]);
        $this->delete('/pengajaran/modul/'.$m->id)->assertRedirect('/pengajaran/modul');
        $this->assertSoftDeleted('modules', ['id' => $m->id]);
        $this->assertSame(1, $m->sections()->count());
    }

    public function test_published_module_requires_active_assignment_and_content(): void
    {
        $a = $this->user();
        $this->actingAs($a);
        $r = $this->rombel();
        $m = $this->module($a, $r);
        $this->section($m);
        $data = $this->data(['code' => $m->code, 'status' => 'published', 'rombel_ids' => []]);
        $this->put('/pengajaran/modul/'.$m->id, $data)->assertSessionHasErrors('rombel_ids');
        $r->update(['is_active' => false]);
        $data['rombel_ids'] = [$r->id];
        $this->put('/pengajaran/modul/'.$m->id, $data)->assertSessionHasErrors('rombel_ids');
        $this->post('/pengajaran/modul', $this->data(['status' => 'published']))->assertSessionHasErrors('status');
    }

    public function test_teacher_cannot_edit_other_authors_or_assign_outside_teaching_scope(): void
    {
        $teacher = $this->user('guru');
        $other = $this->user('guru');
        $own = $this->rombel($teacher);
        $outside = $this->rombel($other);
        $m = $this->module($other, $own);
        $this->section($m);
        $this->actingAs($teacher)->get('/pengajaran/modul/'.$m->id.'/preview')->assertOk();
        $this->get('/pengajaran/modul/'.$m->id.'/edit')->assertForbidden();
        $this->put('/pengajaran/modul/'.$m->id, $this->data(['code' => $m->code]))->assertForbidden();
        $data = $this->data(['rombel_ids' => [$outside->id]]);
        $this->post('/pengajaran/modul', $data)->assertSessionHasErrors('rombel_ids');
        $this->assertDatabaseMissing('modules', ['code' => $data['code']]);
        $hidden = $this->module($other);
        $this->get('/pengajaran/modul/'.$hidden->id.'/preview')->assertForbidden();
    }

    public function test_teacher_edit_preserves_assignments_granted_outside_their_scope(): void
    {
        $teacher = $this->user('guru');
        $own = $this->rombel($teacher);
        $outside = $this->rombel();
        $m = $this->module($teacher, $outside);
        $this->actingAs($teacher)->put('/pengajaran/modul/'.$m->id, $this->data(['code' => $m->code, 'rombel_ids' => [$own->id]]))->assertSessionHasNoErrors();
        $this->assertEqualsCanonicalizing([$own->id, $outside->id], $m->rombels()->pluck('rombels.id')->all());
    }

    public function test_section_crud_reorder_and_parent_idor_are_guarded(): void
    {
        $a = $this->user();
        $this->actingAs($a);
        $m = $this->module($a);
        $data = ['title' => 'Orientasi pembelajaran', 'kind' => 'orientation', 'content' => '## Tujuan\nMemahami administrasi jaringan.', 'sort_order' => 10, 'is_published' => 1, 'is_required' => 1, 'progress_weight' => 2];
        $this->post('/pengajaran/modul/'.$m->id.'/submateri', $data)->assertSessionHasNoErrors();
        $s = $m->sections()->firstOrFail();
        $next = $this->section($m, ['title' => 'Submateri Kedua', 'sort_order' => 20]);
        $this->post('/pengajaran/modul/'.$m->id.'/submateri/'.$next->id.'/urutan', ['direction' => 'up'])->assertSessionHasNoErrors();
        $this->assertSame($next->id, $m->sections()->first()->id);
        $data['title'] = 'Orientasi diperbarui';
        $this->put('/pengajaran/modul/'.$m->id.'/submateri/'.$s->id, $data)->assertSessionHasNoErrors();
        $other = $this->module($a);
        $this->put('/pengajaran/modul/'.$other->id.'/submateri/'.$s->id, $data)->assertNotFound();
        $this->delete('/pengajaran/modul/'.$m->id.'/submateri/'.$s->id)->assertSessionHasNoErrors();
        $this->assertSoftDeleted('module_sections', ['id' => $s->id]);
    }

    public function test_last_published_section_cannot_be_hidden_or_archived_while_module_is_live(): void
    {
        $a = $this->user();
        $this->actingAs($a);
        $m = $this->module($a, $this->rombel(), 'published');
        $s = $this->section($m);
        $data = $s->only(['title', 'kind', 'content', 'sort_order', 'is_published', 'is_required', 'progress_weight']);
        $data['is_published'] = 0;
        $this->put('/pengajaran/modul/'.$m->id.'/submateri/'.$s->id, $data)->assertSessionHasErrors('is_published');
        $this->delete('/pengajaran/modul/'.$m->id.'/submateri/'.$s->id)->assertSessionHasErrors('section');
        $this->assertFalse($s->fresh()->trashed());
    }

    public function test_duplication_creates_a_draft_with_content_rules_and_no_assignments(): void
    {
        $a = $this->user();
        $this->actingAs($a);
        $source = $this->module($a, $this->rombel(), 'published');
        $this->section($source);
        $dependency = $this->module($a);
        $source->prerequisites()->create(['required_module_id' => $dependency->id, 'type' => 'module_completed']);
        $this->post('/pengajaran/modul/'.$source->id.'/duplikasi')->assertSessionHasNoErrors();
        $copy = Module::where('id', '!=', $source->id)->where('title', 'like', 'Salinan%')->firstOrFail();
        $this->assertSame('draft', $copy->status);
        $this->assertNotSame($source->code, $copy->code);
        $this->assertNull($copy->published_at);
        $this->assertSame(1, $copy->sections()->count());
        $this->assertSame(1, $copy->prerequisites()->count());
        $this->assertSame(0, $copy->rombels()->count());
    }

    public function test_prerequisites_reject_self_indirect_cycles_and_duplicates_transactionally(): void
    {
        $a = $this->user();
        $this->actingAs($a);
        $x = $this->module($a);
        $y = $this->module($a);
        $z = $this->module($a);
        $rule = fn ($id) => ['required_module_id' => $id, 'type' => 'module_completed'];
        $this->put('/pengajaran/modul/'.$x->id.'/prasyarat', ['rules' => [$rule($y->id)]])->assertSessionHasNoErrors();
        $this->put('/pengajaran/modul/'.$y->id.'/prasyarat', ['rules' => [$rule($z->id)]])->assertSessionHasNoErrors();
        $this->put('/pengajaran/modul/'.$z->id.'/prasyarat', ['rules' => [$rule($x->id)]])->assertSessionHasErrors('rules');
        $this->assertSame(0, $z->prerequisites()->count());
        $this->put('/pengajaran/modul/'.$x->id.'/prasyarat', ['rules' => [$rule($x->id)]])->assertSessionHasErrors('rules');
        $this->assertDatabaseHas('module_prerequisites', ['module_id' => $x->id, 'required_module_id' => $y->id]);
        $this->put('/pengajaran/modul/'.$x->id.'/prasyarat', ['rules' => [$rule($y->id), $rule($y->id)]])->assertSessionHasErrors('rules');
        $this->delete('/pengajaran/modul/'.$y->id)->assertSessionHasErrors('module');
    }

    public function test_student_catalog_hides_unassigned_drafts_and_inactive_memberships(): void
    {
        $a = $this->user();
        $student = $this->user('siswa');
        $r = $this->rombel(null, $student);
        $visible = $this->module($a, $r, 'published');
        $visible->update(['title' => 'Materi Terlihat']);
        $draft = $this->module($a, $r);
        $draft->update(['title' => 'Materi Draft Tersembunyi']);
        $outside = $this->module($a, null, 'published');
        $outside->update(['title' => 'Materi Tidak Ditugaskan']);
        $this->actingAs($student)->get('/siswa/materi')->assertOk()->assertSee('Materi Terlihat')->assertDontSee('Materi Draft Tersembunyi')->assertDontSee('Materi Tidak Ditugaskan');
        $this->get('/siswa/materi/'.$draft->id)->assertNotFound();
        $this->get('/siswa/materi/'.$outside->id)->assertNotFound();
        $r->students()->updateExistingPivot($student->id, ['left_at' => now()]);
        $this->get('/siswa/materi')->assertDontSee('Materi Terlihat');
    }

    public function test_locked_module_never_leaks_body_and_unlocks_after_all_conditions(): void
    {
        $a = $this->user();
        $student = $this->user('siswa');
        $r = $this->rombel(null, $student);
        $source = $this->module($a, $r, 'published');
        $target = $this->module($a, $r, 'published');
        $section = $this->section($target);
        foreach (['module_completed', 'quiz_score', 'lab_completed', 'teacher_verified'] as $type) {
            $target->prerequisites()->create(['required_module_id' => $source->id, 'type' => $type, 'min_score' => $type === 'quiz_score' ? 75 : null]);
        }$this->actingAs($student)->get('/siswa/materi/'.$target->id)->assertOk()->assertSee('Materi masih terkunci')->assertDontSee('Isi Materi Rahasia');
        $this->get('/siswa/materi/'.$target->id.'/submateri/'.$section->id)->assertForbidden();
        foreach (['module_completed', 'lab_completed', 'teacher_verified'] as $type) {
            $this->proof($a, $student, $source, $type);
        }$this->proof($a, $student, $source, 'quiz_score', 74);
        $this->get('/siswa/materi/'.$target->id.'/submateri/'.$section->id)->assertForbidden();
        $pass = $this->proof($a, $student, $source, 'quiz_score', 75);
        $this->get('/siswa/materi/'.$target->id.'/submateri/'.$section->id)->assertOk()->assertSee('Isi Materi Rahasia');
        $pass->update(['revoked_at' => now()]);
        $this->get('/siswa/materi/'.$target->id.'/submateri/'.$section->id)->assertForbidden();
    }

    public function test_student_navigation_excludes_drafts_and_rechecks_backend_publication(): void
    {
        $a = $this->user();
        $student = $this->user('siswa');
        $r = $this->rombel(null, $student);
        $m = $this->module($a, $r, 'published');
        $first = $this->section($m, ['title' => 'Langkah Pertama']);
        $second = $this->section($m, ['title' => 'Langkah Kedua', 'sort_order' => 20]);
        $hidden = $this->section($m, ['title' => 'Draft Rahasia', 'is_published' => false]);
        $this->actingAs($student)->get('/siswa/materi/'.$m->id.'/submateri/'.$first->id)->assertOk()->assertSee('Langkah Kedua')->assertDontSee('Draft Rahasia');
        $this->get('/siswa/materi/'.$m->id.'/submateri/'.$hidden->id)->assertNotFound();
        $other = $this->module($a, $r, 'published');
        $this->get('/siswa/materi/'.$other->id.'/submateri/'.$first->id)->assertNotFound();
        $m->update(['status' => 'unpublished']);
        $this->get('/siswa/materi/'.$m->id.'/submateri/'.$second->id)->assertForbidden();
        $this->assertSame(0, LearningVerification::where('user_id', $student->id)->count());
    }

    public function test_markdown_is_sanitized_in_preview_and_student_content(): void
    {
        $a = $this->user();
        $student = $this->user('siswa');
        $r = $this->rombel(null, $student);
        $m = $this->module($a, $r, 'published');
        $s = $this->section($m, ['content' => "# Judul Aman\n\n<script>alert('x')</script>\n\n[bahaya](javascript:alert(1))\n\n<img src=x onerror=alert(1)>\n\n|A|B|\n|-|-|\n|1|2|\n\n```bash\napt install openssh-server\n```"]);
        $this->actingAs($a)->get('/pengajaran/modul/'.$m->id.'/preview')->assertOk()->assertSee('Judul Aman')->assertDontSee('<script>', false)->assertDontSee('onerror=', false)->assertDontSee('href="javascript:', false)->assertSee('<table>', false);
        $this->actingAs($student)->get('/siswa/materi/'.$m->id.'/submateri/'.$s->id)->assertOk()->assertDontSee('<script>', false)->assertSee('apt install openssh-server');
    }

    public function test_teacher_verification_is_scoped_audited_and_revocable(): void
    {
        $teacher = $this->user('guru');
        $student = $this->user('siswa');
        $outside = $this->user('siswa');
        $this->rombel($teacher, $student);
        $m = $this->module($teacher);
        $this->actingAs($teacher);
        $data = ['user_id' => $student->id, 'module_id' => $m->id, 'type' => 'quiz_score', 'score' => 90, 'note' => 'Hasil kuis offline telah diperiksa sesuai rubrik.'];
        $this->post('/pengajaran/verifikasi', $data)->assertSessionHasNoErrors();
        $proof = LearningVerification::latest('id')->firstOrFail();
        $this->assertSame($teacher->id, $proof->verified_by);
        $this->assertDatabaseHas('audit_logs', ['event' => 'learning.verified']);
        $data['user_id'] = $outside->id;
        $this->post('/pengajaran/verifikasi', $data)->assertForbidden();
        $this->post('/pengajaran/verifikasi/'.$proof->id.'/cabut', ['reason' => 'Bukti perlu diperiksa ulang oleh guru.'])->assertSessionHasNoErrors();
        $this->assertNotNull($proof->fresh()->revoked_at);
    }

    public function test_override_requires_admin_reason_and_never_bypasses_publication_or_assignment(): void
    {
        $a = $this->user();
        $teacher = $this->user('guru');
        $student = $this->user('siswa');
        $r = $this->rombel($teacher, $student);
        $m = $this->module($a, $r, 'published');
        $s = $this->section($m);
        $source = $this->module($a);
        $m->prerequisites()->create(['required_module_id' => $source->id, 'type' => 'module_completed']);
        $data = ['user_id' => $student->id, 'module_id' => $m->id, 'reason' => 'Penyesuaian jalur belajar berdasarkan asesmen awal.'];
        $this->actingAs($teacher)->post('/pengajaran/override', $data)->assertForbidden();
        $this->actingAs($a)->post('/pengajaran/override', array_merge($data, ['reason' => '']))->assertSessionHasErrors('reason');
        $this->post('/pengajaran/override', $data)->assertSessionHasNoErrors();
        $override = ModuleAccessOverride::latest('id')->firstOrFail();
        $audit = AuditLog::where('event', 'module.override_granted')->latest('id')->firstOrFail();
        $this->assertSame($data['reason'], $audit->metadata['reason']);
        $this->actingAs($student)->get('/siswa/materi/'.$m->id.'/submateri/'.$s->id)->assertOk();
        $override->update(['expires_at' => now()->subSecond()]);
        $this->get('/siswa/materi/'.$m->id.'/submateri/'.$s->id)->assertForbidden();
        $override->update(['expires_at' => null]);
        $m->update(['status' => 'unpublished']);
        $this->get('/siswa/materi/'.$m->id.'/submateri/'.$s->id)->assertForbidden();
        $m->update(['status' => 'published']);
        $m->rombels()->detach();
        $this->get('/siswa/materi/'.$m->id.'/submateri/'.$s->id)->assertForbidden();
        $this->actingAs($a)->post('/pengajaran/override/'.$override->id.'/cabut', ['reason' => 'Pengecualian tidak lagi diperlukan.'])->assertSessionHasNoErrors();
        $this->assertNotNull($override->fresh()->revoked_at);
    }

    public function test_student_cannot_manage_publish_verify_or_override(): void
    {
        $a = $this->user();
        $m = $this->module($a);
        $s = $this->section($m);
        $this->actingAs($this->user('siswa'));
        foreach (['/pengajaran/modul', '/pengajaran/modul/create', '/pengajaran/modul/'.$m->id.'/preview', '/pengajaran/verifikasi'] as $url) {
            $this->get($url)->assertForbidden();
        }$this->post('/pengajaran/modul', $this->data())->assertForbidden();
        $this->put('/pengajaran/modul/'.$m->id.'/prasyarat', ['rules' => []])->assertForbidden();
        $this->post('/pengajaran/verifikasi', [])->assertForbidden();
        $this->post('/pengajaran/override', [])->assertForbidden();
        $this->get('/materi/'.$m->id.'/thumbnail')->assertForbidden();
    }

    public function test_thumbnail_upload_is_private_and_rejects_svg(): void
    {
        Storage::fake('local');
        $a = $this->user();
        $this->actingAs($a);
        $data = $this->data(['thumbnail' => UploadedFile::fake()->image('modul.png', 120, 80)]);
        $this->post('/pengajaran/modul', $data)->assertSessionHasNoErrors();
        $m = Module::where('code', $data['code'])->firstOrFail();
        Storage::disk('local')->assertExists($m->thumbnail);
        $this->get('/materi/'.$m->id.'/thumbnail')->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $bad = $this->data(['thumbnail' => UploadedFile::fake()->createWithContent('bad.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')]);
        $this->post('/pengajaran/modul', $bad)->assertSessionHasErrors('thumbnail');
    }

    public function test_filters_and_module_code_uniqueness_are_enforced(): void
    {
        $a = $this->user();
        $this->actingAs($a);
        $m = $this->module($a);
        $this->get('/pengajaran/modul?q='.$m->code.'&grade=10&status=draft')->assertViewHas('modules', fn ($items) => $items->total() === 1);
        $this->post('/pengajaran/modul', $this->data(['code' => $m->code]))->assertSessionHasErrors('code');
        $this->put('/pengajaran/modul/'.$m->id.'/prasyarat', ['rules' => [['required_module_id' => $this->module($a)->id, 'type' => 'quiz_score']]])->assertSessionHasErrors('rules.0.min_score');
    }

    public function test_requirements_from_multiple_modules_are_all_required(): void
    {
        $admin = $this->user();
        $student = $this->user('siswa');
        $rombel = $this->rombel(null, $student);
        $first = $this->module($admin);
        $second = $this->module($admin);
        $target = $this->module($admin, $rombel, 'published');
        $section = $this->section($target);
        foreach ([$first, $second] as $source) {
            $target->prerequisites()->create(['required_module_id' => $source->id, 'type' => 'module_completed']);
        }
        $this->proof($admin, $student, $first);
        $this->actingAs($student)->get('/siswa/materi/'.$target->id.'/submateri/'.$section->id)->assertForbidden();
        $this->proof($admin, $student, $second);
        $this->get('/siswa/materi/'.$target->id.'/submateri/'.$section->id)->assertOk();
    }

    public function test_failed_module_save_removes_new_thumbnail(): void
    {
        Storage::fake('local');
        $teacher = $this->user('guru');
        $outside = $this->rombel();
        $this->actingAs($teacher)->post('/pengajaran/modul', $this->data([
            'rombel_ids' => [$outside->id],
            'thumbnail' => UploadedFile::fake()->image('gagal.png', 120, 80),
        ]))->assertSessionHasErrors('rombel_ids');
        $this->assertSame([], Storage::disk('local')->allFiles('module-thumbnails'));
    }

    public function test_teacher_cannot_revoke_another_teachers_evidence(): void
    {
        $owner = $this->user('guru');
        $other = $this->user('guru');
        $student = $this->user('siswa');
        $rombel = $this->rombel($owner, $student);
        $rombel->teachers()->attach($other->id);
        $module = $this->module($owner, $rombel);
        $proof = $this->proof($owner, $student, $module);
        $this->actingAs($other)->post('/pengajaran/verifikasi/'.$proof->id.'/cabut', [
            'reason' => 'Mencoba mencabut bukti milik pengajar lain.',
        ])->assertForbidden();
        $this->assertNull($proof->fresh()->revoked_at);
    }
}
