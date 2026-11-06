<?php
$production='/var/www/tjkt-learning';$review='/home/adminnazh/tjkt-lms-review-20261028';
require $production.'/vendor/autoload.php';$app=require $production.'/bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if(base_path()!==$production)throw new RuntimeException('Wrong app.');
$admin=App\Models\User::where('role','admin')->where('is_active',true)->firstOrFail();
// In-memory render check only: no login session is issued, no learner is impersonated,
// and no result endpoint is called or written.
Illuminate\Support\Facades\Auth::setUser($admin);
Illuminate\Support\Facades\View::share('errors',new Illuminate\Support\ViewErrorBag);
$request=Illuminate\Http\Request::create('https://learning.tkjwikrama.my.id/');$request->setUserResolver(fn()=>$admin);
$controller=app(App\Http\Controllers\Learning\PackageController::class);$packages=app(App\Services\LearningPackage::class);$count=0;
foreach(App\Models\Module::whereNotNull('package_slug')->where('status','published')->get() as $module){
 $html=$controller->launch($request,$module,$packages)->getContent();
 foreach(['id="sidebar"','id="lms-learning-outline"','id="lms-learning-root"','lms-course-bridge.js'] as $marker)if(!str_contains($html,$marker))throw new RuntimeException('Native layout marker missing.');
 foreach(['TJKT Learning Hub','Kembali ke Portal','<iframe'] as $marker)if(str_contains($html,$marker))throw new RuntimeException('Legacy page remains.');
 if(substr_count($html,'<main ')!==1)throw new RuntimeException('Multiple main page containers.');
 $count++;
}
$context=stream_context_create(['http'=>['ignore_errors'=>true,'follow_location'=>0,'timeout'=>20]]);
file_get_contents('https://learning.tkjwikrama.my.id/materi/11/belajar',false,$context);$status=$http_response_header[0]??'';
$result=['nativeModulesRendered'=>$count,'legacyPortalBrandRemoved'=>true,'separateHtmlPagesRemoved'=>true,'sharedLmsLayout'=>true,'guestNativeRoute'=>$status,'route'=>Illuminate\Support\Facades\Route::getRoutes()->getByName('packages.launch')->uri(),'maintenanceOff'=>!is_file($production.'/storage/framework/down')];
if($count!==53||!str_contains($status,'302'))throw new RuntimeException('Native production check failed.');
file_put_contents($review.'/storage/app/review-artifacts/native-lms-production.json',json_encode($result,JSON_PRETTY_PRINT));echo json_encode($result,JSON_PRETTY_PRINT)."\n";
