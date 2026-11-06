<?php

namespace App\Http\Controllers\Learning;

use App\Http\Controllers\Controller;
use App\Http\Requests\SectionRequest;
use App\Models\Module;
use App\Models\ModuleSection;
use App\Services\AuditService;
use App\Services\ModuleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class SectionController extends Controller
{
    private function authorizeSection(Module $module, ModuleSection $section): void
    {
        Gate::authorize('update', $module);
        abort_unless($section->module_id === $module->id, 404);
    }

    public function create(Module $module)
    {
        Gate::authorize('update', $module);
        $section = new ModuleSection(['sort_order' => ($module->sections()->max('sort_order') ?? 0) + 10, 'is_published' => false, 'is_required' => true, 'progress_weight' => 1, 'kind' => 'theory']);

        return view('learning.manage.section', compact('module', 'section'));
    }

    public function store(SectionRequest $request, Module $module, ModuleService $service)
    {
        $service->section($module, $request->validated());

        return redirect()->route('learning.modules.edit', $module)->with('status', 'Submateri berhasil ditambahkan.');
    }

    public function edit(Module $module, ModuleSection $section)
    {
        $this->authorizeSection($module, $section);

        return view('learning.manage.section', compact('module', 'section'));
    }

    public function update(SectionRequest $request, Module $module, ModuleSection $section, ModuleService $service)
    {
        $this->authorizeSection($module, $section);
        $service->section($module, $request->validated(), $section);

        return redirect()->route('learning.modules.edit', $module)->with('status', 'Submateri berhasil diperbarui.');
    }

    public function destroy(Module $module, ModuleSection $section, ModuleService $service)
    {
        $this->authorizeSection($module, $section);
        $service->archiveSection($module, $section);

        return back()->with('status', 'Submateri diarsipkan tanpa menghapus histori.');
    }

    public function move(Request $request, Module $module, ModuleSection $section)
    {
        $this->authorizeSection($module, $section);
        $data = $request->validate(['direction' => 'required|in:up,down']);
        DB::transaction(function () use ($module, $section, $data) {
            Module::whereKey($module->id)->lockForUpdate()->firstOrFail();
            $all = $module->sections()->get();
            $index = $all->search(fn ($item) => $item->id === $section->id);
            $next = $data['direction'] === 'up' ? $index - 1 : $index + 1;
            if ($index === false || ! isset($all[$next])) {
                return;
            }$ids = $all->modelKeys();
            [$ids[$index],$ids[$next]] = [$ids[$next], $ids[$index]];
            foreach ($ids as $i => $id) {
                ModuleSection::whereKey($id)->update(['sort_order' => ($i + 1) * 10]);
            }app(AuditService::class)->record('section.reordered', auth()->id(), ['module_id' => $module->id, 'section_id' => $section->id]);
        });

        return back()->with('status', 'Urutan submateri disimpan.');
    }
}
