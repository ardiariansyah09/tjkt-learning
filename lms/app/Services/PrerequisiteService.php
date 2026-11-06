<?php

namespace App\Services;

use App\Models\Module;
use App\Models\ModulePrerequisite;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PrerequisiteService
{
    public function lockGraph(): void
    {
        DB::table('learning_locks')->where('name', 'prerequisites')->lockForUpdate()->firstOrFail();
    }

    public function replace(Module $module, array $rules): void
    {
        DB::transaction(function () use ($module, $rules) {
            $this->lockGraph();
            Module::whereKey($module->id)->lockForUpdate()->firstOrFail();
            $edges = ModulePrerequisite::where('module_id', '!=', $module->id)->get(['module_id', 'required_module_id']);
            $graph = [];
            foreach ($edges as $edge) {
                $graph[$edge->module_id][] = $edge->required_module_id;
            }
            foreach ($rules as $rule) {
                $id = (int) $rule['required_module_id'];
                if ($id === $module->id) {
                    throw ValidationException::withMessages(['rules' => 'Modul tidak boleh menjadi prasyarat dirinya sendiri.']);
                }$graph[$module->id][] = $id;
            }
            $visiting = [];
            $done = [];
            $visit = function (int $node) use (&$visit, &$visiting, &$done, $graph) {
                if (isset($visiting[$node])) {
                    throw ValidationException::withMessages(['rules' => 'Prasyarat melingkar terdeteksi. Periksa rantai materi.']);
                }if (isset($done[$node])) {
                    return;
                }$visiting[$node] = true;
                foreach ($graph[$node] ?? [] as $next) {
                    $visit((int) $next);
                }unset($visiting[$node]);
                $done[$node] = true;
            };
            foreach (array_keys($graph) as $node) {
                $visit((int) $node);
            }
            $module->prerequisites()->delete();
            foreach ($rules as $rule) {
                $module->prerequisites()->create(['required_module_id' => $rule['required_module_id'], 'type' => $rule['type'], 'min_score' => $rule['type'] === 'quiz_score' ? $rule['min_score'] : null]);
            }
            app(AuditService::class)->record('module.prerequisites_changed', auth()->id(), ['module_id' => $module->id, 'count' => count($rules)]);
        });
    }
}
