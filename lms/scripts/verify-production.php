<?php
$review='/home/adminnazh/tjkt-lms-review-20261028';$production='/var/www/tjkt-learning';
if(realpath(__DIR__.'/..')!==$review)throw new RuntimeException('Review only.');
require $production.'/vendor/autoload.php';$app=require $production.'/bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if(base_path()!==$production)throw new RuntimeException('Wrong application.');
$result=['codeVerified'=>true,'migrationApplied'=>Illuminate\Support\Facades\DB::table('migrations')->where('migration','2026_10_28_000001_add_learning_packages')->exists(),'packages'=>App\Models\Module::whereNotNull('package_slug')->count(),'draftPackages'=>App\Models\Module::whereNotNull('package_slug')->where('status','draft')->count(),'existingMaterials'=>App\Models\Module::whereNull('package_slug')->count(),'reviewAccounts'=>App\Models\User::whereIn('username',['review.admin','review.guru','review.siswa','review.siswa2'])->count(),'maintenanceOff'=>!is_file($production.'/storage/framework/down')];
$manifest=json_decode(file_get_contents($review.'/storage/app/review-artifacts/release-manifest.json'),true);
foreach($manifest['changes'] as $file)if(hash_file('sha256',$production.'/'.$file['path'])!==$file['after'])throw new RuntimeException('Deployed code mismatch.');
$module=App\Models\Module::whereNotNull('package_slug')->firstOrFail();$entry=app(App\Services\LearningPackage::class)->entry($module);
$asset=storage_path('app/learning-pack/releases/'.$entry['contentVersion'].'/site/'.$entry['path'].'index.html');
$result['packageAssetsExist']=is_file($asset);
$context=stream_context_create(['http'=>['header'=>"Host: learning.tkjwikrama.my.id\r\n",'ignore_errors'=>true,'follow_location'=>0,'timeout'=>20]]);
$html=file_get_contents('http://127.0.0.1/login',false,$context);$result['loginStatus']=$http_response_header[0]??'';$result['loginPageValid']=str_contains($html,'Masuk ke ruang belajar');
$r=file_get_contents('http://127.0.0.1/paket/'.$module->id.'/buka',false,$context);$result['packageGuestStatus']=$http_response_header[0]??'';
if(!$result['migrationApplied']||$result['packages']!==53||!$result['maintenanceOff']||!$result['packageAssetsExist']||!$result['loginPageValid']||!str_contains($result['packageGuestStatus'],'302'))throw new RuntimeException('Production verification failed.');
file_put_contents($review.'/storage/app/review-artifacts/production-verification.json',json_encode($result,JSON_PRETTY_PRINT));echo json_encode($result,JSON_PRETTY_PRINT)."\n";
