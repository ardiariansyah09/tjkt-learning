<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\InteractiveAttempt;
use App\Models\Module;
use App\Services\GameTemplates;
use App\Services\InteractiveDefinition;
use App\Services\InteractiveService;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;

class GamePreviewController extends Controller
{
    private function authorizePreview(Module $module, Activity $activity): void
    {
        Gate::authorize('preview', $module);
        abort_unless($activity->module_id === $module->id && in_array($activity->kind, ['game', 'matching', 'drag_drop', 'sorting'], true), 404);
    }

    private function attempt(Activity $activity, array $data): InteractiveAttempt
    {
        $attempt = new InteractiveAttempt($data);
        $attempt->setRelation('activity', $activity);

        return $attempt;
    }

    public function show(Request $request, Module $module, Activity $activity, InteractiveService $service)
    {
        $this->authorizePreview($module, $activity);
        $snapshot = app(InteractiveDefinition::class)->snapshot($activity->currentVersion->definition) + ['title' => 'Pratinjau: '.$activity->title, 'instructions' => $activity->instructions];
        $data = ['snapshot' => $snapshot, 'state' => $service->initial($snapshot), 'revision' => 0, 'status' => 'in_progress', 'resets_count' => 0, 'level' => $snapshot['level'], 'attempt_number' => 0, 'activity_version_id' => $activity->current_version_id, 'expires_at' => now()->addMinutes(30)->toIso8601String()];
        // One bounded preview per signed-in session; no attempts/progress are written.
        $request->session()->put('game_preview', ['activity_id' => $activity->id, 'data' => $data]);
        $attempt = $this->attempt($activity, $data);
        $config = app(InteractiveDefinition::class)->publicConfig($snapshot) + ['preview' => true];
        $runtime = $service->response($attempt);
        $staff = false;
        $events = new LengthAwarePaginator([], 0, 20);
        $previewUrl = route('assessment.activities.preview.action', [$module, $activity]);

        return response()->view('assessment.interactive.attempt', compact('attempt', 'config', 'runtime', 'staff', 'events', 'previewUrl'))->header('Cache-Control', 'private, no-store');
    }

    public function action(Request $request, Module $module, Activity $activity, InteractiveService $service)
    {
        $this->authorizePreview($module, $activity);
        $input = $request->validate(['revision' => 'required|integer|min:0|max:1000', 'action' => 'required|in:answer,play,checkpoint,reset,submit', 'answer' => 'sometimes|array|max:12', 'input' => 'required_if:action,play|array:key,target,cell,value,start,end,direction,choice|max:8']);
        $preview = $request->session()->get('game_preview');
        abort_unless($preview && $preview['activity_id'] === $activity->id && now()->lt($preview['data']['expires_at']), 419, 'Pratinjau kedaluwarsa. Buka kembali pratinjau.');
        $data = $preview['data'];
        abort_unless($data['revision'] === (int) $input['revision'], 409);
        abort_if($data['revision'] >= 1000, 422);
        $snapshot = $data['snapshot'];
        switch ($input['action']) {
            case 'play':
                abort_unless($snapshot['kind'] === 'game', 422);
                $data['state'] = app(GameTemplates::class)->play($snapshot, $data['state'], $input['input']);
                break;
            case 'answer':
                abort_if($snapshot['kind'] === 'game', 422);
                $data['state']['answer'] = $service->validateAnswer($snapshot, $input['answer'] ?? []);
                break;
            case 'reset':
                abort_if($data['resets_count'] >= 3, 422, 'Maksimal tiga reset. Buka kembali pratinjau untuk memulai ulang.');
                $data['state'] = $service->initial($snapshot);
                $data['resets_count']++;
                break;
        }
        $data['revision']++;
        $request->session()->put('game_preview', ['activity_id' => $activity->id, 'data' => $data]);
        $attempt = $this->attempt($activity, $data);
        $response = $service->response($attempt, 'Pratinjau tersimpan sementara; tidak memengaruhi nilai siswa.');
        if (in_array($input['action'], ['checkpoint', 'submit'], true)) {
            $response['checkpoint'] = $service->evaluate($attempt);
        }

        return response()->json($response)->header('Cache-Control', 'private, no-store');
    }
}
