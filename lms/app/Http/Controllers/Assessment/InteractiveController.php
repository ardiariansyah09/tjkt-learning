<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\InteractiveAttempt;
use App\Services\InteractiveDefinition;
use App\Services\InteractiveService;
use App\Services\LearningReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class InteractiveController extends Controller
{
    public function start(Request $r, Activity $activity, InteractiveService $s)
    {
        Gate::authorize('view', $activity);

        return redirect()->route('interactive.attempt', $s->start($r->user(), $activity));
    }

    public function show(Request $r, InteractiveAttempt $interactive, InteractiveService $s)
    {
        abort_unless($interactive->user_id === $r->user()->id, 403);
        $interactive = $s->expire($interactive);
        if ($interactive->status === 'in_progress') {
            Gate::authorize('view', $interactive->activity);
        }

        return $this->render($interactive, $s, false);
    }

    public function staff(Request $r, InteractiveAttempt $interactive, InteractiveService $s, LearningReportService $reports)
    {
        $filters = $r->validate(['academic_year' => 'nullable|string|max:9', 'semester' => 'nullable|in:1,2', 'rombel_id' => 'nullable|integer|min:1']);
        $reports->authorize($r->user(), $interactive->user_id, $interactive->activity->module_id, $filters);

        return $this->render($s->expire($interactive), $s, true);
    }

    private function render(InteractiveAttempt $attempt, InteractiveService $s, bool $staff)
    {
        $config = app(InteractiveDefinition::class)->publicConfig($attempt->snapshot);
        $runtime = $s->response($attempt);
        $events = $attempt->events()->latest('revision')->paginate(20);

        return view('assessment.interactive.attempt', compact('attempt', 'config', 'runtime', 'staff', 'events'));
    }

    public function action(Request $r, InteractiveAttempt $interactive, InteractiveService $s)
    {
        abort_unless($interactive->user_id === $r->user()->id, 403);
        if ($r->input('action') === 'command' && $r->has('argv')) {
            $tokens = $r->validate(['argv' => 'required|array|min:1|max:16', 'argv.*' => 'required|string|max:160']);
            $r->merge(['command' => implode(' ', $tokens['argv'])]);
        }
        $data = $r->validate(['revision' => 'required|integer|min:0', 'action' => 'required|in:command,write,answer,play,checkpoint,reset,submit', 'command' => 'required_if:action,command|string|max:300', 'content' => 'required_if:action,write|string|max:8000', 'answer' => 'sometimes|array|max:12', 'input' => 'required_if:action,play|array:key,target,cell,value,start,end,direction,choice|max:8']);

        return response()->json($s->act($r->user(), $interactive, $data))->header('Cache-Control', 'private, no-store');
    }
}
