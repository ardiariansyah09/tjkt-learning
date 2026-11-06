<?php
// Run from the review checkout. Production activation is wrapped by a backup script.
$review='/home/adminnazh/tjkt-lms-review-20261028';$production='/var/www/tjkt-learning';
$target=$argv[1]??'';
if(!in_array($target,[$review,$production],true)||($argv[2]??'')!=='--apply')throw new RuntimeException('Explicit known target and --apply required.');
require $target.'/vendor/autoload.php';$app=require $target.'/bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if(base_path()!==$target)throw new RuntimeException('Wrong application.');
use Illuminate\Support\Facades\DB;
use App\Models\Module;
$manifest=app(App\Services\LearningPackage::class)->manifest();
if(count($manifest)!==56)throw new RuntimeException('Expected reviewed 56-module release.');
$catalog=json_decode(file_get_contents($review.'/release-catalog.json'),true,512,JSON_THROW_ON_ERROR);
$byId=array_column($catalog,null,'id');$service=app(App\Services\LearningPackage::class);
$before=[];$existing=Module::whereNotNull('package_slug')->get();
foreach($existing as $module){
 $next=collect($manifest)->firstWhere('id',$module->package_slug);if(!$next)throw new RuntimeException('Existing module removed.');
 $prior=$service->entry($module);
 $schema=fn($entry)=>[$entry['id'],$entry['key'],array_map(fn($s)=>[$s['id'],$s['threshold']],$entry['stages'])];
 if($schema($prior)!==$schema($next))throw new RuntimeException('Assessment schema differs: '.$module->package_slug);
 $before[$module->id]=['version'=>$module->package_version,'entry'=>$prior];
}
$protected=[];
foreach(['package_snapshots','module_progress'] as $table)$protected[$table]=DB::table($table)->orderBy('id')->get()->mapWithKeys(fn($row)=>[$row->id=>hash('sha256',json_encode($row))])->all();
$stored=app(App\Services\PackageContentStore::class)->import($manifest);
$author=App\Models\User::where('role','admin')->where('is_active',true)->firstOrFail();
$new=[];
DB::transaction(function()use($manifest,$byId,$service,$author,&$new,$before){
 app(App\Services\PrerequisiteService::class)->lockGraph();
 foreach($manifest as $index=>$entry){
  $module=Module::withTrashed()->where('package_slug',$entry['id'])->lockForUpdate()->first();
  $version=hash('sha256',json_encode($entry));
  if(!$module){
   $module=Module::create(['code'=>'PKG-'.substr(hash('sha256',$entry['id']),0,20),'package_slug'=>$entry['id'],'package_version'=>$version,'title'=>$entry['title'],'description'=>$entry['description'],'phase'=>$entry['phase'],'grade'=>$entry['grade'],'competency'=>$entry['category'],'objectives'=>'Pembelajaran mengacu ATP sekolah; praktik model dan penerimaan sesuai topik.','sort_order'=>1000+$index,'status'=>'published','published_at'=>now(),'created_by'=>$author->id,'sequential_learning'=>false]);
   foreach($entry['stages'] as $i=>$stage)$module->sections()->create(['title'=>$stage['title'],'kind'=>'theory','content'=>'Materi interaktif terintegrasi pada halaman LMS.','sort_order'=>$i,'is_published'=>true,'is_required'=>true,'progress_weight'=>1]);
   $new[]=$entry['id'];
  }else{
   if($module->trashed())throw new RuntimeException('Unexpected archived package.');
   $prior=$before[$module->id]['entry'];$active=DB::table('learning_package_content_revisions')->where('version',$module->package_version)->value('release')??$prior['contentVersion'];
   DB::table('learning_package_content_revisions')->updateOrInsert(['version'=>$module->package_version],['release'=>$entry['contentVersion'],'previous_release'=>$active,'reason'=>'ATP 2026-2027 and browser VM/OS simulators','created_at'=>now(),'updated_at'=>now()]);
  }
  $meta=$byId[$entry['id']];
  $module->update(['title'=>$entry['title'],'description'=>$entry['description'],'competency'=>$entry['category'],'sort_order'=>1000+$entry['grade']*10000+($meta['groupOrder']??0)*100+($meta['order']??0)]);
 }
 foreach($manifest as $entry){
  $module=Module::where('package_slug',$entry['id'])->firstOrFail();$required=Module::whereIn('package_slug',$entry['prerequisites'])->pluck('id')->all();
  $module->prerequisites()->where('type','module_completed')->whereNotIn('required_module_id',$required)->delete();
  foreach($required as $id)$module->prerequisites()->firstOrCreate(['required_module_id'=>$id,'type'=>'module_completed'],['min_score'=>null]);
 }
 foreach(App\Models\Rombel::where('is_active',true)->get() as $class){$ids=Module::whereNotNull('package_slug')->where('status','published')->where('grade',$class->grade)->pluck('id')->all();app(App\Services\PackageAssignments::class)->includePrerequisites($class,$ids);}
 foreach($before as $id=>$prior)if(Module::findOrFail($id)->package_version!==$prior['version'])throw new RuntimeException('Existing assessment version changed.');
 app(App\Services\AuditService::class)->record('packages.curriculum_updated',$author->id,['release'=>$manifest[0]['contentVersion'],'new_modules'=>$new,'preserved_assessment_versions'=>count($before)]);
});
foreach($protected as $table=>$rows){$after=DB::table($table)->whereIn('id',array_keys($rows))->orderBy('id')->get()->mapWithKeys(fn($row)=>[$row->id=>hash('sha256',json_encode($row))])->all();if($after!==$rows)throw new RuntimeException('Existing learner records changed: '.$table);}
$out=['modules'=>Module::whereNotNull('package_slug')->where('status','published')->count(),'newModules'=>$new,'preservedAssessmentVersions'=>count($before),'preservedSnapshotRows'=>count($protected['package_snapshots']),'preservedProgressRows'=>count($protected['module_progress']),'content'=>$stored,'release'=>$manifest[0]['contentVersion'],'classes'=>App\Models\Rombel::where('is_active',true)->count()];
file_put_contents($review.'/storage/app/review-artifacts/curriculum-'.($target===$production?'production':'review').'.json',json_encode($out,JSON_PRETTY_PRINT));echo json_encode($out,JSON_PRETTY_PRINT)."\n";
