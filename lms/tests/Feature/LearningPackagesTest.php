<?php

namespace Tests\Feature;

use App\Models\Module;
use App\Models\ModuleProgress;
use App\Models\Rombel;
use App\Models\User;
use App\Services\LearningPackage;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LearningPackagesTest extends TestCase
{
    use DatabaseTransactions;

    private function user(string $role): User
    {
        return User::create(['name'=>'Review '.$role,'username'=>'pkg_'.bin2hex(random_bytes(5)), 'password'=>'ReviewOnly2026!', 'role'=>$role,'is_active'=>true,'must_change_password'=>false]);
    }

    private function fixture(): array
    {
        $admin=$this->user('admin');$student=$this->user('siswa');$teacher=$this->user('guru');
        $entry=app(LearningPackage::class)->manifest()[0];
        $module=Module::create(['code'=>'T-'.bin2hex(random_bytes(5)), 'title'=>$entry['title'],'package_slug'=>$entry['id'],'package_version'=>hash('sha256',json_encode($entry)), 'status'=>'published','created_by'=>$admin->id,'phase'=>'E','grade'=>10]);
        $rombel=Rombel::create(['name'=>'Review '.bin2hex(random_bytes(4)),'grade'=>10,'academic_year'=>'2026/2027','semester'=>1,'is_active'=>true]);
        $rombel->students()->attach($student->id,['joined_at'=>now()]);$rombel->teachers()->attach($teacher->id);$module->rombels()->attach($rombel->id);
        return [$admin,$student,$teacher,$module,$entry,$rombel];
    }

    private function payload(User $user, Module $module, array $entry, int $count, int $revision=0): array
    {
        $state=['passed'=>[],'scores'=>[]];
        foreach(array_slice($entry['stages'],0,$count) as $stage){$state['passed'][$stage['id']]=85;$state['scores'][$stage['id']]=85;}
        return ['owner'=>$user->id,'revision'=>$revision,'version'=>$module->package_version,'source'=>'browser','data'=>[$entry['key']=>json_encode($state)]];
    }

    public function test_progress_final_grade_and_certificate_eligibility_match_all_stages(): void
    {
        [,$student,$teacher,$module,$entry]=$this->fixture();
        $this->actingAs($student)->postJson(route('packages.sync',$module),$this->payload($student,$module,$entry,1))->assertOk()->assertJsonPath('complete',false);
        $row=ModuleProgress::where('module_id',$module->id)->firstOrFail();$this->assertSame(1,$row->completed_items);$this->assertNull($row->final_score);
        $this->postJson(route('packages.sync',$module),$this->payload($student,$module,$entry,count($entry['stages']),1))->assertOk()->assertJsonPath('complete',true);
        $this->assertSame(85.0,$row->fresh()->final_score);$this->assertSame(100.0,$row->fresh()->completion_percent);
        $this->actingAs($teacher)->get(route('assessment.reports.detail',[$student,$module]))->assertOk()->assertSee('Memenuhi syarat sertifikat')->assertSee('Evaluasi akhir');
    }

    public function test_foreign_account_foreign_keys_and_stale_revision_are_rejected(): void
    {
        [,$student,,$module,$entry]=$this->fixture();$payload=$this->payload($student,$module,$entry,1);
        $this->actingAs($this->user('siswa'))->postJson(route('packages.sync',$module),$payload)->assertForbidden();
        $this->actingAs($student)->postJson(route('packages.sync',$module),array_replace($payload,['owner'=>999999]))->assertForbidden();
        $this->postJson(route('packages.sync',$module),array_replace($payload,['data'=>['tjkt:other:course:v2'=>'{}']]))->assertUnprocessable();
        $this->postJson(route('packages.sync',$module),$payload)->assertOk();
        $this->postJson(route('packages.sync',$module),$payload)->assertOk()->assertJsonPath('revision',1);
        $this->postJson(route('packages.sync',$module),$this->payload($student,$module,$entry,2))->assertConflict();
        $this->assertSame(1,DB::table('package_snapshots')->where('module_id',$module->id)->count());
        $this->assertSame(1,DB::table('package_snapshots')->where('module_id',$module->id)->value('revision'));
    }

    public function test_preview_does_not_write_student_results_and_assets_require_access(): void
    {
        [,$student,$teacher,$module,$entry]=$this->fixture();
        $this->get(route('packages.launch',$module))->assertRedirect('/login');
        $this->actingAs($teacher)->get(route('packages.file',[$module,$entry['path'].'index.html']))->assertRedirect(route('packages.launch',$module));
        $this->get(route('packages.launch',$module))->assertOk()->assertSee('"preview":true',false)->assertSee('lms-course-bridge.js');
        $this->postJson(route('packages.sync',$module),$this->payload($student,$module,$entry,1))->assertForbidden();
        $this->get(route('packages.file',[$module,'assets/js/module-certificate.js']))->assertOk();
        $this->get(route('packages.file',[$module,'composer.json']))->assertNotFound();
        $this->actingAs($this->user('siswa'))->get(route('packages.file',[$module,$entry['path'].'index.html']))->assertForbidden();
        $this->assertSame(0,DB::table('package_snapshots')->where('module_id',$module->id)->count());
    }

    public function test_passing_only_the_final_stage_cannot_complete_a_module(): void
    {
        [,$student,,$module,$entry]=$this->fixture();$last=end($entry['stages']);
        $payload=$this->payload($student,$module,$entry,0);$payload['data'][$entry['key']]=json_encode(['passed'=>[$last['id']=>100]]);
        $this->actingAs($student)->postJson(route('packages.sync',$module),$payload)->assertOk()->assertJsonPath('complete',false)->assertJsonPath('percent',0);
    }

    public function test_teacher_has_three_main_links_admin_four_and_advanced_filters_are_collapsed(): void
    {
        [$admin,,$teacher]=$this->fixture();
        foreach([[$teacher,3],[$admin,4]] as [$user,$count]){
            $html=$this->actingAs($user)->get(route($user->dashboard()))->assertOk()->getContent();
            preg_match('/<nav[^>]*aria-label="Menu utama"[^>]*>(.*?)<\/nav>/s',$html,$match);
            $this->assertSame($count,substr_count($match[1],'<a '));
            $this->assertStringNotContainsString('Aktivitas akun terbaru',$html);
        }
        $this->actingAs($teacher)->get(route('assessment.reports.index'))->assertOk()->assertSee('Filter lainnya dan arsip')->assertSee('Evaluasi akhir / kuis');
    }

    public function test_teacher_cannot_change_another_class_or_publish_a_package(): void
    {
        [,$student,$teacher,$module,$entry,$rombel]=$this->fixture();
        $this->actingAs($teacher)->post(route('packages.assign',$module),['status'=>'draft','rombel_ids'=>[$rombel->id]])->assertForbidden();
        $other=Rombel::create(['name'=>'Other','grade'=>10,'academic_year'=>'2026/2027','semester'=>1,'is_active'=>true]);
        $this->post(route('packages.assign',$module),['status'=>'published','rombel_ids'=>[$other->id]])->assertForbidden();
        $this->post(route('packages.assign',$module),['status'=>'published','rombel_ids'=>[$rombel->id]])->assertRedirect();
    }

    public function test_all_manifest_stages_match_expected_catalog_and_version(): void
    {
        $manifest=app(LearningPackage::class)->manifest();
        $this->assertCount(56,$manifest);$this->assertSame(642,array_sum(array_map(fn($entry)=>count($entry['stages']),$manifest)));
        foreach($manifest as $entry){
            $this->assertSame(80,end($entry['stages'])['threshold']);
            $this->assertCount(count($entry['stages']),array_unique(array_column($entry['stages'],'id')));
        }
    }

    public function test_import_is_repeatable_and_does_not_replace_existing_material(): void
    {
        $admin=$this->user('admin');$old=[];
        foreach(['Materi lama satu','Materi lama dua'] as $title)$old[]=Module::create(['code'=>'OLD-'.bin2hex(random_bytes(4)),'title'=>$title,'status'=>'draft','created_by'=>$admin->id]);
        $this->artisan('learning:import-packages',['--author'=>$admin->id])->assertSuccessful();
        $this->artisan('learning:import-packages',['--author'=>$admin->id])->assertSuccessful();
        $this->assertSame(56,Module::whereNotNull('package_slug')->count());
        $this->assertSame(642,DB::table('module_sections')->whereIn('module_id',Module::whereNotNull('package_slug')->select('id'))->count());
        $this->assertSame(0,Module::whereNotNull('package_slug')->where('status','published')->count());
        foreach($old as $module)$this->assertSame($module->title,$module->fresh()->title);
    }

    public function test_legacy_import_stays_labeled_and_journal_is_preserved(): void
    {
        [,$student,$teacher,$module,$entry]=$this->fixture();
        $payload=$this->payload($student,$module,$entry,1);$payload['source']='legacy-import';
        $key='tjkt:'.$entry['id'].':studio:v1';
        $payload['data'][$key]=json_encode(['journal'=>['evidence'=>'Bukti contoh dari perangkat lama'],'experiments'=>[]]);
        $this->actingAs($student)->postJson(route('packages.sync',$module),$payload)->assertOk();
        $payload['revision']=1;$payload['source']='browser';
        $this->postJson(route('packages.sync',$module),$payload)->assertOk();
        $row=app(LearningPackage::class)->snapshot($student,$module);
        $this->assertSame('legacy-import',$row->source);
        $this->assertSame($payload['data'][$key],json_decode($row->data,true)[$key]);
        $this->actingAs($teacher)->get(route('assessment.reports.detail',[$student,$module]))->assertOk()->assertSee('Bukti contoh dari perangkat lama')->assertSee('Diimpor dari perangkat lama');
    }

    public function test_short_activity_reports_and_atp_lab_results_are_visible_to_authorized_teacher_and_escaped(): void
    {
        [,$student,$teacher,$module,$entry]=$this->fixture();
        $payload=$this->payload($student,$module,$entry,1);
        $payload['data']['tjkt:'.$entry['id'].':activity-reports:v1']=json_encode(['lab'=>['activity'=>'Uji ATP','kind'=>'model','result'=>'<img src=x onerror=alert(1)>','conclusion'=>'Kernel route diperiksa'],'untrusted-shape'=>['kind'=>['unexpected'],'result'=>['unexpected']]]);
        $payload['data']['tjkt:'.$entry['id'].':atp-practice:bird:v1']=json_encode(['type'=>'bird','history'=>[['action'=>'test','applied'=>['kernel'=>true],'result'=>['steps'=>['Rute kernel tersedia']]]]]);
        $this->actingAs($student)->postJson(route('packages.sync',$module),$payload)->assertOk();
        $this->actingAs($teacher)->get(route('assessment.reports.detail',[$student,$module]))->assertOk()->assertSee('Laporan singkat dan latihan ATP')->assertSee('Kernel route diperiksa')->assertSee('Rute kernel tersedia')->assertDontSee('<img src=x onerror=alert(1)>',false);
    }

    public function test_class_assignment_is_scoped_and_keeps_existing_progress(): void
    {
        [$admin,$student,$teacher,$module,$entry,$rombel]=$this->fixture();
        $this->actingAs($student)->postJson(route('packages.sync',$module),$this->payload($student,$module,$entry,1))->assertOk();
        $this->actingAs($teacher)->get(route('packages.class.index',['rombel_id'=>$rombel->id]))->assertOk()->assertSee('Pilih semua materi');
        $other=Rombel::create(['name'=>'Other bulk','grade'=>10,'academic_year'=>'2026/2027','semester'=>1,'is_active'=>true]);
        $this->post(route('packages.class.store'),['rombel_id'=>$other->id,'module_ids'=>[$module->id]])->assertNotFound();
        $this->post(route('packages.class.store'),['rombel_id'=>$rombel->id,'module_ids'=>[]])->assertRedirect();
        $this->assertFalse($module->rombels()->where('rombels.id',$rombel->id)->exists());
        $this->assertSame(1,ModuleProgress::where('user_id',$student->id)->where('module_id',$module->id)->value('completed_items'));
        $this->actingAs($admin)->post(route('packages.class.store'),['rombel_id'=>$rombel->id,'module_ids'=>[$module->id]])->assertRedirect();
        $this->assertTrue($module->rombels()->where('rombels.id',$rombel->id)->exists());
    }

    public function test_entire_package_content_is_stored_and_served_from_database(): void
    {
        [,$student,,$module,$entry]=$this->fixture();
        $packages=app(LearningPackage::class);
        $store=app(\App\Services\PackageContentStore::class);
        $report=$store->import($packages->manifest());
        $this->assertSame(56,$report['definitions']);$this->assertGreaterThan(250,$report['assets']);
        $this->assertGreaterThan(1000000,$report['decodedBytes']);
        $this->assertSame($report,$store->import($packages->manifest()));
        foreach(Module::whereNotNull('package_slug')->get() as $package)$this->assertNotNull(DB::table('learning_package_definitions')->where('version',$package->package_version)->first());
        $bytes='body{color:navy}';
        DB::table('learning_package_assets')->insert(['release'=>$entry['contentVersion'],'path'=>'assets/database-only-proof.css','sha256'=>hash('sha256',$bytes),'content_base64'=>base64_encode($bytes),'created_at'=>now(),'updated_at'=>now()]);
        $this->actingAs($student)->get(route('packages.file',[$module,'assets/database-only-proof.css']))->assertOk()->assertContent(':is(#lms-learning-root,#lms-learning-outline){color:navy}');
        $this->assertSame($entry,$packages->entry($module));
    }

    public function test_cross_grade_prerequisite_is_available_without_faking_completion(): void
    {
        [$admin,$student,,$parent,,$class]=$this->fixture();
        $child=Module::create(['code'=>'CHILD-'.bin2hex(random_bytes(4)),'title'=>'Materi lanjutan kelas XI','status'=>'published','grade'=>11,'created_by'=>$admin->id]);
        $child->prerequisites()->create(['required_module_id'=>$parent->id,'type'=>'module_completed']);
        app(\App\Services\PackageAssignments::class)->includePrerequisites($class,[$child->id]);
        $this->assertTrue($child->rombels()->where('rombels.id',$class->id)->exists());
        $this->assertTrue($parent->rombels()->where('rombels.id',$class->id)->exists());
        $this->assertSame(0,ModuleProgress::where('user_id',$student->id)->count());
        $this->assertFalse(app(\App\Services\LearningAccessService::class)->accessible($student,$child));
    }

    public function test_lesson_is_a_native_lms_page_with_one_sidebar_and_no_portal_brand(): void
    {
        [,$student,$teacher,$module,$entry]=$this->fixture();
        $page=$this->actingAs($teacher)->get(route('packages.launch',$module))->assertOk()->assertViewIs('learning.package-lesson');
        $page->assertSee('id="sidebar"',false)->assertSee('id="lms-learning-outline"',false)->assertSee('id="lms-learning-root"',false)->assertSee('name="csrf-token"',false)->assertSee('"native":true',false);
        $page->assertDontSee('TJKT Learning Hub')->assertDontSee('Kembali ke Portal')->assertDontSee('<iframe',false)->assertDontSee('../../../index.html',false);
        $this->assertStringContainsString('/materi/'.$module->id.'/belajar',route('packages.launch',$module));
        $this->get('/paket/'.$module->id.'/buka')->assertRedirect(route('packages.launch',$module));
        $this->actingAs($student)->get(route('packages.launch',$module))->assertOk()->assertSee('"preview":false',false);
    }

    public function test_module_styles_do_not_escape_into_lms_navigation(): void
    {
        $scope=app(\App\Services\ScopedLessonStyles::class);
        $css=$scope->scope('body.dark .panel,.card{color:red}@media(max-width:600px){button:is(.a,.b){padding:2px}}@keyframes jump{from{opacity:0}to{opacity:1}}');
        $this->assertStringContainsString(':is(#lms-learning-root,#lms-learning-outline).dark .panel',$css);
        $this->assertStringContainsString(':is(#lms-learning-root,#lms-learning-outline) .card',$css);
        $this->assertStringContainsString('@media(max-width:600px){:is(#lms-learning-root,#lms-learning-outline) button:is(.a,.b)',$css);
        $this->assertStringContainsString('@keyframes jump{from{opacity:0}to{opacity:1}}',$css);
    }
}
