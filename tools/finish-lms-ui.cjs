const fs=require('fs'),path=require('path'),base=path.resolve(__dirname,'../lms');const r=p=>fs.readFileSync(path.join(base,p),'utf8'),w=(p,s)=>fs.writeFileSync(path.join(base,p),s);
if(r('routes/web.php').includes("name('packages.assign')"))throw Error('Package UI already finalized. Edit the final LMS files instead.');
let routes=r('routes/web.php');routes+=`
Route::middleware(['auth','active','password.changed','role:admin,guru'])->group(function () {
 Route::get('paket/{module}/penugasan',[\\App\\Http\\Controllers\\Learning\\PackageController::class,'manage'])->name('packages.manage');
 Route::post('paket/{module}/penugasan',[\\App\\Http\\Controllers\\Learning\\PackageController::class,'assign'])->name('packages.assign');
});
`;w('routes/web.php',routes);
let policy=r('app/Policies/ModulePolicy.php');policy=policy.replace("return $user->role === 'guru' && ($module->created_by", "return $user->role === 'guru' && (($module->package_slug && $module->status === 'published') || $module->created_by");w('app/Policies/ModulePolicy.php',policy);
let mc=r('app/Http/Controllers/Learning/ModuleController.php');mc=mc.replace("$q->where('created_by', $user->id)->orWhereHas", "$q->where('created_by', $user->id)->orWhere(fn($p)=>$p->whereNotNull('package_slug')->where('status','published'))->orWhereHas");
mc=mc.replace("public function edit(Request $request, Module $module)\n    {", "public function edit(Request $request, Module $module)\n    {\n        if ($module->package_slug) return redirect()->route('packages.manage', $module);");w('app/Http/Controllers/Learning/ModuleController.php',mc);
let list=r('resources/views/learning/manage/index.blade.php');
const start=list.indexOf('<div class="learning-hero">'),end=list.indexOf('<form method="GET"',start);
list=list.slice(0,start)+`<div class="d-flex justify-content-between gap-3 mb-4"><div><h1 class="h3">Materi</h1><p class="text-secondary">Pilih materi untuk pratinjau atau penugasan ke kelas.</p></div><details><summary class="btn btn-light">Tambah materi</summary><a class="btn btn-outline-primary mt-2" href="{{ route('learning.modules.create') }}">Buat materi baru</a></details></div>`+list.slice(end);
list=list.replace("@can('update',$module)<a",`@if($module->package_slug)<a class="btn btn-primary" href="{{ route('packages.manage',$module) }}">Atur kelas</a>@else @can('update',$module)<a`).replace('>Kelola</a>@endcan','>Kelola</a>@endcan @endif');
list=list.replace('<a class="btn btn-outline-success" href="{{ route(\'learning.modules.preview\',[$module,\'mode\'=>\'student\']) }}">Sebagai siswa</a>','');
list=list.replace(/<form method="POST" action="\{\{ route\('learning.ssh-template'\) \}\}"[\s\S]*?<\/form>/,'');w('resources/views/learning/manage/index.blade.php',list);
// Keep enrollment and search prominent; the less used controls stay available.
let people=r('resources/views/admin/people/index.blade.php');people=people.replace("@if($kind==='siswa')<div class=\"col-md-2\"><label class=\"form-label small\" for=\"rayon_id\">",`<details class="col-12"><summary>Filter lainnya</summary><div class="row g-2 mt-2">@if($kind==='siswa')<div class="col-md-2"><label class="form-label small" for="rayon_id">`);people=people.replace('<div class="col-md-2 d-flex align-items-end gap-2"><button','</div></details><div class="col-md-2 d-flex align-items-end gap-2"><button');w('resources/views/admin/people/index.blade.php',people);
let dash=r('resources/views/assessment/_dashboard.blade.php');dash=dash.replace('Buka monitoring dan laporan','Lihat progres & nilai');w('resources/views/assessment/_dashboard.blade.php',dash);
console.log('Simplified package assignment and account filters.');
