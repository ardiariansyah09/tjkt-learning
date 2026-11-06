<?php
$production='/var/www/tjkt-learning';$review='/home/adminnazh/tjkt-lms-review-20261028';
require $production.'/vendor/autoload.php';$app=require $production.'/bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if(base_path()!==$production)throw new RuntimeException('Wrong app.');
$db=Illuminate\Support\Facades\DB::class;$packages=App\Models\Module::whereNotNull('package_slug')->get();$service=app(App\Services\LearningPackage::class);
$html=0;$bytes=0;
foreach($packages as $module){
 if(!$db::table('learning_package_definitions')->where('version',$module->package_version)->exists())throw new RuntimeException('Missing definition.');
 $entry=$service->entry($module);$path=$entry['path'].'index.html';
 if(!$db::table('learning_package_assets')->where('release',$entry['contentVersion'])->where('path',$path)->exists())throw new RuntimeException('Missing database HTML.');
 $content=$service->asset($entry,$path);if(!str_contains(strtolower($content),'<!doctype html>'))throw new RuntimeException('Invalid HTML.');$html++;
}
foreach($db::table('learning_package_assets')->cursor() as $row){$content=base64_decode($row->content_base64,true);if($content===false||hash('sha256',$content)!==$row->sha256)throw new RuntimeException('Corrupt database asset.');$bytes+=strlen($content);}
$missing=0;$classes=App\Models\Rombel::where('is_active',true)->get();
foreach($classes as $class){$ids=$class->modules()->where('status','published')->pluck('modules.id')->all();foreach(App\Models\Module::whereIn('id',$ids)->get() as $module)foreach($module->prerequisites()->pluck('required_module_id') as $id)if(!in_array($id,$ids))$missing++;}
$context=stream_context_create(['http'=>['ignore_errors'=>true,'follow_location'=>0,'timeout'=>20]]);$body=file_get_contents('https://learning.tkjwikrama.my.id/login',false,$context);$status=$http_response_header[0]??'';
$result=['publishedModules'=>$packages->where('status','published')->count(),'visibleLegacyModules'=>App\Models\Module::whereNull('package_slug')->count(),'moduleStages'=>$db::table('module_sections')->whereIn('module_id',$packages->modelKeys())->whereNull('deleted_at')->count(),'databaseModuleHtml'=>$html,'databaseAssets'=>$db::table('learning_package_assets')->count(),'decodedContentBytes'=>$bytes,'classes'=>$classes->count(),'missingAssignedPrerequisites'=>$missing,'snapshotsTableReady'=>Illuminate\Support\Facades\Schema::hasTable('package_snapshots'),'finalScoreColumnReady'=>Illuminate\Support\Facades\Schema::hasColumn('module_progress','final_score'),'maintenanceOff'=>!is_file($production.'/storage/framework/down'),'httpsLoginStatus'=>$status,'loginValid'=>str_contains($body,'Masuk ke ruang belajar')];
if($result['publishedModules']!==53||$result['visibleLegacyModules']!==0||$html!==53||$missing||!$result['maintenanceOff']||!$result['loginValid'])throw new RuntimeException('Publication verification failed.');
file_put_contents($review.'/storage/app/review-artifacts/publication-verification.json',json_encode($result,JSON_PRETTY_PRINT));echo json_encode($result,JSON_PRETTY_PRINT)."\n";
