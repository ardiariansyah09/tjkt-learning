<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\ExportJob;
use App\Models\InteractiveAttempt;
use App\Models\LabSubmission;
use App\Models\LearningEvent;
use App\Models\LearningSession;
use App\Models\Module;
use App\Models\ModuleProgress;
use App\Models\QuizAttempt;
use App\Models\Rombel;
use App\Models\User;
use App\Services\AuditService;
use App\Services\InteractiveService;
use App\Services\LearningReportService;
use App\Services\ProgressService;
use App\Services\QuizService;
use App\Services\XlsxService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller
{
    private function filters(Request $r): array
    {
        return $r->validate(['q' => 'nullable|string|max:100', 'academic_year' => 'nullable|string|max:9', 'semester' => 'nullable|in:1,2', 'rombel_id' => 'nullable|integer|min:1', 'module_id' => 'nullable|integer|min:1', 'status' => 'nullable|in:not_started,in_progress,completed', 'from' => 'nullable|date', 'to' => ['nullable', 'date', Rule::when($r->filled('from'), 'after_or_equal:from')]]);
    }

    public function index(Request $r, LearningReportService $reports)
    {
        $filters = $this->filters($r);
        $reports->expireScoped($r->user(), $filters);
        $query = $reports->pairs($r->user(), $filters);
        $summary = DB::query()->fromSub(clone $query, 'summary')->selectRaw("COUNT(*) as total, COALESCE(AVG(completion_percent),0) as average, COALESCE(SUM(progress_status='completed'),0) as completed, COALESCE(SUM(progress_status='not_started'),0) as not_started")->first();
        $rows = $query->orderBy('u.name')->orderBy('m.title')->paginate(15)->withQueryString();
        $rombels = $r->user()->role === 'admin' ? Rombel::withTrashed()->orderBy('name')->get() : $r->user()->teachingRombels()->withTrashed()->orderBy('name')->get();
        $years = $rombels->pluck('academic_year')->unique()->sortDesc();
        $modules = Module::withTrashed()->whereIn('id', $reports->pairs($r->user(), ['history' => true])->select('m.id'))->orderBy('title')->get();

        return view('assessment.reports.index', compact('rows', 'summary', 'rombels', 'years', 'modules'));
    }

    public function detail(Request $r, User $student, Module $module, LearningReportService $reports)
    {
        $reports->authorize($r->user(), $student->id, $module->id, $this->filters($r));
        foreach (QuizAttempt::where('user_id', $student->id)->where('status', 'in_progress')->where('expires_at', '<=', now())->whereHas('activity', fn ($q) => $q->where('module_id', $module->id))->get() as $a) {
            app(QuizService::class)->expire($a);
        }$progress = ModuleProgress::where('user_id', $student->id)->where('module_id', $module->id)->first() ?? app(ProgressService::class)->recalculate($student, $module);
        $activities = ActivityProgress::with('activity')->where('user_id', $student->id)->whereHas('activity', fn ($q) => $q->where('module_id', $module->id))->get();
        $attempts = QuizAttempt::where('user_id', $student->id)->whereHas('activity', fn ($q) => $q->where('module_id', $module->id))->with('activity')->latest()->paginate(10, ['*'], 'attempt_page');
        $events = LearningEvent::where('user_id', $student->id)->where('module_id', $module->id)->latest('id')->paginate(20, ['*'], 'event_page');
        $seconds = LearningSession::where('user_id', $student->id)->where('module_id', $module->id)->sum('active_seconds');

        $interactiveAttempts = InteractiveAttempt::where('user_id', $student->id)->whereHas('activity', fn ($q) => $q->where('module_id', $module->id))->with('activity')->latest()->paginate(10, ['*'], 'interactive_page');
        foreach ($interactiveAttempts as $i => $ia) {
            $interactiveAttempts[$i] = app(InteractiveService::class)->expire($ia);
        }
        $activities = ActivityProgress::with('activity')->where('user_id', $student->id)->whereHas('activity', fn ($q) => $q->where('module_id', $module->id))->get();
        $progress = ModuleProgress::where('user_id', $student->id)->where('module_id', $module->id)->first() ?? $progress;

        $submissions = LabSubmission::where('user_id', $student->id)->whereHas('activity', fn ($q) => $q->where('module_id', $module->id))->with('student', 'assessment', 'activity')->latest('id')->paginate(10, ['*'], 'practice_page');

        return view('assessment.reports.detail', compact('student', 'module', 'progress', 'activities', 'attempts', 'events', 'seconds', 'interactiveAttempts', 'submissions'));
    }

    public function attempt(Request $r, QuizAttempt $attempt, LearningReportService $reports, QuizService $quiz)
    {
        $reports->authorize($r->user(), $attempt->user_id, $attempt->activity->module_id, $this->filters($r));
        if ($attempt->status === 'in_progress' && ! $attempt->expires_at->isFuture()) {
            $attempt = $quiz->expire($attempt);
        }$questions = array_map(fn ($q) => $quiz->publicQuestion($q), $attempt->snapshot['questions']);
        $answers = $attempt->answers()->get()->keyBy('question_key');
        $review = $attempt->status !== 'in_progress';
        $staff = true;

        return view('assessment.student.result', compact('attempt', 'questions', 'answers', 'review', 'staff'));
    }

    public function export(Request $r, LearningReportService $reports, XlsxService $xlsx)
    {
        $filters = $this->filters($r);
        $mode = $r->validate(['format' => 'nullable|in:summary,activities,quiz,interactive'])['format'] ?? 'summary';
        $reports->expireScoped($r->user(), $filters);
        $pairs = $reports->pairs($r->user(), $filters);
        if ($mode === 'summary') {
            $query = $pairs->orderBy('u.name');
            $headers = ['nis', 'nama', 'username', 'modul', 'status_progres', 'progres_persen', 'komponen_wajib_selesai', 'komponen_wajib', 'rata_rata_kuis_terbaik', 'evaluasi_akhir_paket', 'rata_rata_praktik_terbaik', 'aktivitas_terakhir'];
            $format = fn ($row) => [$row->nis, $row->name, $row->username, $row->title, ['not_started' => 'Belum mulai', 'in_progress' => 'Dalam proses', 'completed' => 'Selesai'][$row->progress_status], $row->completion_percent, $row->completed_items ?? 0, $row->required_items ?? 0, $row->quiz_score ?? '', $row->final_score ?? '', $row->practice_score ?? '', $row->last_activity_at ?? ''];
        } elseif ($mode === 'activities') {
            $query = DB::query()->fromSub($pairs, 'p')->join('activities as a', 'a.module_id', '=', 'p.module_id')->leftJoin('activity_progress as ap', fn ($j) => $j->on('ap.activity_id', '=', 'a.id')->on('ap.user_id', '=', 'p.student_id'))->where(fn ($q) => $q->where(fn ($live) => $live->whereNull('a.deleted_at')->where('a.is_published', true))->orWhereNotNull('ap.id'))->select('p.nis', 'p.name', 'p.username', 'p.title', 'a.title as activity_title', 'a.kind', 'a.is_required', 'ap.status', 'ap.attempts_count', 'ap.best_score', 'ap.last_score', 'ap.completed_at')->orderBy('p.name')->orderBy('a.sort_order');
            $headers = ['nis', 'nama', 'username', 'modul', 'aktivitas', 'jenis', 'kewajiban', 'status', 'jumlah_percobaan', 'nilai_terbaik', 'nilai_terakhir', 'selesai_pada'];
            $format = fn ($row) => [$row->nis, $row->name, $row->username, $row->title, $row->activity_title, Activity::KINDS[$row->kind] ?? $row->kind, $row->is_required ? 'Wajib' : 'Opsional', ['not_started' => 'Belum mulai', 'in_progress' => 'Dalam proses', 'completed' => 'Selesai'][$row->status ?? 'not_started'], $row->attempts_count ?? 0, $row->best_score ?? '', $row->last_score ?? '', $row->completed_at ?? ''];
        } elseif ($mode === 'interactive') {
            $query = DB::query()->fromSub($pairs, 'p')->join('activities as a', 'a.module_id', '=', 'p.module_id')->join('interactive_attempts as ia', fn ($j) => $j->on('ia.activity_id', '=', 'a.id')->on('ia.user_id', '=', 'p.student_id'))->select('p.nis', 'p.name', 'p.username', 'p.title', 'a.title as activity_title', 'a.kind', 'ia.attempt_number', 'ia.activity_version_id', 'ia.status', 'ia.level', 'ia.resets_count', 'ia.score', 'ia.passed', 'ia.started_at', 'ia.finished_at')->orderBy('p.name')->orderBy('ia.id');
            $headers = ['nis', 'nama', 'username', 'modul', 'aktivitas', 'jenis', 'percobaan', 'versi_id', 'status', 'level', 'jumlah_reset', 'skor', 'lulus', 'mulai', 'selesai'];
            $format = fn ($row) => [$row->nis, $row->name, $row->username, $row->title, $row->activity_title, Activity::KINDS[$row->kind] ?? $row->kind, $row->attempt_number, $row->activity_version_id, $row->status, $row->level, $row->resets_count, $row->score ?? '', $row->passed ? 'Ya' : 'Belum', $row->started_at, $row->finished_at ?? ''];
        } else {
            $query = DB::query()->fromSub($pairs, 'p')->join('activities as a', 'a.module_id', '=', 'p.module_id')->join('quiz_attempts as qa', fn ($j) => $j->on('qa.activity_id', '=', 'a.id')->on('qa.user_id', '=', 'p.student_id'))->select('p.nis', 'p.name', 'p.username', 'p.title', 'a.title as activity_title', 'qa.attempt_number', 'qa.activity_version_id', 'qa.status', 'qa.score', 'qa.passed', 'qa.started_at', 'qa.submitted_at')->orderBy('p.name')->orderBy('qa.id');
            $headers = ['nis', 'nama', 'username', 'modul', 'aktivitas', 'percobaan', 'versi_id', 'status', 'nilai', 'kelulusan', 'mulai', 'selesai'];
            $format = fn ($row) => [$row->nis, $row->name, $row->username, $row->title, $row->activity_title, $row->attempt_number, $row->activity_version_id, ['in_progress' => 'Sedang dikerjakan', 'submitted' => 'Dikirim', 'expired' => 'Waktu habis'][$row->status], $row->score ?? '', $row->status === 'in_progress' ? 'Belum dinilai' : ($row->passed ? 'Lulus' : 'Belum lulus'), $row->started_at, $row->submitted_at ?? ''];
        }
        if (DB::query()->fromSub(clone $query, 'lim')->count() > 2000) {
            throw ValidationException::withMessages(['export' => 'Maksimal 2.000 baris laporan. Persempit filter.']);
        }
        $rows = $query->get();
        $path = $xlsx->write($headers, $rows->map($format));
        ExportJob::create(['user_id' => $r->user()->id, 'resource' => $mode === 'summary' ? 'learning_report' : ($mode === 'activities' ? 'learning_activities' : ($mode === 'interactive' ? 'learning_interactive' : 'learning_quiz')), 'row_count' => $rows->count()]);
        app(AuditService::class)->record('report.exported', $r->user()->id, ['rows' => $rows->count(), 'format' => $mode]);

        return response()->download($path, 'rekap-'.$mode.'-'.now()->format('Ymd-His').'.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Cache-Control' => 'private, no-store'])->deleteFileAfterSend(true);
    }
}
