<?php

namespace Tests\Feature;

use App\Models\ActivityProgress;
use App\Models\Module;
use App\Models\ModuleProgress;
use App\Models\Rombel;
use App\Models\User;
use App\Services\ActivityService;
use App\Services\ProgressService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LearningSequenceTest extends TestCase
{
    use DatabaseTransactions;

    private function fixture(): array
    {
        $admin = User::create(['name' => 'Admin urutan', 'username' => 'seq_a_'.bin2hex(random_bytes(5)), 'password' => 'PasswordTest2026!', 'role' => 'admin', 'is_active' => true, 'must_change_password' => false]);
        $student = User::create(['name' => 'Siswa urutan', 'username' => 'seq_s_'.bin2hex(random_bytes(5)), 'password' => 'PasswordTest2026!', 'role' => 'siswa', 'is_active' => true, 'must_change_password' => false]);
        $r = Rombel::create(['name' => 'Urutan '.bin2hex(random_bytes(5)), 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true]);
        $r->students()->attach($student->id, ['joined_at' => now()]);
        $m = Module::create(['created_by' => $admin->id, 'code' => 'SEQ-'.bin2hex(random_bytes(5)), 'title' => 'Jalur belajar', 'status' => 'published', 'grade' => 10, 'phase' => 'E', 'sort_order' => 1, 'sequential_learning' => true]);
        $m->rombels()->attach($r->id);
        $sections = [];
        for ($i = 0; $i < 3; $i++) {
            $sections[] = $m->sections()->create(['title' => 'Bagian '.$i, 'kind' => 'theory', 'content' => 'Isi bagian '.$i, 'sort_order' => $i, 'is_required' => false, 'is_published' => true, 'progress_weight' => 1]);
        }
        $a = app(ActivityService::class)->save($admin, $m, ['title' => 'Game wajib', 'kind' => 'matching', 'module_section_id' => $sections[1]->id, 'is_published' => true, 'is_required' => true, 'progress_weight' => 1, 'sort_order' => 1, 'passing_score' => 80, 'max_attempts' => 3, 'duration_minutes' => 15, 'question_count' => 1, 'random_questions' => true, 'shuffle_options' => true, 'min_active_seconds' => 0, 'level' => 1, 'game_items' => "A | Satu\nB | Dua"]);

        return [$admin, $student, $r, $m, $sections, $a];
    }

    public function test_sections_and_activities_cannot_be_skipped_and_acknowledgement_cannot_fake_a_pass(): void
    {
        [$admin,$student,,$m,$s,$a] = $this->fixture();
        $this->actingAs($student);
        $url = fn ($section) => '/siswa/materi/'.$m->id.'/submateri/'.$section->id;
        $this->get($url($s[0]))->assertOk()->assertSee('Selesaikan bagian ini dahulu');
        $this->get($url($s[1]))->assertForbidden();
        $this->get('/siswa/aktivitas/'.$a->id)->assertForbidden();
        $this->post('/siswa/interaktif/aktivitas/'.$a->id.'/mulai')->assertForbidden();
        $this->post($url($s[1]).'/selesai')->assertForbidden();
        $this->post('/siswa/baca/'.$s[1]->id.'/mulai')->assertForbidden();
        $this->post($url($s[0]).'/selesai')->assertRedirect();
        $this->post($url($s[0]).'/selesai')->assertRedirect();
        $this->assertSame(1, DB::table('section_completions')->where('user_id', $student->id)->count());
        $progress = ModuleProgress::where('user_id', $student->id)->where('module_id', $m->id)->firstOrFail();
        $this->assertSame(33.33, $progress->completion_percent);
        $this->assertSame(1, $progress->completed_items);
        $this->assertSame(3, $progress->required_items);
        $this->get($url($s[1]))->assertOk()->assertSee('✓')->assertSee('33.33%');
        $this->post($url($s[1]).'/selesai')->assertUnprocessable();
        $this->get($url($s[2]))->assertForbidden();
        ActivityProgress::create(['user_id' => $student->id, 'activity_id' => $a->id, 'status' => 'completed', 'completed_at' => now(), 'started_at' => now(), 'last_activity_at' => now(), 'best_score' => 100]);
        app(ProgressService::class)->recalculate($student, $m);
        $this->assertSame(66.67, $progress->fresh()->completion_percent);
        $this->get($url($s[2]))->assertOk();
        $this->post($url($s[2]).'/selesai')->assertRedirect();
        $this->assertSame(100.0, $progress->fresh()->completion_percent);
        $this->assertSame('completed', $progress->fresh()->status);
        $this->assertSame(2, DB::table('section_completions')->where('user_id', $student->id)->count());
        $this->actingAs($admin)->get('/pengajaran/modul/'.$m->id.'/preview?section='.$s[2]->id)->assertOk()->assertDontSee('data-reading-tracker', false);
    }

    public function test_later_module_stays_locked_even_when_filtering_or_using_direct_url(): void
    {
        [$admin,$student,$r,$m] = $this->fixture();
        $later = Module::create(['created_by' => $admin->id, 'code' => 'NEXT-'.bin2hex(random_bytes(5)), 'title' => 'Modul sesudahnya', 'status' => 'published', 'grade' => 10, 'phase' => 'E', 'sort_order' => 2, 'sequential_learning' => true]);
        $later->rombels()->attach($r->id);
        $section = $later->sections()->create(['title' => 'Lanjutan', 'kind' => 'theory', 'content' => 'Belum boleh dibaca', 'is_published' => true, 'is_required' => false, 'sort_order' => 1, 'progress_weight' => 1]);
        $this->actingAs($student)->get('/siswa/materi?q=Modul%20sesudahnya')->assertOk()->assertSee('Selesaikan materi sebelumnya');
        $this->get('/siswa/materi/'.$later->id.'/submateri/'.$section->id)->assertForbidden();
        ModuleProgress::create(['user_id' => $student->id, 'module_id' => $m->id, 'status' => 'completed', 'completion_percent' => 100, 'required_items' => 2, 'completed_items' => 2]);
        $this->get('/siswa/materi/'.$later->id.'/submateri/'.$section->id)->assertOk();
    }

    public function test_required_game_can_complete_without_an_extra_checkpoint_question(): void
    {
        [,$student,,$module,$sections,$activity]=$this->fixture();
        $sections[1]->update(['is_required'=>true]);
        $this->actingAs($student)->post('/siswa/materi/'.$module->id.'/submateri/'.$sections[0]->id.'/selesai')->assertRedirect();
        $sequence=app(\App\Services\LearningSequence::class);
        $this->assertFalse($sequence->states($student,$module)[$sections[1]->id]['complete']);
        ActivityProgress::create(['user_id'=>$student->id,'activity_id'=>$activity->id,'status'=>'completed','completed_at'=>now(),'started_at'=>now(),'last_activity_at'=>now(),'best_score'=>100]);
        $this->assertTrue($sequence->states($student,$module)[$sections[1]->id]['complete']);
        $this->assertTrue($sequence->allows($student,$sections[2]));
    }
}
