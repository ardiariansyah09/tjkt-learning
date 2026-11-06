<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Rombel;
use App\Services\LearningReportService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AnalyticsController extends Controller
{
    public function __invoke(Request $r, LearningReportService $reports)
    {
        $filters = $r->validate(['academic_year' => 'nullable|string|max:9', 'semester' => 'nullable|in:1,2', 'rombel_id' => 'nullable|integer|min:1', 'module_id' => 'nullable|integer|min:1', 'from' => 'nullable|date', 'to' => 'nullable|date']);
        $to = empty($filters['to']) ? CarbonImmutable::now()->endOfDay() : CarbonImmutable::parse($filters['to'])->endOfDay();
        $from = empty($filters['from']) ? $to->startOfDay()->subDays(13) : CarbonImmutable::parse($filters['from'])->startOfDay();
        if ($from->gt($to) || $from->diffInDays($to) > 90) {
            throw ValidationException::withMessages(['from' => 'Pilih rentang tanggal berurutan maksimal 90 hari.']);
        }
        $scope = collect($filters)->only(['academic_year', 'semester', 'rombel_id', 'module_id'])->all();
        $reports->expireScoped($r->user(), $scope);
        $pairs = $reports->pairs($r->user(), $scope);
        $summary = DB::query()->fromSub(clone $pairs, 'p')->selectRaw("COUNT(*) as assignments, COALESCE(SUM(progress_status='completed'),0) as completed, COALESCE(AVG(completion_percent),0) as progress, AVG(quiz_score) as quiz_score, AVG(practice_score) as practice_score")->first();
        $scopeEvents = fn ($q) => $q->selectRaw('1')->fromSub(clone $pairs, 'p')->whereColumn('p.student_id', 'e.user_id')->whereColumn('p.module_id', 'e.module_id');
        $daily = DB::table('learning_events as e')->whereExists($scopeEvents)->whereBetween('e.created_at', [$from, $to])->selectRaw('DATE(e.created_at) as day, COUNT(*) as total')->groupByRaw('DATE(e.created_at)')->pluck('total', 'day');
        $days = [];
        for ($day = $from; $day->lte($to); $day = $day->addDay()) {
            $days[] = ['date' => $day->format('d/m'), 'total' => (int) ($daily[$day->toDateString()] ?? 0)];
        }
        $maxEvents = max(1, ...array_column($days, 'total'));
        $practice = DB::table('lab_submissions as s')->join('activities as a', 'a.id', '=', 's.activity_id')->whereExists(fn ($q) => $q->selectRaw('1')->fromSub(clone $pairs, 'p')->whereColumn('p.student_id', 's.user_id')->whereColumn('p.module_id', 'a.module_id'))->selectRaw("COUNT(*) as total, COALESCE(SUM(s.status='pending'),0) as pending, COALESCE(SUM(s.status='revision_requested' AND NOT EXISTS (SELECT 1 FROM lab_submissions newer WHERE newer.user_id=s.user_id AND newer.activity_id=s.activity_id AND newer.attempt_number>s.attempt_number)),0) as revisions, COALESCE(SUM(s.status='approved'),0) as approved, MIN(CASE WHEN s.status='pending' THEN s.submitted_at END) as oldest_pending")->first();
        $risk = DB::query()->fromSub(clone $pairs, 'p')->where('progress_status', '!=', 'completed')->where(fn ($q) => $q->whereNull('last_activity_at')->orWhere('last_activity_at', '<', now()->subDays(7)))->orderByRaw('last_activity_at IS NOT NULL')->orderBy('last_activity_at')->orderBy('name')->paginate(15)->withQueryString();
        $activityStats = DB::query()->fromSub(clone $pairs, 'p')->join('activities as a', 'a.module_id', '=', 'p.module_id')->leftJoin('activity_progress as ap', fn ($j) => $j->on('ap.activity_id', '=', 'a.id')->on('ap.user_id', '=', 'p.student_id'))->where(fn ($q) => $q->where(fn ($live) => $live->whereNull('a.deleted_at')->where('a.is_published', true)->whereNotNull('a.current_version_id')->where(fn ($s) => $s->whereNull('a.module_section_id')->orWhereExists(fn ($section) => $section->selectRaw('1')->from('module_sections as sec')->whereColumn('sec.id', 'a.module_section_id')->whereNull('sec.deleted_at')->where('sec.is_published', true))))->orWhereNotNull('ap.id'))->select('a.id', 'a.title', 'a.kind')->selectRaw('COUNT(*) as assigned, COUNT(ap.id) as started, COALESCE(SUM(ap.completed_at IS NOT NULL),0) as completed, AVG(ap.best_score) as best_average')->groupBy('a.id', 'a.title', 'a.kind')->orderBy('a.title')->limit(30)->get();
        $rombels = $r->user()->role === 'admin' ? Rombel::withTrashed()->orderBy('name')->get() : $r->user()->teachingRombels()->withTrashed()->orderBy('name')->get();
        $modules = Module::withTrashed()->whereIn('id', $reports->pairs($r->user(), ['history' => true])->select('m.id'))->orderBy('title')->get();

        return view('assessment.analytics',compact('summary','practice','risk','activityStats','days','maxEvents','from','to','rombels','modules'));
    }
}
