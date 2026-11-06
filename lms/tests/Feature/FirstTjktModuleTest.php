<?php

namespace Tests\Feature;

use App\Models\Module;
use App\Models\ModuleProgress;
use App\Models\Rombel;
use App\Models\User;
use App\Services\FirstTjktModule;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class FirstTjktModuleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_complete_first_module_is_repeatable_draft_and_not_accessible_to_students(): void
    {
        $admin = User::create(['name' => 'Admin modul', 'username' => 'materi_'.bin2hex(random_bytes(5)), 'password' => 'PasswordUji2026!', 'role' => 'admin', 'is_active' => true, 'must_change_password' => false]);
        $teacher = User::create(['name' => 'Guru modul', 'username' => 'guru_'.bin2hex(random_bytes(5)), 'password' => 'PasswordUji2026!', 'role' => 'guru', 'is_active' => true, 'must_change_password' => false]);
        $student = User::create(['name' => 'Siswa modul', 'username' => 'siswa_'.bin2hex(random_bytes(5)), 'password' => 'PasswordUji2026!', 'role' => 'siswa', 'is_active' => true, 'must_change_password' => false]);
        for ($i = 1; $i <= 4; $i++) {
            $r = Rombel::create(['name' => 'TJKT X-'.$i, 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true]);
            $r->teachers()->attach($teacher->id);
            if ($i === 1) {
                $r->students()->attach($student->id, ['joined_at' => now()]);
            }
        }
        $this->actingAs($admin);
        $service = app(FirstTjktModule::class);
        $m = $service->create($admin);
        $this->assertSame('draft', $m->status);
        $this->assertNull($m->published_at);
        $this->assertSame('E', $m->phase);
        $this->assertSame(10, $m->grade);
        $this->assertSame(180, $m->estimated_minutes);
        $this->assertSame(4, $m->rombels()->count());
        $this->assertSame(14, $m->sections()->count());
        $this->assertSame(8, $m->sections()->where('is_required', true)->count());
        $this->assertSame(13, $m->activities()->count());
        $this->assertSame(8, $m->activities()->where('kind', 'checkpoint')->count());
        $this->assertSame(12, $m->activities()->where('kind', 'quiz')->firstOrFail()->questions()->count());
        $this->assertSame(1, $m->activities()->where('kind', 'practice')->count());
        $this->assertSame(3, $m->activities()->where('is_required', false)->count());
        foreach ($m->sections()->where('is_required', true)->get() as $section) {
            $this->assertSame(1, $section->activities()->where('kind', 'checkpoint')->count());
        }
        $this->assertSame($m->id, $service->create($admin)->id);
        $this->assertSame(1, Module::where('code', FirstTjktModule::CODE)->count());
        $before = ModuleProgress::count();
        $this->get('/pengajaran/modul/'.$m->id.'/preview')->assertOk()->assertViewIs('learning.student.section')->assertSee('Pratinjau pengajar')->assertSee('class="lesson-reading"', false)->assertDontSee('class="deep-reading"', false)->assertSee('Berikutnya')->assertSee('role="progressbar"', false)->assertDontSee('data-reading-tracker', false)->assertDontSee('<!-- section:', false);
        $challenge = $m->sections()->where('kind', 'challenge')->firstOrFail();
        $this->get('/pengajaran/modul/'.$m->id.'/preview?section='.$challenge->id)->assertOk()->assertSee('T-201')->assertSee('Sebelumnya');
        $reflection = $m->sections()->where('kind', 'reflection')->firstOrFail();
        $this->get('/pengajaran/modul/'.$m->id.'/preview?section='.$reflection->id)->assertOk()->assertSee('matriks-kompetensi.csv');
        $this->get('/pengajaran/modul/'.$m->id.'/preview?section=9999999')->assertNotFound();
        $this->assertSame($before, ModuleProgress::count());
        $this->get('/pengajaran/modul/'.$m->id.'/aktivitas')->assertOk()->assertSee('Laporan teknisi pemula');
        $this->actingAs($teacher)->get('/pengajaran/modul/'.$m->id.'/preview')->assertOk();
        $this->get('/pengajaran/modul/'.$m->id.'/preview?mode=student')->assertOk()->assertSee('RUANG SISWA')->assertSee('Keluar pratinjau')->assertDontSee('Data rayon')->assertSee('mode=student', false)->assertDontSee('data-reading-tracker', false);
        $this->get('/pengajaran/modul/'.$m->id.'/preview?mode=teacher')->assertOk()->assertSee('Mode pengajar')->assertSee('Buka menu akun');
        $this->get('/pengajaran/modul/'.$m->id.'/preview?mode=admin')->assertSessionHasErrors('mode');
        $this->assertSame($before, ModuleProgress::count());
        $this->assertSame('guru', $teacher->fresh()->role);

        $this->actingAs($student)->get('/siswa/materi/'.$m->id)->assertNotFound();
        $activity = $m->activities()->where('kind', 'matching')->firstOrFail();
        $this->post('/siswa/interaktif/aktivitas/'.$activity->id.'/mulai')->assertForbidden();
        $this->assertSame(0, $activity->interactiveAttempts()->count());
        $m->update(['status' => 'published', 'published_at' => now()]);
        ModuleProgress::create(['user_id' => $student->id, 'module_id' => $m->id, 'completion_percent' => 37.5, 'required_items' => 10, 'completed_items' => 3, 'status' => 'in_progress']);
        $first = $m->sections()->firstOrFail();
        $this->get('/siswa/materi/'.$m->id.'/submateri/'.$first->id)->assertOk()->assertViewIs('learning.student.section')->assertSee('aria-valuenow="37.5"', false)->assertSee('data-reading-tracker', false)->assertSee('Selesaikan bagian ini dahulu');

    }
}
