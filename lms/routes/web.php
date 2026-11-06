<?php

use App\Http\Controllers\Admin\PersonController;
use App\Http\Controllers\Admin\RayonController;
use App\Http\Controllers\Admin\RombelController;
use App\Http\Controllers\Admin\SpreadsheetController;
use App\Http\Controllers\Assessment\ActivityController;
use App\Http\Controllers\Assessment\AnalyticsController;
use App\Http\Controllers\Assessment\AuditController;
use App\Http\Controllers\Assessment\GamePreviewController;
use App\Http\Controllers\Assessment\InteractiveController;
use App\Http\Controllers\Assessment\PracticeController;
use App\Http\Controllers\Assessment\QuestionController;
use App\Http\Controllers\Assessment\ReportController;
use App\Http\Controllers\Assessment\StudentAssessmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Learning\ModuleController;
use App\Http\Controllers\Learning\SectionController;
use App\Http\Controllers\Learning\StudentLearningController;
use App\Http\Controllers\Learning\VerificationController;
use App\Services\SshGoldenModule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => auth()->check() ? redirect()->route(auth()->user()->dashboard()) : redirect()->route('login'));
Route::middleware('guest')->group(function () {
    Route::view('/login', 'auth.login')->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:20,1')->name('login.store');
});
Route::middleware(['auth', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::view('/ganti-password', 'auth.password')->name('password.edit');
    Route::put('/ganti-password', [AuthController::class, 'password'])->middleware('throttle:6,1')->name('password.update');
    foreach (['admin', 'guru', 'siswa'] as $role) {
        Route::get('/'.$role.'/dashboard', DashboardController::class)->middleware(['password.changed', 'role:'.$role])->name($role.'.dashboard');
    }
});

Route::prefix('admin')->name('admin.')->middleware(['auth', 'active', 'password.changed', 'role:admin'])->group(function () {
    Route::resource('rayon', RayonController::class)->parameters(['rayon' => 'rayon'])->names('rayons')->except('show');
    Route::get('rombel/ekspor', [SpreadsheetController::class, 'exportRombels'])->name('rombels.export');
    Route::resource('rombel', RombelController::class)->parameters(['rombel' => 'rombel'])->names('rombels');
    Route::get('impor/hasil/{import}', [SpreadsheetController::class, 'show'])->name('imports.show');
    Route::get('impor/{resource}', [SpreadsheetController::class, 'form'])->whereIn('resource', ['siswa', 'rombel'])->name('imports.form');
    Route::get('impor/{resource}/template', [SpreadsheetController::class, 'template'])->whereIn('resource', ['siswa', 'rombel'])->name('imports.template');
    Route::post('impor/{resource}', [SpreadsheetController::class, 'store'])->whereIn('resource', ['siswa', 'rombel'])->middleware('throttle:6,1')->name('imports.store');
    Route::get('{kind}/ekspor', [SpreadsheetController::class, 'exportPeople'])->whereIn('kind', ['siswa', 'guru'])->name('people.export');
    Route::get('{kind}', [PersonController::class, 'index'])->whereIn('kind', ['siswa', 'guru'])->name('people.index');
    Route::get('{kind}/tambah', [PersonController::class, 'create'])->whereIn('kind', ['siswa', 'guru'])->name('people.create');
    Route::post('{kind}', [PersonController::class, 'store'])->whereIn('kind', ['siswa', 'guru'])->name('people.store');
    Route::get('{kind}/{person}/edit', [PersonController::class, 'edit'])->whereIn('kind', ['siswa', 'guru'])->name('people.edit');
    Route::put('{kind}/{person}', [PersonController::class, 'update'])->whereIn('kind', ['siswa', 'guru'])->name('people.update');
    Route::patch('{kind}/{person}/status', [PersonController::class, 'status'])->whereIn('kind', ['siswa', 'guru'])->name('people.status');
    Route::get('{kind}/{person}/reset-password', [PersonController::class, 'resetForm'])->whereIn('kind', ['siswa', 'guru'])->name('people.reset-form');
    Route::put('{kind}/{person}/reset-password', [PersonController::class, 'reset'])->whereIn('kind', ['siswa', 'guru'])->middleware('throttle:6,1')->name('people.reset');
    Route::delete('{kind}/{person}', [PersonController::class, 'destroy'])->whereIn('kind', ['siswa', 'guru'])->name('people.destroy');
});

