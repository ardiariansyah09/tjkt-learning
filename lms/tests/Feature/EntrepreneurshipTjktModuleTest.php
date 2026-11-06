<?php

namespace Tests\Feature;

use App\Models\Module;
use App\Models\ModuleProgress;
use App\Models\ModuleSection;
use App\Models\Rombel;
use App\Models\User;
use App\Services\EntrepreneurshipTjktModule;
use App\Services\LearningAccessService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class EntrepreneurshipTjktModuleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_module_has_aligned_assessments_safe_previews_and_preserves_teacher_edits(): void
    {
        $users = [];
        foreach (['admin', 'guru', 'siswa'] as $role) {
            $users[$role] = User::create(['name' => 'Uji materi usaha', 'username' => 'usaha_'.bin2hex(random_bytes(6)), 'password' => 'UjiPassword2026!', 'role' => $role, 'is_active' => true, 'must_change_password' => false]);
        }
        for ($i = 1; $i <= 4; $i++) {
            $r = Rombel::create(['name' => 'TJKT X-'.$i, 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true]);
            $r->teachers()->attach($users['guru']->id);
            if ($i === 1) {
                $r->students()->attach($users['siswa']->id, ['joined_at' => now()]);
                $firstRombel = $r;
            }
        }
        $this->actingAs($users['admin']);
        $service = app(EntrepreneurshipTjktModule::class);
        $m = $service->create($users['admin']);
        $this->assertSame('draft', $m->status);
        $this->assertNull($m->published_at);
        $this->assertTrue($m->sequential_learning);
        $this->assertSame(270, $m->estimated_minutes);
        $this->assertSame(4, $m->rombels()->count());
        $this->assertSame(14, $m->sections()->count());
        $this->assertSame(13, $m->activities()->count());
        $this->assertSame(8, $m->activities()->where('kind', 'checkpoint')->count());
        $this->assertSame(12, $m->activities()->where('kind', 'quiz')->firstOrFail()->questions()->count());
        $this->assertSame(3, $m->activities()->where('is_required', false)->count());
        $this->assertSame(1, $m->activities()->where('kind', 'practice')->count());
        $sections = $m->sections()->orderBy('sort_order')->get();
        foreach ($sections as $section) {
            $this->assertArrayHasKey($section->kind, ModuleSection::KINDS);
            if ($section->is_required) {
                $this->assertSame(1, $section->activities()->where('kind', 'checkpoint')->count());
            }
            $this->get('/pengajaran/modul/'.$m->id.'/preview?section='.$section->id)
                ->assertOk()->assertSee('business-diagram')->assertSee('lesson-reading')->assertDontSee('data-reading-tracker', false);
        }
        $this->get('/pengajaran/modul/'.$m->id.'/preview?section='.$sections[6]->id)->assertOk()->assertSee('biaya-layanan.csv')->assertSee('Rp130.000');
        $before = ModuleProgress::count();
        $this->actingAs($users['guru'])->get('/pengajaran/modul/'.$m->id.'/preview?mode=student')->assertOk()->assertSee('RUANG SISWA')->assertSee('business-diagram')->assertDontSee('data-reading-tracker', false);
        $this->assertSame($before, ModuleProgress::count());
        $this->actingAs($users['siswa'])->get('/siswa/materi/'.$m->id)->assertNotFound();
        $m->update(['status' => 'published', 'published_at' => now()]);
        $previous = Module::create(['created_by' => $users['admin']->id, 'code' => 'UJI-PREV-'.bin2hex(random_bytes(4)), 'title' => 'Materi pendahulu', 'grade' => 10, 'sort_order' => 10, 'status' => 'published', 'published_at' => now()]);
        $previous->rombels()->attach($firstRombel->id);
        $this->assertFalse(app(LearningAccessService::class)->accessible($users['siswa'], $m));
        ModuleProgress::create(['user_id' => $users['siswa']->id, 'module_id' => $previous->id, 'completion_percent' => 100, 'required_items' => 1, 'completed_items' => 1, 'status' => 'completed']);
        $this->assertTrue(app(LearningAccessService::class)->accessible($users['siswa'], $m));
        $m->update(['title' => 'Penyesuaian pengajar']);
        $this->assertSame($m->id, $service->create($users['admin'])->id);
        $this->assertSame('Penyesuaian pengajar', $m->fresh()->title);
        $this->assertSame('published', $m->fresh()->status);
        $this->assertSame(13, $m->activities()->count());
        $this->assertSame(1, Module::where('code', EntrepreneurshipTjktModule::CODE)->count());
    }
}
