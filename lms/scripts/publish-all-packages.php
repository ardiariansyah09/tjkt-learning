<?php
if(($argv[1]??'')!=='--apply')throw new RuntimeException('Explicit --apply required.');
$review='/home/adminnazh/tjkt-lms-review-20261028';$production='/var/www/tjkt-learning';
if(realpath(__DIR__.'/..')!==$review)throw new RuntimeException('Review path required.');
require $production.'/vendor/autoload.php';
$env=Dotenv\Dotenv::parse(file_get_contents($production.'/.env'));
$files=['app/Services/LearningPackage.php','app/Services/PackageContentStore.php','app/Services/PackageAssignments.php','app/Http/Controllers/Learning/PackageController.php','app/Http/Controllers/Learning/PackageClassController.php','app/Console/Commands/StoreLearningPackages.php','resources/views/learning/student/show.blade.php','resources/views/learning/package-prerequisites.blade.php','database/migrations/2026_10_28_000002_store_learning_package_content.php'];
umask(0077);$backup='/home/adminnazh/tjkt-lms-backups/publication-'.date('Ymd-His');mkdir($backup,0700,true);$log=$backup.'/publication.log';
$run=function(array $args,bool $required=true)use($production,$log){$pipes=[];$p=proc_open($args,[0=>['pipe','r'],1=>['file',$log,'a'],2=>['file',$log,'a']],$pipes,$production);if(!is_resource($p))throw new RuntimeException('Command could not start.');fclose($pipes[0]);$code=proc_close($p);if($required&&$code!==0)throw new RuntimeException('Command failed; see private publication log.');return $code;};
$copied=[];$down=false;$committed=false;
try{
 $run(['php8.3','artisan','down','--retry=30']);$down=true;
 $quote=fn($v)=>'"'.str_replace(['\\','"',"\n","\r"],['\\\\','\\"','\\n','\\r'],(string)$v).'"';$client="[client]\n";
 foreach(['host'=>'DB_HOST','port'=>'DB_PORT','user'=>'DB_USERNAME','password'=>'DB_PASSWORD'] as $key=>$setting)$client.=$key.'='.$quote($env[$setting]??($key==='port'?3306:'127.0.0.1'))."\n";
 $config=$backup.'/dump-client.cnf';file_put_contents($config,$client);$pipes=[];
 $p=proc_open(['mysqldump','--defaults-file='.$config,'--single-transaction','--no-tablespaces',$env['DB_DATABASE']],[0=>['pipe','r'],1=>['file',$backup.'/database.sql','w'],2=>['file',$log,'a']],$pipes,$production);
 if(!is_resource($p))throw new RuntimeException('Backup could not start.');fclose($pipes[0]);$exit=proc_close($p);unlink($config);if($exit||filesize($backup.'/database.sql')<100)throw new RuntimeException('Database backup failed.');
 foreach($files as $file){if(is_file($production.'/'.$file)){$saved=$backup.'/code/'.$file;if(!is_dir(dirname($saved)))mkdir(dirname($saved),0700,true);copy($production.'/'.$file,$saved);}}
 umask(0022);
 foreach($files as $file){$target=$production.'/'.$file;if(!is_dir(dirname($target)))mkdir(dirname($target),0755,true);if(!copy($review.'/'.$file,$target))throw new RuntimeException('Copy failed.');chmod($target,0644);$copied[]=$file;}
 $run(['php8.3','artisan','migrate','--force','--path=database/migrations/2026_10_28_000002_store_learning_package_content.php']);
 $run(['php8.3','artisan','learning:store-packages']);
 $app=require $production.'/bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
 if(base_path()!==$production)throw new RuntimeException('Wrong app.');
 $old=App\Models\Module::whereNull('package_slug')->get();
 if(array_diff($old->modelKeys(),[5,10]))throw new RuntimeException('Unexpected legacy module.');
 $packages=App\Models\Module::whereNotNull('package_slug')->get();if($packages->count()!==53)throw new RuntimeException('53 packages required.');
 $classes=App\Models\Rombel::where('is_active',true)->get();foreach([10,11,12] as $grade)if(!$classes->contains('grade',$grade))throw new RuntimeException('Missing class grade '.$grade);
 $oldProgress=Illuminate\Support\Facades\DB::table('module_progress')->whereIn('module_id',[5,10])->count();
 Illuminate\Support\Facades\DB::transaction(function()use($old,$packages,$classes){
  app(App\Services\PrerequisiteService::class)->lockGraph();
  foreach($old as $module){app(App\Services\ModuleService::class)->archive($module);$module->rombels()->detach();}
  foreach($packages as $module)$module->update(['status'=>'published','published_at'=>$module->published_at??now()]);
  foreach($classes as $class)app(App\Services\PackageAssignments::class)->includePrerequisites($class,$packages->where('grade',$class->grade)->modelKeys());
  app(App\Services\AuditService::class)->record('packages.published',null,['source'=>'authorized_server_maintenance','modules'=>53,'classes'=>$classes->count(),'removed_modules'=>[5,10]]);
 });$committed=true;
 $run(['php8.3','artisan','optimize:clear']);$run(['php8.3','artisan','view:cache']);$run(['php8.3','artisan','up']);$down=false;
 $result=['publishedModules'=>App\Models\Module::whereNotNull('package_slug')->where('status','published')->count(),'oldModulesVisible'=>App\Models\Module::whereNull('package_slug')->count(),'classesAssigned'=>$classes->count(),'databaseDefinitions'=>Illuminate\Support\Facades\DB::table('learning_package_definitions')->count(),'databaseAssets'=>Illuminate\Support\Facades\DB::table('learning_package_assets')->count(),'oldProgressBefore'=>$oldProgress,'oldProgressAfter'=>Illuminate\Support\Facades\DB::table('module_progress')->whereIn('module_id',[5,10])->count(),'backup'=>$backup];
 file_put_contents($review.'/storage/app/review-artifacts/publication-result.json',json_encode($result,JSON_PRETTY_PRINT));echo json_encode($result,JSON_PRETTY_PRINT)."\n";
}catch(Throwable $error){
 if(!$committed)foreach(array_reverse($copied) as $file){$saved=$backup.'/code/'.$file;if(is_file($saved))copy($saved,$production.'/'.$file);elseif(is_file($production.'/'.$file))unlink($production.'/'.$file);}
 if($down)$run(['php8.3','artisan','up'],false);
 throw new RuntimeException('Publication stopped. Backup: '.$backup,0,$error);
}
