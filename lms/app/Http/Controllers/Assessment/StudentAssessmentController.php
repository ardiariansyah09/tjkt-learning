<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityProgress;
use App\Models\InteractiveAttempt;
use App\Models\LabSubmission;
use App\Models\LearningEvent;
use App\Models\LearningSession;
use App\Models\ModuleProgress;
use App\Models\ModuleSection;
use App\Models\QuizAttempt;
use App\Services\InteractiveDefinition;
use App\Services\InteractiveService;
use App\Services\LearningAccessService;
use App\Services\LearningSequence;
use App\Services\QuizService;
use App\Services\ReadingTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class StudentAssessmentController extends Controller
{
    public function activity(Request $r, Activity $activity, QuizService $quiz)
    {
        Gate::authorize('view', $activity);
        if ($activity->kind === 'practice') {
            return redirect()->route('practice.activity', $activity);
        }
        if (isset(InteractiveDefinition::KINDS[$activity->kind])) {
            $attempts = $activity->interactiveAttempts()->where('user_id', $r->user()->id)->latest()->get();
            foreach ($attempts as $a) {
                app(InteractiveService::class)->expire($a);
            }
            $attempts = $activity->interactiveAttempts()->where('user_id', $r->user()->id)->latest()->get();
            $config = $activity->currentVersion->definition;

            return view('assessment.interactive.activity', compact('activity', 'attempts', 'config'));
        }
        $attempts = QuizAttempt::where('user_id', $r->user()->id)->where('activity_id', $activity->id)->latest()->get();
        foreach ($attempts as $a) {
            if ($a->status === 'in_progress' && ! $a->expires_at->isFuture()) {
                $quiz->expire($a);
            }
        }$attempts = QuizAttempt::where('user_id', $r->user()->id)->where('activity_id', $activity->id)->latest()->get();
        $config = $activity->currentVersion->definition;
        $seconds = $activity->kind === 'checkpoint' ? app(ReadingTracker::class)->seconds($r->user(), $activity->module_section_id) : 0;

        return view('assessment.student.activity', compact('activity', 'attempts', 'config', 'seconds'));
    }

    public function start(Request $r, Activity $activity, QuizService $quiz)
    {
        Gate::authorize('view', $activity);
        $attempt = $quiz->start($r->user(), $activity);

        return redirect()->route('assessment.student.attempt', $attempt);
    }

    public function attempt(Request $r, QuizAttempt $attempt, QuizService $quiz)
    {
        abort_unless($attempt->user_id === $r->user()->id, 403);
        if ($attempt->status === 'in_progress' && ! $attempt->expires_at->isFuture()) {
            $attempt = $quiz->expire($attempt);
        }if ($attempt->status === 'in_progress') {
            Gate::authorize('view', $attempt->activity);
        }
        $questions = array_map(fn ($q) => $quiz->publicQuestion($q), $attempt->snapshot['questions']);
        $answers = $attempt->answers()->get()->keyBy('question_key');
        $review = $quiz->canReview($attempt);
        $staff = false;

        return view($attempt->status === 'in_progress' ? 'assessment.student.attempt' : 'assessment.student.result', compact('attempt', 'questions', 'answers', 'review', 'staff'));
    }

    public function save(Request $r, QuizAttempt $attempt, QuizService $quiz)
    {
        abort_unless($attempt->user_id === $r->user()->id, 403);
        if ($attempt->status === 'in_progress') {
            Gate::authorize('view', $attempt->activity);
        }$data = $r->validate(['answers' => 'sometimes|array|max:100']);
        $attempt = $quiz->save($r->user(), $attempt, $data['answers'] ?? [], false);

        return response()->json(['status' => $attempt->status, 'saved_at' => now()->toIso8601String()]);
    }

    public function submit(Request $r, QuizAttempt $attempt, QuizService $quiz)
    {
        abort_unless($attempt->user_id === $r->user()->id, 403);
        if ($attempt->status === 'in_progress') {
            Gate::authorize('view', $attempt->activity);
        }$data = $r->validate(['answers' => 'sometimes|array|max:100']);
        $attempt = $quiz->save($r->user(), $attempt, $data['answers'] ?? [], true);

        return redirect()->route('assessment.student.attempt', $attempt)->with('status', 'Percobaan sudah dinilai oleh server.');
    }

    public function readingStart(Request $r, ModuleSection $section, ReadingTracker $tracker)
    {
        Gate::authorize('view', $section->module);
        abort_unless(app(LearningSequence::class)->allows($r->user(), $section), 403);
        abort_unless($section->is_published, 404);
        $session = $tracker->start($r->user(), $section);

        return response()->json(['session_id' => $session->id, 'active_seconds' => $tracker->seconds($r->user(), $section->id)]);
    }

    public function heartbeat(Request $r, LearningSession $session, ReadingTracker $tracker)
    {
        abort_unless($session->user_id === $r->user()->id, 403);
        $section = ModuleSection::findOrFail($session->module_section_id);
        Gate::authorize('view', $section->module);
        abort_unless(app(LearningSequence::class)->allows($r->user(), $section), 403);
        abort_unless($section->is_published, 404);
        $session = $tracker->heartbeat($r->user(), $session);

        return response()->json(['active_seconds' => $tracker->seconds($r->user(), $section->id)]);
    }

    public function progress(Request $r)
    {
        foreach (InteractiveAttempt::where('user_id', $r->user()->id)->where('status', 'in_progress')->where('expires_at', '<=', now())->limit(100)->get() as $a) {
            app(InteractiveService::class)->expire($a);
        }
        $progress = ModuleProgress::with('module')->where('user_id', $r->user()->id)->latest('last_activity_at')->paginate(12);
        $events = LearningEvent::where('user_id', $r->user()->id)->latest('id')->paginate(15, ['*'], 'event_page');
        $activities = ActivityProgress::with('activity')->where('user_id', $r->user()->id)->latest('last_activity_at')->limit(20)->get();
        $available = app(LearningAccessService::class)->catalog($r->user())->orderBy('sort_order')->paginate(9, ['*'], 'catalog_page');
        $snapshots = ModuleProgress::where('user_id', $r->user()->id)->whereIn('module_id', $available->modelKeys())->get()->keyBy('module_id');
        $pending = Activity::with('module')->leftJoin('activity_progress as learner_progress', fn ($j) => $j->on('learner_progress.activity_id', '=', 'activities.id')->where('learner_progress.user_id', $r->user()->id))->whereNull('learner_progress.completed_at')->where('activities.is_published', true)->whereNotNull('activities.current_version_id')->whereIn('activities.module_id', app(LearningAccessService::class)->catalog($r->user())->select('modules.id'))->where(fn ($q) => $q->whereNull('activities.module_section_id')->orWhereHas('section', fn ($s) => $s->where('is_published', true)->whereNull('deleted_at')))->select('activities.*')->orderBy('activities.sort_order')->paginate(10, ['*'], 'pending_page');

        $interactiveAttempts = InteractiveAttempt::where('user_id', $r->user()->id)->with('activity')->latest('id')->paginate(10, ['*'], 'interactive_page');
        foreach ($interactiveAttempts as $i => $a) {
            $interactiveAttempts[$i] = app(InteractiveService::class)->expire($a);
        }

        $submissions = LabSubmission::where('user_id', $r->user()->id)->with('activity', 'assessment')->latest('id')->paginate(10, ['*'], 'practice_page');

        return view('assessment.student.progress', compact('progress', 'events', 'activities', 'available', 'snapshots', 'pending', 'interactiveAttempts', 'submissions'));
    }
}
