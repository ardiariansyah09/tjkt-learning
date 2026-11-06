<?php
// Run via SSH from the private staging directory, using production's PHP version.
$root='/var/www/tjkt-learning';
if (!in_array($argv[1]??'', ['--check','--apply'],true)) throw new RuntimeException('Use --check or --apply');
$apply=$argv[1]==='--apply';
$stage=__DIR__;
$files=['public/assets/certificate-brand.css'=>file_get_contents($stage.'/certificate-brand.css'),'public/assets/images/tjkt-wikrama-logo.png'=>file_get_contents($stage.'/tjkt-wikrama-logo.png')];
foreach(['app','guest','student-preview'] as $name){
 $path='resources/views/layouts/'.$name.'.blade.php';$old=file_get_contents($root.'/'.$path);
 if(!str_contains($old,'brand-mark'))throw new RuntimeException('Unexpected layout '.$name);
 $new=str_replace('<i class="bi bi-hdd-network"></i>','<img class="tjkt-brand-logo" src="{{ asset(\'assets/images/tjkt-wikrama-logo.png\') }}" alt="Logo TJKT SMK Wikrama Bogor" width="56" height="56">',$old);
 if(!str_contains($new,'assets/certificate-brand.css'))$new=str_replace('</head>','<link rel="stylesheet" href="{{ asset(\'assets/certificate-brand.css\') }}?v={{ filemtime(public_path(\'assets/certificate-brand.css\')) }}"></head>',$new);
 if(!str_contains($new,'tjkt-brand-logo')||!str_contains($new,'certificate-brand.css'))throw new RuntimeException('Layout patch failed');
 $files[$path]=$new;
}
require $root.'/vendor/autoload.php';$app=require $root.'/bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;
$modules=DB::table('modules')->whereNotNull('package_slug')->orderBy('id')->get(['id','package_version'])->all();
if(!$apply){echo json_encode(['check'=>'PASS','files'=>array_keys($files),'nativeModules'=>count($modules),'databaseWrites'=>false])."\n";exit;}
umask(0077);$backup='/home/adminnazh/tjkt-lms-backups/certificate-brand-'.date('Ymd-His');
if(!mkdir($backup,0700,true))throw new RuntimeException('Backup failed');
$restore=[];
foreach($files as $path=>$bytes){$target=$root.'/'.$path;$restore[$path]=is_file($target);if($restore[$path]){$saved=$backup.'/'.$path;@mkdir(dirname($saved),0700,true);if(!copy($target,$saved))throw new RuntimeException('Cannot back up '.$path);}}
file_put_contents($backup.'/restore.json',json_encode($restore,JSON_PRETTY_PRINT));
$written=[];
try{
 umask(0022);
 foreach($files as $path=>$bytes){$target=$root.'/'.$path;if(!is_dir(dirname($target)))mkdir(dirname($target),0755,true);$temp=$target.'.brand-tmp';if(file_put_contents($temp,$bytes)!==strlen($bytes))throw new RuntimeException('Incomplete write');chmod($temp,0644);if(!rename($temp,$target))throw new RuntimeException('Activation failed');$written[]=$path;}
 if(json_encode($modules)!==json_encode(DB::table('modules')->whereNotNull('package_slug')->orderBy('id')->get(['id','package_version'])->all()))throw new RuntimeException('Module versions changed during activation');
 // Let PHP-FPM compile views as its own user; CLI-owned caches can fail touch().
 if($app->make(Illuminate\Contracts\Console\Kernel::class)->call('view:clear')!==0)throw new RuntimeException('View cache clear failed');
 echo json_encode(['activated'=>true,'backup'=>$backup,'files'=>count($files),'preservedModuleVersions'=>count($modules),'databaseWrites'=>false],JSON_PRETTY_PRINT)."\n";
}catch(Throwable $error){
 foreach(array_reverse($written) as $path){if($restore[$path])copy($backup.'/'.$path,$root.'/'.$path);else unlink($root.'/'.$path);}
 $app->make(Illuminate\Contracts\Console\Kernel::class)->call('view:clear');throw $error;
}
