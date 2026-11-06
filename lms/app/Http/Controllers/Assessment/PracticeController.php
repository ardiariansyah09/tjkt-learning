<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Http\Requests\PracticeAssessmentRequest;
use App\Http\Requests\PracticeSubmissionRequest;
use App\Models\Activity;
use App\Models\ExportJob;
use App\Models\LabSubmission;
use App\Models\LabSubmissionFile;
use App\Models\Module;
use App\Models\Rombel;
use App\Services\AuditService;
use App\Services\LearningReportService;
use App\Services\PracticeService;
use App\Services\XlsxService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PracticeController extends Controller
{
    public function activity(Request $r, Activity $activity)
    {
        Gate::authorize('view', $activity);
        abort_unless($activity->kind === 'practice', 404);
        $submissions = $activity->submissions()->where('user_id', $r->user()->id)->with('assessment', 'files')->latest('attempt_number')->get();
        $config = $activity->currentVersion->definition;

        return view('assessment.practice.activity', compact('activity', 'submissions', 'config'));
    }

    public function store(PracticeSubmissionRequest $r, Activity $activity, PracticeService $service)
    {
        $submission = $service->submit($r->user(), $activity, $r->validated(), $r->file('evidence'));

        return redirect()->route('practice.show', $submission)->with('status', 'Bukti tersimpan privat dan menunggu penilaian guru.');
    }

    public function show(Request $r, LabSubmission $submission)
    {
        Gate::authorize('view', $submission);
        $submission->load('activity.module', 'student', 'files', 'assessment.assessor');

        return view('assessment.practice.show', compact('submission'));
    }

    public function assess(PracticeAssessmentRequest $r, LabSubmission $submission, PracticeService $service)
    {
        $service->assess($r->user(), $submission, $r->validated());

        return redirect()->route('practice.show', $submission)->with('status', 'Penilaian tersimpan; progres diperbarui.');
    }

    public function download(Request $r, LabSubmissionFile $evidence)
    {
        Gate::authorize('view', $evidence->submission);
        abort_unless(Storage::disk('evidence')->exists($evidence->path), 404, 'Berkas tidak ditemukan. Hubungi administrator.');
        app(AuditService::class)->record('practice.evidence_downloaded', $r->user()->id, ['submission_id' => $evidence->lab_submission_id, 'file_id' => $evidence->id]);

        return Storage::disk('evidence')->download($evidence->path, $evidence->original_name, ['Content-Type' => 'application/octet-stream', 'Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff', 'Content-Security-Policy' => "sandbox; default-src 'none'"]);
    }

    public function viewer(LabSubmissionFile $evidence)
    {
        Gate::authorize('view', $evidence->submission);
        abort_unless($evidence->mime === 'application/pdf', 415);
        abort_unless(Storage::disk('evidence')->exists($evidence->path), 404);

        return response()->view('assessment.practice.pdf-viewer', compact('evidence'))->header('Cache-Control', 'private, no-store')->header('X-Frame-Options', 'SAMEORIGIN')->header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'self'");
    }

    public function preview(Request $r, LabSubmissionFile $evidence)
    {
        Gate::authorize('view', $evidence->submission);
        abort_unless(in_array($evidence->mime, ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'], true), 415);
        abort_unless(Storage::disk('evidence')->exists($evidence->path), 404, 'Berkas tidak ditemukan. Hubungi administrator.');
        app(AuditService::class)->record('practice.evidence_previewed', $r->user()->id, ['submission_id' => $evidence->lab_submission_id, 'file_id' => $evidence->id]);

        return Storage::disk('evidence')->response($evidence->path, $evidence->original_name, [
            'Content-Type' => $evidence->mime,
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; frame-ancestors 'self'",
            'X-Frame-Options' => 'SAMEORIGIN',
            'Referrer-Policy' => 'no-referrer',
        ], 'inline');
    }

    private function filters(Request $r): array
    {
        return $r->validate(['q' => 'nullable|string|max:100', 'status' => 'nullable|in:pending,revision_requested,approved', 'academic_year' => 'nullable|string|max:9', 'semester' => 'nullable|in:1,2', 'rombel_id' => 'nullable|integer|min:1', 'module_id' => 'nullable|integer|min:1', 'from' => 'nullable|date', 'to' => ['nullable', 'date', Rule::when($r->filled('from'), 'after_or_equal:from')]]);
    }

    private function query(Request $r, PracticeService $s, array $filters)
    {
        $q = $s->scoped($r->user(), $filters)->with('student', 'activity.module', 'assessment.assessor');
        if (! empty($filters['q'])) {
            $value = '%'.addcslashes($filters['q'], '%_\\').'%';
            $q->whereHas('student', fn ($u) => $u->where(fn ($w) => $w->where('name', 'like', $value)->orWhere('nis', 'like', $value)));
        }
        if (! empty($filters['status'])) {
            $q->where('status', $filters['status']);
        }
        if (! empty($filters['from'])) {
            $q->whereDate('submitted_at', '>=', $filters['from']);
        }
        if (! empty($filters['to'])) {
            $q->whereDate('submitted_at', '<=', $filters['to']);
        }

        return $q;
    }

    public function index(Request $r, PracticeService $service)
    {
        $filters = $this->filters($r);
        $q = $this->query($r, $service, $filters);
        $summary = (clone $q)->reorder()->selectRaw("COUNT(*) as total, COALESCE(SUM(status='pending'),0) as pending, COALESCE(SUM(status='revision_requested'),0) as revisions, COALESCE(SUM(status='approved'),0) as approved")->first();
        $submissions = $q->latest('submitted_at')->latest('id')->paginate(15)->withQueryString();
        $rombels = $r->user()->role === 'admin' ? Rombel::withTrashed()->orderBy('name')->get() : $r->user()->teachingRombels()->withTrashed()->orderBy('name')->get();
        $modules = Module::withTrashed()->whereIn('id', app(LearningReportService::class)->pairs($r->user(), ['history' => true])->select('m.id'))->orderBy('title')->get();

        return view('assessment.practice.index', compact('submissions', 'summary', 'rombels', 'modules'));
    }

    public function export(Request $r, PracticeService $s, XlsxService $xlsx)
    {
        $q = $this->query($r, $s, $this->filters($r))->latest('id');
        if ((clone $q)->count() > 2000) {
            throw ValidationException::withMessages(['export' => 'Maksimal 2.000 baris. Persempit filter.']);
        }
        $rows = $q->get();
        $path = $xlsx->write(['nis', 'nama', 'modul', 'praktik', 'versi_id', 'pengumpulan', 'status', 'nilai', 'penilai', 'catatan', 'dikirim', 'dinilai'], $rows->map(fn ($r) => [$r->student?->nis, $r->student?->name, $r->activity->module->title, $r->snapshot['title'], $r->activity_version_id, $r->attempt_number, LabSubmission::STATUSES[$r->status], $r->assessment?->score ?? '', $r->assessment?->assessor?->name ?? '', $r->assessment?->feedback ?? '', $r->submitted_at->toDateTimeString(), $r->assessed_at?->toDateTimeString() ?? '']));
        ExportJob::create(['user_id' => $r->user()->id, 'resource' => 'learning_practice', 'row_count' => $rows->count()]);
        app(AuditService::class)->record('practice.exported', $r->user()->id, ['rows' => $rows->count()]);

        return response()->download($path, 'rekap-praktik-'.now()->format('Ymd-His').'.xlsx', ['Cache-Control' => 'private, no-store'])->deleteFileAfterSend(true);
    }
}
