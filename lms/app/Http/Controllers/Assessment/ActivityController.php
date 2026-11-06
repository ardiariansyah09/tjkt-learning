<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Http\Requests\ActivityRequest;
use App\Models\Activity;
use App\Models\Module;
use App\Services\ActivityService;
use App\Services\QuestionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ActivityController extends Controller
{
    public function index(Module $module)
    {
        Gate::authorize('update', $module);
        $activities = $module->activities()->with('section', 'currentVersion')->get();

        return view('assessment.activities.index', compact('module', 'activities'));
    }

    private function form(Request $r, Module $module, Activity $activity)
    {
        Gate::authorize('update', $module);
        $sections = $module->sections()->get();
        $questions = app(QuestionService::class)->visible($r->user())->latest()->get();
        $config = $activity->exists ? $activity->currentVersion->definition : ['passing_score' => 100, 'max_attempts' => 3, 'duration_minutes' => 15, 'question_count' => 1, 'random_questions' => true, 'shuffle_options' => true, 'min_active_seconds' => 30];

        $config = array_merge(['passing_score' => 100, 'max_attempts' => 3, 'duration_minutes' => 30, 'question_count' => 1, 'random_questions' => true, 'shuffle_options' => true, 'min_active_seconds' => 0, 'scenario' => 'guided', 'level' => 1, 'rubric' => null, 'due_at' => null], $config);

        $config += ['game_template' => 'memory', 'game_difficulty' => 'medium'];

        return view('assessment.activities.form', compact('module', 'activity', 'sections', 'questions', 'config'));
    }

    public function create(Request $r, Module $module)
    {
        return $this->form($r, $module, new Activity(['kind' => $r->boolean('game') ? 'game' : 'checkpoint', 'is_published' => false, 'is_required' => true, 'progress_weight' => 1, 'sort_order' => 10]));
    }

    public function store(ActivityRequest $r, Module $module, ActivityService $s)
    {
        $s->save($r->user(), $module, $r->validated());

        return redirect()->route('assessment.activities.index', $module)->with('status', 'Aktivitas dan versi soal disimpan.');
    }

    public function edit(Request $r, Module $module, Activity $activity)
    {
        abort_unless($activity->module_id === $module->id, 404);
        $activity->load('questions');

        return $this->form($r, $module, $activity);
    }

    public function update(ActivityRequest $r, Module $module, Activity $activity, ActivityService $s)
    {
        abort_unless($activity->module_id === $module->id, 404);
        $s->save($r->user(), $module, $r->validated(), $activity);

        return redirect()->route('assessment.activities.index', $module)->with('status', 'Aktivitas diperbarui dalam versi baru; percobaan lama tidak berubah.');
    }

    public function destroy(Request $r, Module $module, Activity $activity, ActivityService $s)
    {
        Gate::authorize('update', $module);
        abort_unless($activity->module_id === $module->id, 404);
        $s->archive($r->user(), $activity);

        return back()->with('status', 'Aktivitas diarsipkan; jawaban, nilai dan riwayat tetap tersimpan.');
    }
}