Route::prefix('pengajaran')->name('learning.')->middleware(['auth', 'active', 'password.changed'])->group(function () {
    Route::middleware('role:admin,guru')->group(function () {
        Route::get('verifikasi', [VerificationController::class, 'index'])->name('verifications.index');
        Route::post('verifikasi', [VerificationController::class, 'store'])->middleware('throttle:30,1')->name('verifications.store');
        Route::post('verifikasi/{verification}/cabut', [VerificationController::class, 'revoke'])->name('verifications.revoke');
        Route::post('override', [VerificationController::class, 'override'])->name('overrides.store');
        Route::post('override/{override}/cabut', [VerificationController::class, 'revokeOverride'])->name('overrides.revoke');
        Route::get('modul/{module}/preview', [ModuleController::class, 'preview'])->name('modules.preview');
        Route::post('modul/{module}/duplikasi', [ModuleController::class, 'duplicate'])->name('modules.duplicate');
        Route::put('modul/{module}/prasyarat', [ModuleController::class, 'prerequisites'])->name('modules.prerequisites');
        Route::resource('modul', ModuleController::class)->parameters(['modul' => 'module'])->names('modules')->except('show');
        Route::post('modul/{module}/submateri/{section}/urutan', [SectionController::class, 'move'])->name('sections.move');
        Route::resource('modul.submateri', SectionController::class)->parameters(['modul' => 'module', 'submateri' => 'section'])->names('sections')->except(['index', 'show']);
    });
});
Route::get('materi/{module}/thumbnail', [StudentLearningController::class, 'thumbnail'])->middleware(['auth', 'active', 'password.changed'])->name('learning.thumbnail');
Route::prefix('siswa')->name('student.')->middleware(['auth', 'active', 'password.changed', 'role:siswa'])->group(function () {
    Route::get('materi', [StudentLearningController::class, 'index'])->name('modules.index');
    Route::get('materi/{module}', [StudentLearningController::class, 'show'])->name('modules.show');
    Route::post('materi/{module}/submateri/{section}/selesai', [StudentLearningController::class, 'complete'])->middleware('throttle:30,1')->name('sections.complete');
    Route::get('materi/{module}/submateri/{section}', [StudentLearningController::class, 'section'])->name('sections.show');
});

Route::prefix('pengajaran')->name('assessment.')->middleware(['auth', 'active', 'password.changed', 'role:admin,guru'])->group(function () {
    Route::resource('bank-soal', QuestionController::class)->parameters(['bank-soal' => 'question'])->names('questions')->except('show');
    Route::get('modul/{module}/aktivitas/{activity}/pratinjau', [GamePreviewController::class, 'show'])->name('activities.preview');
    Route::post('modul/{module}/aktivitas/{activity}/pratinjau', [GamePreviewController::class, 'action'])->middleware('throttle:90,1')->name('activities.preview.action');
    Route::resource('modul.aktivitas', ActivityController::class)->parameters(['modul' => 'module', 'aktivitas' => 'activity'])->names('activities')->except('show');
    Route::get('monitoring', [ReportController::class, 'index'])->name('reports.index');
    Route::get('monitoring/ekspor', [ReportController::class, 'export'])->name('reports.export');
    Route::get('monitoring/percobaan/{attempt}', [ReportController::class, 'attempt'])->name('reports.attempt');
    Route::get('monitoring/{student}/{module}', [ReportController::class, 'detail'])->withTrashed()->name('reports.detail');
});
Route::prefix('siswa')->name('assessment.student.')->middleware(['auth', 'active', 'password.changed', 'role:siswa'])->group(function () {
    Route::get('progres', [StudentAssessmentController::class, 'progress'])->name('progress');
    Route::get('aktivitas/{activity}', [StudentAssessmentController::class, 'activity'])->name('activity');
    Route::post('aktivitas/{activity}/mulai', [StudentAssessmentController::class, 'start'])->middleware('throttle:30,1')->name('start');
    Route::get('percobaan/{attempt}', [StudentAssessmentController::class, 'attempt'])->name('attempt');
    Route::post('percobaan/{attempt}/simpan', [StudentAssessmentController::class, 'save'])->middleware('throttle:60,1')->name('save');
    Route::post('percobaan/{attempt}/kirim', [StudentAssessmentController::class, 'submit'])->name('submit');
    Route::post('baca/{section}/mulai', [StudentAssessmentController::class, 'readingStart'])->middleware('throttle:20,1')->name('reading.start');
    Route::post('baca/sesi/{session}', [StudentAssessmentController::class, 'heartbeat'])->middleware('throttle:12,1')->name('reading.heartbeat');
});

Route::get('admin/riwayat', [AuditController::class, 'index'])->middleware(['auth', 'active', 'password.changed', 'role:admin'])->name('assessment.audit');

Route::get('admin/riwayat/ekspor', [AuditController::class, 'export'])->middleware(['auth', 'active', 'password.changed', 'role:admin'])->name('assessment.audit.export');

