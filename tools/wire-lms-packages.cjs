const fs=require('fs'),path=require('path');const base=path.resolve(__dirname,'../lms');
const r=p=>fs.readFileSync(path.join(base,p),'utf8'),w=(p,t)=>{fs.mkdirSync(path.dirname(path.join(base,p)),{recursive:true});fs.writeFileSync(path.join(base,p),t)};
if(r('routes/web.php').includes("name('packages.')"))throw Error('Packages already wired. Edit the final LMS files instead.');
let progress=r('app/Services/ProgressService.php');progress=progress.replace('return DB::transaction(function () use ($user, $module, $touch, $at) {',`if ($module->package_slug) return app(LearningPackage::class)->recalculate($user, $module, $touch);
        return DB::transaction(function () use ($user, $module, $touch, $at) {`);w('app/Services/ProgressService.php',progress);
let controller=r('app/Http/Controllers/Learning/StudentLearningController.php');controller=controller.replace("$sections = $reasons ? collect()",`if (!$reasons && $module->package_slug) return redirect()->route('packages.launch', $module);
        $sections = $reasons ? collect()`);controller=controller.replace("Gate::authorize('view', $module);","Gate::authorize('view', $module);\n        if ($module->package_slug) return redirect()->route('packages.launch', $module);");w('app/Http/Controllers/Learning/StudentLearningController.php',controller);
let preview=r('resources/views/learning/manage/preview.blade.php');preview=preview.replace("@section('content')",`@section('content')
@if($module->package_slug)<div class="alert alert-light border d-flex flex-wrap gap-3 align-items-center"><span>Paket interaktif: materi, simulasi, game, dan sertifikat.</span><a class="btn btn-primary" href="{{ route('packages.launch',$module) }}">Buka pratinjau interaktif</a></div>@endif`);w('resources/views/learning/manage/preview.blade.php',preview);
let routes=r('routes/web.php');routes+=`
Route::prefix('paket')->name('packages.')->middleware(['auth','active','password.changed'])->group(function () {
    Route::get('{module}/buka', [\\App\\Http\\Controllers\\Learning\\PackageController::class,'launch'])->name('launch');
    Route::post('{module}/hasil', [\\App\\Http\\Controllers\\Learning\\PackageController::class,'sync'])->middleware('throttle:30,1')->name('sync');
    Route::get('{module}/files/{path}', [\\App\\Http\\Controllers\\Learning\\PackageController::class,'file'])->where('path','.*')->name('file');
});
`;w('routes/web.php',routes);
let pkg=r('app/Http/Controllers/Learning/PackageController.php');pkg=pkg.replace("'revision'=>'required|integer|min:0'","'owner'=>'required|integer', 'revision'=>'required|integer|min:0'");pkg=pkg.replace("abort_unless($input['version']", "abort_unless($input['owner'] === $request->user()->id, 403);\n        abort_unless($input['version']");w('app/Http/Controllers/Learning/PackageController.php',pkg);
let report=r('app/Services/LearningReportService.php');report=report.replace("'mp.quiz_score', 'mp.practice_score'","'mp.quiz_score', 'mp.practice_score', 'mp.final_score', 'm.package_slug'");w('app/Services/LearningReportService.php',report);
let index=r('resources/views/assessment/reports/index.blade.php');index=index.replace('<th>Rata-rata kuis terbaik</th>','<th>Evaluasi akhir / kuis</th>').replace("{{ $row->quiz_score??'Belum lengkap' }}","{{ ($row->package_slug?$row->final_score:$row->quiz_score)??'Belum ada nilai' }}<small class=\"d-block text-secondary\">{{ $row->package_slug?'Evaluasi akhir':'Rata-rata kuis terbaik' }}</small>");w('resources/views/assessment/reports/index.blade.php',index);
let detail=r('resources/views/assessment/reports/detail.blade.php');detail=detail.replace("@section('content')","@section('content')\n@if($module->package_slug) @include('learning.package-results') @else");detail=detail.replace('@endsection','@endif @endsection');w('resources/views/assessment/reports/detail.blade.php',detail);
let reportController=r('app/Http/Controllers/Assessment/ReportController.php');reportController=reportController.replace("'rata_rata_kuis_terbaik', 'rata_rata_praktik_terbaik'","'rata_rata_kuis_terbaik', 'evaluasi_akhir_paket', 'rata_rata_praktik_terbaik'").replace("$row->quiz_score ?? '', $row->practice_score","$row->quiz_score ?? '', $row->final_score ?? '', $row->practice_score");w('app/Http/Controllers/Assessment/ReportController.php',reportController);
let model=r('app/Models/ModuleProgress.php');model=model.replace("'quiz_score' => 'float'","'final_score' => 'float', 'quiz_score' => 'float'");w('app/Models/ModuleProgress.php',model);
// Local preview never connects to production and never uses its database.
w('.env.example',`APP_NAME="TJKT Learning Review"
APP_ENV=local
APP_DEBUG=false
APP_URL=http://127.0.0.1:18087
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tjkt_learning_review_20261028
DB_USERNAME=
DB_PASSWORD=
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
`);
console.log('Wired package routes, reporting, guarded sync and draft import.');
