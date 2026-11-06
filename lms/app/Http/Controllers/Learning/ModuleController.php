<?php

namespace App\Http\Controllers\Learning;

use App\Http\Controllers\Controller;
use App\Http\Requests\ModuleRequest;
use App\Http\Requests\PrerequisiteRequest;
use App\Models\Module;
use App\Models\Rombel;
use App\Models\User;
use App\Services\ModuleService;
use App\Services\PrerequisiteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ModuleController extends Controller
{
    public function visible(User $user)
    {
        $query = Module::query();
        if ($user->role === 'guru') {
            $query->where(fn ($q) => $q->where('created_by', $user->id)->orWhere(fn($p)=>$p->whereNotNull('package_slug')->where('status','published'))->orWhereHas('rombels', fn ($r) => $r->whereHas('teachers', fn ($t) => $t->where('users.id', $user->id))));
        }

        return $query;
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Module::class);
        $data = $request->validate(['q' => 'nullable|string|max:100', 'status' => 'nullable|in:draft,published,unpublished,archived', 'grade' => 'nullable|in:10,11,12']);
        $query = $this->visible($request->user())->with('author')->withCount('sections', 'rombels');
        if ($request->filled('q')) {
            $query->where(fn ($q) => $q->where('title', 'like', '%'.addcslashes($data['q'], '%_\\').'%')->orWhere('code', 'like', '%'.addcslashes($data['q'], '%_\\').'%'));
        }foreach (['status', 'grade'] as $key) {
            if ($request->filled($key)) {
                $query->where($key, $data[$key]);
            }
        }$modules = $query->orderBy('sort_order')->orderBy('id')->paginate(12)->withQueryString();

        return view('learning.manage.index', compact('modules'));
    }

    private function formData(Request $request, Module $module): array
    {
        $rombels = $request->user()->role === 'admin' ? Rombel::orderBy('name')->get() : $request->user()->teachingRombels()->orderBy('name')->get();

        return compact('module', 'rombels');
    }

    public function create(Request $request)
    {
        Gate::authorize('create', Module::class);

        return view('learning.manage.form', $this->formData($request, new Module(['status' => 'draft', 'grade' => 10, 'phase' => 'E', 'sort_order' => 0, 'estimated_minutes' => 90])));
    }

    public function store(ModuleRequest $request, ModuleService $service)
    {
        Gate::authorize('create', Module::class);
        $module = $service->save($request->user(), $request->validated(), null, $request->file('thumbnail'));

        return redirect()->route('learning.modules.edit', $module)->with('status', 'Modul dibuat. Tambahkan submateri sebelum memublikasikan.');
    }

    public function edit(Request $request, Module $module)
    {
        if ($module->package_slug) return redirect()->route('packages.manage', $module);
        Gate::authorize('update', $module);
        $module->load('sections', 'rombels', 'prerequisites.requiredModule');
        $candidates = $this->visible($request->user())->where('id', '!=', $module->id)->orderBy('title')->get();

        return view('learning.manage.form', $this->formData($request, $module) + compact('candidates'));
    }

    public function update(ModuleRequest $request, Module $module, ModuleService $service)
    {
        Gate::authorize('update', $module);
        $service->save($request->user(), $request->validated(), $module, $request->file('thumbnail'));

        return back()->with('status', 'Modul, publikasi, dan penugasan berhasil disimpan.');
    }

    public function preview(Request $request, Module $module)
    {
        Gate::authorize('preview', $module);
        if ($module->package_slug) return redirect()->route('packages.launch', $module);
        $module->load('sections', 'author', 'rombels', 'prerequisites.requiredModule');
        $sections = $module->sections()->where('is_published', true)->get();
        $input = $request->validate(['section' => 'nullable|integer|min:1', 'mode' => 'nullable|in:teacher,student']);
        $section = isset($input['section']) ? $sections->firstWhere('id', (int) $input['section']) : $sections->first();
        abort_if(isset($input['section']) && ! $section, 404);
        if (! $section) {
            return back()->with('status', 'Tambahkan submateri terbit untuk melihat tampilan belajar siswa.');
        }
        $index = $sections->search(fn ($item) => $item->id === $section->id);
        $previous = $index > 0 ? $sections[$index - 1] : null;
        $next = $sections[$index + 1] ?? null;
        $activities = $section->activities()->where('is_published', true)->whereNotNull('current_version_id')->get();
        $isPreview = true;
        $previewAsStudent = ($input['mode'] ?? 'teacher') === 'student';

        return view('learning.student.section', compact('module', 'sections', 'section', 'previous', 'next', 'activities', 'isPreview', 'previewAsStudent'));
    }

    public function prerequisites(PrerequisiteRequest $request, Module $module, PrerequisiteService $service)
    {
        $rules = $request->validated('rules', []);
        foreach ($rules as $rule) {
            $source = Module::findOrFail($rule['required_module_id']);
            abort_unless(($request->user()->can('preview', $source) || $module->prerequisites()->where('required_module_id', $source->id)->exists()), 403);
        }
        $service->replace($module, $rules);

        return back()->with('status', 'Prasyarat berhasil disimpan. Seluruh syarat harus terpenuhi.');
    }

    public function duplicate(Request $request, Module $module, ModuleService $service)
    {
        Gate::authorize('preview', $module);
        Gate::authorize('create', Module::class);
        $copy = $service->duplicate($request->user(), $module);

        return redirect()->route('learning.modules.edit', $copy)->with('status', 'Salinan draft dibuat tanpa penugasan rombel.');
    }

    public function destroy(Module $module, ModuleService $service)
    {
        Gate::authorize('delete', $module);
        $service->archive($module);

        return redirect()->route('learning.modules.index')->with('status', 'Modul diarsipkan. Submateri, verifikasi, dan histori tetap tersimpan.');
    }
}
