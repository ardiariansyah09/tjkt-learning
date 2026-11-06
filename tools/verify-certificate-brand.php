<?php
$root='/var/www/tjkt-learning';require $root.'/vendor/autoload.php';$app=require $root.'/bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$service=app(App\Services\LearningPackage::class);$renderer=app(App\Services\NativeLessonRenderer::class);$count=0;
foreach(App\Models\Module::whereNotNull('package_slug')->get() as $module){
 $entry=$service->entry($module);$lesson=$renderer->render($module,$entry,'/learning/modules','brand-verification');
 if(!$lesson['content']||!$lesson['outline']||!$lesson['styles']||!$lesson['scripts'])throw new RuntimeException('Incomplete native lesson '.$module->package_slug);
 $count++;
}
foreach(['app','guest','student-preview'] as $layout){$s=file_get_contents($root.'/resources/views/layouts/'.$layout.'.blade.php');if(!str_contains($s,'certificate-brand.css')||!str_contains($s,'tjkt-wikrama-logo.png'))throw new RuntimeException('Missing branding '.$layout);}
echo json_encode(['result'=>'PASS','nativeLessonsRendered'=>$count,'brandedLayouts'=>3,'logoSha256'=>hash_file('sha256',$root.'/public/assets/images/tjkt-wikrama-logo.png'),'cssSha256'=>hash_file('sha256',$root.'/public/assets/certificate-brand.css'),'databaseWrites'=>false],JSON_PRETTY_PRINT)."\n";
