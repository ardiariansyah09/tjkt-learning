<?php

namespace App\Http\Controllers;

use App\Models\ActivityProgress;
use App\Models\AuditLog;
use App\Models\LearningEvent;
use App\Models\Module;
use App\Models\ModuleProgress;
use App\Models\Rombel;
use App\Models\User;
use App\Services\LearningAccessService;
use App\Services\LearningReportService;
use App\Services\PracticeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $u = $request->user();
        $stats = match ($u->role) {
            'admin' => ['Total siswa' => User::where('role', 'siswa')->count(), 'Total guru' => User::where('role', 'guru')->count(), 'Rombel aktif' => Rombel::where('is_active', true)->count(), 'Materi terbit' => Module::where('status', 'published')->count(), 'Materi belum terbit' => Module::where('status', '!=', 'published')->count(), 'Akun aktif' => User::where('is_active', true)->count()],
            'guru' => ['Rombel diampu' => $u->teachingRombels()->count(), 'Siswa diampu' => User::where('role', 'siswa')->whereHas('rombels', fn ($q) => $q->whereNull('rombel_students.left_at')->whereHas('teachers', fn ($t) => $t->where('users.id', $u->id)))->count(), 'Materi saya' => $u->modules()->count()],
            default => ['Rombel saya' => $u->rombels()->wherePivotNull('left_at')->count(), 'Materi tersedia' => app(LearningAccessService::class)->catalog($u)->count()],
        };
        $events = $u->role === 'admin' ? AuditLog::with('user')->latest('id')->limit(8)->get() : AuditLog::where('user_id', $u->id)->latest('id')->limit(8)->get();

        if ($u->role === 'siswa') {
            $metrics = ModuleProgress::where('user_id', $u->id)->selectRaw("COUNT(*) as total, COALESCE(SUM(status='completed'),0) as completed, COALESCE(SUM(status='not_started'),0) as not_started, COALESCE(AVG(completion_percent),0) as average")->first();
            $learningEvents = LearningEvent::with('module', 'student')->where('user_id', $u->id)->latest('id')->limit(6)->get();
            $stats['Aktivitas selesai'] = ActivityProgress::where('user_id', $u->id)->whereNotNull('completed_at')->count();
        } else {
            $pairs = app(LearningReportService::class)->pairs($u);
            $metrics = DB::query()->fromSub(clone $pairs, 'scope')->selectRaw("COUNT(*) as total, COALESCE(SUM(progress_status='completed'),0) as completed, COALESCE(SUM(progress_status='not_started'),0) as not_started, COALESCE(AVG(completion_percent),0) as average")->first();
            $learningEvents = LearningEvent::with('module', 'student')->whereExists(fn ($q) => $q->selectRaw('1')->fromSub(clone $pairs, 'assigned')->whereColumn('assigned.student_id', 'learning_events.user_id')->whereColumn('assigned.module_id', 'learning_events.module_id'))->latest('id')->limit(6)->get();
        }
        $cohorts = collect();
        if ($u->role !== 'siswa') {
            $assigned = DB::query()->fromSub(app(LearningReportService::class)->pairs($u), 'assigned');
            $assignedCount = (clone $assigned)->distinct()->count('student_id');
            $startedCount = (clone $assigned)->where('progress_status', '!=', 'not_started')->distinct()->count('student_id');
            $stats['Siswa sudah mulai'] = $startedCount;
            $stats['Siswa belum mulai'] = max(0, $assignedCount - $startedCount);
            $stats['Siswa aktif 7 hari'] = (clone $assigned)->where('last_activity_at', '>=', now()->subDays(7))->distinct()->count('student_id');
            $chart = DB::table('rombels as r')->join('rombel_students as rs', 'rs.rombel_id', '=', 'r.id')->join('users as u', 'u.id', '=', 'rs.user_id')->join('module_assignments as ma', 'ma.rombel_id', '=', 'r.id')->join('modules as m', 'm.id', '=', 'ma.module_id')->leftJoin('module_progress as mp', fn ($j) => $j->on('mp.user_id', '=', 'u.id')->on('mp.module_id', '=', 'm.id'))->whereNull('rs.left_at')->whereNull('r.deleted_at')->whereNull('u.deleted_at')->where('u.role', 'siswa')->where('r.is_active', true)->where(fn ($q) => $q->where('m.status', 'published')->orWhereNotNull('m.published_at')->orWhereNotNull('mp.id'));
            if ($u->role === 'guru') {
                $chart->whereExists(fn ($q) => $q->selectRaw('1')->from('teacher_rombel as t')->whereColumn('t.rombel_id', 'r.id')->where('t.user_id', $u->id));
            }
            $cohorts = $chart->select('r.id', 'r.name', 'r.academic_year', 'r.semester')->selectRaw('COUNT(DISTINCT u.id) as students, AVG(COALESCE(mp.completion_percent,0)) as average')->groupBy('r.id', 'r.name', 'r.academic_year', 'r.semester')->orderBy('r.name')->limit(12)->get();
        }

        $stats['Praktik menunggu penilaian'] = app(PracticeService::class)->scoped($u)->where('status', 'pending')->count();

        return view('dashboard', compact('stats', 'events', 'metrics', 'learningEvents', 'cohorts'));
    }
}
