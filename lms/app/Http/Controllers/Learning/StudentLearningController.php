<?php

namespace App\Http\Controllers\Learning;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleSection;
use App\Models\User;
use App\Services\LearningAccessService;
use App\Services\LearningSequence;
use App\Services\ProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class StudentLearningController extends Controller
{
    public function index(Request $request, LearningAccessService $access)
    {
        $data = $request->validate(['q' => 'nullable|string|max:100', 'grade' => 'nullable|in:10,11,12']);
        $query = $access->catalog($request->user())->with('author')->withCount(['sections' => fn ($q) => $q->where('is_published', true)]);
        if ($request->filled('q')) {
            $query->where(fn ($q) => $q->where('title', 'like', '%'.addcslashes($data['q'], '%_\\').'%')->orWhere('code', 'like', '%'.addcslashes($data['q'], '%_\\').'%'));
        }if ($request->filled('grade')) {
            $query->where('grade', $data['grade']);
        }$modules = $query->orderBy('sort_order')->orderBy('id')->paginate(9)->withQueryString();
        $locks = [];
        foreach ($modules as $module) {
            $locks[$module->id] = $access->reasons($request->user(), $module);
        }

        return view('learning.student.index', compact('modules', 'locks'));
    }

    public function show(Request $request, Module $module, LearningAccessService $access)
    {
        abort_unless($access->discover($request->user(), $module), 404);
        $reasons = $access->reasons($request->user(), $module);
        if (!$reasons && $module->package_slug) return redirect()->route('packages.launch', $module);
        $sections = $reasons ? collect() : $module->sections()->where('is_published', true)->get();

        $activities = $reasons ? collect() : $module->activities()->where('is_published', true)->whereNotNull('current_version_id')->where(fn ($q) => $q->whereNull('module_section_id')->orWhereHas('section', fn ($s) => $s->where('is_published', true)->whereNull('deleted_at')))->get();

        return view('learning.student.show', compact('module', 'reasons', 'sections', 'activities'));
    }

    public function section(Request $request, Module $module, ModuleSection $section)
    {
        Gate::authorize('view', $module);
        if ($module->package_slug) return redirect()->route('packages.launch', $module);
        abort_unless($section->module_id === $module->id && $section->is_published, 404);
        $sections = $module->sections()->where('is_published', true)->get();
        $index = $sections->search(fn ($s) => $s->id === $section->id);
        $previous = $index > 0 ? $sections[$index - 1] : null;
        $next = $sections[$index + 1] ?? null;

        abort_unless(app(LearningSequence::class)->allows($request->user(), $section), 403, 'Selesaikan submateri sebelumnya terlebih dahulu.');
        $activities = $section->activities()->where('is_published', true)->whereNotNull('current_version_id')->get();

        return view('learning.student.section', compact('module', 'section', 'sections', 'previous', 'next', 'activities'));
    }

    public function complete(Request $request, Module $module, ModuleSection $section)
    {
        Gate::authorize('view', $module);
        abort_unless($section->module_id === $module->id && $section->is_published, 404);
        abort_unless(app(LearningSequence::class)->allows($request->user(), $section), 403);
        DB::transaction(function () use ($request, $module, $section) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless(app(LearningSequence::class)->allows($request->user(), $section), 403);
            $state = app(LearningSequence::class)->states($request->user(), $module)[$section->id];
            abort_if($state['needs_assessment'] && ! $state['complete'], 422, 'Luluskan checkpoint dan aktivitas wajib pada submateri ini terlebih dahulu.');
            if (! $state['needs_assessment']) {
                $created = DB::table('section_completions')->insertOrIgnore(['user_id' => $request->user()->id, 'module_section_id' => $section->id, 'completed_at' => now()]);
                if ($created) {
                    app(ProgressService::class)->event($request->user(), $module, 'section.acknowledged', [], null, $section->id);
                }
            }
            app(ProgressService::class)->recalculate($request->user(), $module, true);
        });

        return back()->with('status', 'Submateri selesai. Langkah berikutnya sudah dapat dibuka.');
    }

    public function thumbnail(Request $request, Module $module, LearningAccessService $access)
    {
        abort_unless($request->user()->role === 'siswa' ? $access->discover($request->user(), $module) : $request->user()->can('preview', $module), 403);
        abort_unless($module->thumbnail && Storage::disk('local')->exists($module->thumbnail), 404);

        return Storage::disk('local')->response($module->thumbnail, null, ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