Route::prefix('siswa/interaktif')->name('interactive.')->middleware(['auth', 'active', 'password.changed', 'role:siswa'])->group(function () {
    Route::post('aktivitas/{activity}/mulai', [InteractiveController::class, 'start'])->middleware('throttle:30,1')->name('start');
    Route::get('{interactive}', [InteractiveController::class, 'show'])->name('attempt');
    Route::post('{interactive}/aksi', [InteractiveController::class, 'action'])->middleware('throttle:90,1')->name('action');
});
Route::get('pengajaran/interaktif/{interactive}', [InteractiveController::class, 'staff'])->middleware(['auth', 'active', 'password.changed', 'role:admin,guru'])->name('interactive.staff');

Route::post('pengajaran/template-ssh', function (Request $request, SshGoldenModule $service) {
    $module = $service->create($request->user());

    return redirect()->route('learning.modules.edit', $module)->with('status', 'Draft modul SSH siap ditinjau. Pilih rombel lalu terbitkan setelah konten dan aktivitas diperiksa.');
})->middleware(['auth', 'active', 'password.changed', 'role:admin,guru', 'throttle:6,1'])->name('learning.ssh-template');

Route::middleware(['auth', 'active', 'password.changed'])->group(function () {
    Route::get('praktik/pengumpulan/{submission}', [PracticeController::class, 'show'])->name('practice.show');
    Route::get('praktik/bukti/{evidence}/lihat', [PracticeController::class,'viewer'])->middleware('throttle:120,1')->name('practice.viewer');
    Route::get('praktik/bukti/{evidence}/pratinjau', [PracticeController::class, 'preview'])->middleware('throttle:120,1')->name('practice.preview');
    Route::get('praktik/bukti/{evidence}', [PracticeController::class, 'download'])->middleware('throttle:60,1')->name('practice.download');
    Route::get('siswa/praktik/{activity}', [PracticeController::class, 'activity'])->middleware('role:siswa')->name('practice.activity');
    Route::post('siswa/praktik/{activity}', [PracticeController::class, 'store'])->middleware(['role:siswa', 'throttle:10,1'])->name('practice.store');
    Route::middleware('role:admin,guru')->group(function () {
        Route::get('pengajaran/praktik', [PracticeController::class, 'index'])->name('practice.index');
        Route::get('pengajaran/praktik/ekspor', [PracticeController::class, 'export'])->name('practice.export');
        Route::post('pengajaran/praktik/{submission}/nilai', [PracticeController::class, 'assess'])->middleware('throttle:30,1')->name('practice.assess');
    });
});

Route::get('pengajaran/analitik', AnalyticsController::class)->middleware(['auth', 'active', 'password.changed', 'role:admin,guru'])->name('learning.analytics');

Route::prefix('paket')->name('packages.')->middleware(['auth','active','password.changed'])->group(function () {
    Route::get('{module}/buka', [\App\Http\Controllers\Learning\PackageController::class,'legacy'])->name('legacy');
    Route::post('{module}/hasil', [\App\Http\Controllers\Learning\PackageController::class,'sync'])->middleware('throttle:30,1')->name('sync');
    Route::get('{module}/files/{path}', [\App\Http\Controllers\Learning\PackageController::class,'file'])->where('path','.*')->name('file');
});

Route::middleware(['auth','active','password.changed','role:admin,guru'])->group(function () {
 Route::get('paket/{module}/penugasan',[\App\Http\Controllers\Learning\PackageController::class,'manage'])->name('packages.manage');
 Route::post('paket/{module}/penugasan',[\App\Http\Controllers\Learning\PackageController::class,'assign'])->name('packages.assign');
 Route::get('pengajaran/materi-kelas',[\App\Http\Controllers\Learning\PackageClassController::class,'index'])->name('packages.class.index');
 Route::post('pengajaran/materi-kelas',[\App\Http\Controllers\Learning\PackageClassController::class,'store'])->name('packages.class.store');
});

Route::get('materi/{module}/belajar',[\App\Http\Controllers\Learning\PackageController::class,'launch'])->middleware(['auth','active','password.changed'])->name('packages.launch');
Route::middleware(['auth','active'])->group(function () {
 Route::get('profil/foto',[\App\Http\Controllers\ProfileController::class,'photo'])->name('profile.photo');
 Route::middleware('password.changed')->group(function () {
  Route::get('profil',[\App\Http\Controllers\ProfileController::class,'edit'])->name('profile.edit');
  Route::put('profil',[\App\Http\Controllers\ProfileController::class,'update'])->middleware('throttle:10,1')->name('profile.update');
 });
});
