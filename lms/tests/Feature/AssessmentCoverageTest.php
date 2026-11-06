<?php
namespace Tests\Feature;

use App\Models\Module;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class AssessmentCoverageTest extends TestCase
{
 use DatabaseTransactions;
 public function test_lms_uses_balanced_final_question_selection_without_rekeying_progress(): void
 {
  $admin=User::create(['name'=>'Coverage Admin','username'=>'coverage_'.bin2hex(random_bytes(5)),'password'=>'PasswordTest2026!','role'=>'admin','is_active'=>true,'must_change_password'=>false]);
  $entry=app(\App\Services\LearningPackage::class)->manifest()[0];
  $module=Module::create(['code'=>'COVER-'.bin2hex(random_bytes(4)),'title'=>$entry['title'],'package_slug'=>$entry['id'],'package_version'=>hash('sha256',json_encode($entry)),'status'=>'draft','created_by'=>$admin->id,'phase'=>'E','grade'=>10]);
  $this->actingAs($admin)->get(route('packages.file',[$module,'assets/js/foundation-check.js']))->assertOk()->assertSee('selectFinalQuestions(course.chapters,10)',false)->assertDontSee('bank.slice(0,10)',false)->assertSee('storageVersion:2',false);
 }
}
