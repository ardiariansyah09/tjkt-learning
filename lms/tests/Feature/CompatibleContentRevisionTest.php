<?php
namespace Tests\Feature;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
class CompatibleContentRevisionTest extends TestCase {
 use DatabaseTransactions;
 public function test_compatible_revision_reads_new_database_bytes_without_mutating_assessment_definition(): void {
  $entry=['id'=>'revision-test','contentVersion'=>str_repeat('a',64),'key'=>'tjkt:revision-test:course:v2','stages'=>[['id'=>'orientasi','threshold'=>75]]];$version=hash('sha256',json_encode($entry));$new=str_repeat('b',64);
  DB::table('learning_package_definitions')->insert(['version'=>$version,'slug'=>$entry['id'],'definition'=>json_encode($entry),'created_at'=>now(),'updated_at'=>now()]);
  foreach([$entry['contentVersion']=>'old content',$new=>'new content'] as $release=>$content)DB::table('learning_package_assets')->insert(['release'=>$release,'path'=>'assets/js/test.js','sha256'=>hash('sha256',$content),'content_base64'=>base64_encode($content),'created_at'=>now(),'updated_at'=>now()]);
  $service=app(\App\Services\LearningPackage::class);$this->assertSame('old content',$service->asset($entry,'assets/js/test.js'));
  DB::table('learning_package_content_revisions')->insert(['version'=>$version,'release'=>$new,'previous_release'=>$entry['contentVersion'],'reason'=>'test compatible revision','created_at'=>now(),'updated_at'=>now()]);
  $this->assertSame('new content',$service->asset($entry,'assets/js/test.js'));$this->assertSame($entry,json_decode(DB::table('learning_package_definitions')->where('version',$version)->value('definition'),true));
  $this->assertSame('old content',base64_decode(DB::table('learning_package_assets')->where('release',$entry['contentVersion'])->value('content_base64')));
 }
 public function test_simulator_loader_uses_module_asset_url_for_native_lms(): void {
  $entry=collect(app(\App\Services\LearningPackage::class)->manifest())->firstWhere('id','instalasi-komputer-dasar');$this->assertNotNull($entry);
  $content=app(\App\Services\LearningPackage::class)->asset($entry,'assets/js/foundation-course.js');
  $this->assertStringContainsString('new URL(`../../data/${id}.json`,import.meta.url)',$content);
  $this->assertStringNotContainsString('fetch(`../../../data/',$content);
 }
}
