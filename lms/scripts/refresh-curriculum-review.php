<?php
require __DIR__.'/../vendor/autoload.php';$app=require __DIR__.'/../bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if(base_path()!=='/home/adminnazh/tjkt-lms-review-20261028'||config('database.default')!=='sqlite')throw new RuntimeException('Review only.');
$file=base_path('review-access.json');$access=json_decode(file_get_contents($file),true,512,JSON_THROW_ON_ERROR);
foreach(App\Models\Module::whereNotNull('package_slug')->get() as $module)$access['modules'][$module->package_slug]=['id'=>$module->id,'version'=>$module->package_version];
file_put_contents($file,json_encode($access,JSON_PRETTY_PRINT));chmod($file,0600);echo "Review module references refreshed; no credentials displayed.\n";
