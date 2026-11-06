<?php

namespace Tests\Feature;

use App\Models\ModuleProgress;
use App\Models\Rombel;
use App\Models\User;
use App\Services\EntrepreneurshipTjktModule;
use App\Services\FirstTjktModule;
use App\Services\StudentLessonRefresh;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class StudentLessonRefreshTest extends TestCase
{
    use DatabaseTransactions;

    public function test_content_refresh_preserves_assessment_versions_student_progress_and_teacher_edits(): void
    {
        Storage::fake('local');
        $admin = User::create(['name' => 'Uji revisi', 'username' => 'revisi_'.bin2hex(random_bytes(5)), 'password' => 'PasswordUji2026!', 'role' => 'admin', 'is_active' => true]);
        $student = User::create(['name' => 'Siswa revisi', 'username' => 'revisi_s_'.bin2hex(random_bytes(5)), 'password' => 'PasswordUji2026!', 'role' => 'siswa', 'is_active' => true]);
        for ($i = 1; $i <= 4; $i++) {
            Rombel::create(['name' => 'TJKT X-'.$i, 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true]);
        }
        $this->actingAs($admin);
        $modules = [app(FirstTjktModule::class)->create($admin), app(EntrepreneurshipTjktModule::class)->create($admin)];
        $before = [];
        foreach ($modules as $i => $module) {
            $source = $i === 0 ? 'profesi-tjkt' : 'usaha-tjkt';
            preg_match_all('/<!-- section:[a-z_]+\|([^\n]+) -->\s*(.*?)(?=<!-- section:|\z)/s', file_get_contents(resource_path('learning/revisions/'.$source.'-before-studio.md')), $matches, PREG_SET_ORDER);
            $contents = collect($matches)->mapWithKeys(fn ($m) => [trim($m[1]) => trim($m[2])]);
            foreach ($module->sections as $section) {
                $section->update(['content' => $contents[$section->title]]);
            }
            $before[$module->id] = ['sections' => $module->sections()->pluck('id')->all(), 'versions' => $module->activities()->pluck('current_version_id', 'id')->all()];
        }
        $modules[0]->update(['status' => 'published', 'published_at' => now()]);
        $progress = ModuleProgress::create(['user_id' => $student->id, 'module_id' => $modules[0]->id, 'completion_percent' => 37.5, 'required_items' => 14, 'completed_items' => 5, 'status' => 'in_progress']);
        $service = app(StudentLessonRefresh::class);
        $this->assertSame(28, $service->apply($admin)['changed_sections']);
        $this->assertSame(37.5, (float) $progress->fresh()->completion_percent);
        $result = $service->apply($admin, true);
        $this->assertSame(28, $result['changed_sections']);
        Storage::disk('local')->assertExists($result['backup']);
        $backup = json_decode(Storage::disk('local')->get($result['backup']), true);
        $this->assertCount(28, $backup['sections']);
        $this->assertSame('published', $modules[0]->fresh()->status);
        $this->assertSame('draft', $modules[1]->fresh()->status);
        $this->assertSame(37.5, (float) $progress->fresh()->completion_percent);
        foreach ($modules as $module) {
            $this->assertSame($before[$module->id]['sections'], $module->sections()->pluck('id')->all());
            $this->assertSame($before[$module->id]['versions'], $module->activities()->pluck('current_version_id', 'id')->all());
        }
        $this->assertSame(0, $service->apply($admin, true)['changed_sections']);
        $edited = $modules[1]->sections()->firstOrFail();
        $edited->update(['content' => 'Suntingan guru yang perlu dipertahankan.']);
        try {
            $service->apply($admin, true);
            $this->fail('Suntingan guru tidak boleh ditimpa.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('section', $e->errors());
        }
        $this->assertSame('Suntingan guru yang perlu dipertahankan.', $edited->fresh()->content);
    }
}
