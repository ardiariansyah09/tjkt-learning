<?php
require __DIR__.'/../vendor/autoload.php';
$app=require __DIR__.'/../bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if(base_path()!=='/home/adminnazh/tjkt-lms-review-20261028'||config('database.default')!=='sqlite'||config('database.connections.sqlite.database')!==base_path('database/review.sqlite'))throw new RuntimeException('Review database required.');
use App\Models\User;
use App\Models\Module;
use App\Models\Rombel;
use Illuminate\Support\Facades\Artisan;

$password=bin2hex(random_bytes(12));
$users=[];
foreach(['admin','guru','siswa','siswa2'] as $kind){
 $users[$kind]=User::firstOrCreate(['username'=>'review.'.$kind],['name'=>'Contoh '.ucfirst($kind),'role'=>str_starts_with($kind,'siswa')?'siswa':$kind,'password'=>$password,'is_active'=>true,'must_change_password'=>false]);
 $users[$kind]->update(['password'=>$password]);
}
Artisan::call('learning:import-packages',['--author'=>$users['admin']->id]);echo Artisan::output();
foreach([10,11,12] as $grade){
 $class=Rombel::firstOrCreate(['name'=>'Kelas Contoh '.$grade,'academic_year'=>'2026/2027','semester'=>1],['grade'=>$grade,'is_active'=>true]);
 $class->teachers()->syncWithoutDetaching([$users['guru']->id]);
 foreach(['siswa','siswa2'] as $kind)if(!$class->students()->where('users.id',$users[$kind]->id)->whereNull('rombel_students.left_at')->exists())$class->students()->attach($users[$kind]->id,['joined_at'=>now()]);
 foreach(Module::whereNotNull('package_slug')->where('grade',$grade)->get() as $module){$module->rombels()->syncWithoutDetaching([$class->id]);$module->update(['status'=>'published','published_at'=>now()]);}
}
$fixtures=[];foreach(Module::whereNotNull('package_slug')->get() as $module)$fixtures[$module->package_slug]=['id'=>$module->id,'version'=>$module->package_version];
$credentials=['password'=>$password,'users'=>array_map(fn($user)=>['id'=>$user->id,'username'=>$user->username],$users),'modules'=>$fixtures];
file_put_contents(base_path('review-access.json'),json_encode($credentials,JSON_PRETTY_PRINT));chmod(base_path('review-access.json'),0600);
echo "Review accounts and 53 published packages ready. Access details stored privately in review-access.json.\n";
