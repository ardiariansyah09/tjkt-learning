<?php

namespace App\Services;

use App\Models\Module;
use App\Models\ModuleSection;
use App\Models\Rombel;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ModuleService
{
    public function save(User $actor, array $data, ?Module $module = null, ?UploadedFile $thumbnail = null): Module
    {
        if ($module?->package_slug) throw ValidationException::withMessages(['module'=>'Gunakan halaman penugasan paket materi untuk mengatur kelas dan publikasi.']);
        $path = $thumbnail?->store('module-thumbnails', 'local');
        if ($thumbnail && ! $path) {
            throw ValidationException::withMessages(['thumbnail' => 'Thumbnail gagal disimpan. Hubungi admin untuk memeriksa izin penyimpanan.']);
        }
        try {
            return DB::transaction(function () use ($actor, $data, $module, $path) {
                $new = $module === null;
                if ($module) {
                    $module = Module::whereKey($module->id)->lockForUpdate()->firstOrFail();
                }
                $ids = array_map('intval', $data['rombel_ids'] ?? []);
                if ($actor->role === 'guru') {
                    $allowed = $actor->teachingRombels()->pluck('rombels.id')->all();
                    if (array_diff($ids, $allowed)) {
                        throw ValidationException::withMessages(['rombel_ids' => 'Guru hanya dapat menugaskan rombel yang diampu.']);
                    }if ($module) {
                        $ids = array_values(array_unique(array_merge($ids, $module->rombels()->whereNotIn('rombels.id', $allowed)->pluck('rombels.id')->all())));
                    }
                }
                if ($data['status'] === 'published') {
                    if (! $module || ! $module->sections()->where('is_published', true)->exists()) {
                        throw ValidationException::withMessages(['status' => 'Tambahkan minimal satu submateri terbit sebelum memublikasikan modul.']);
                    }
                    if (! Rombel::whereIn('id', $ids)->where('is_active', true)->exists()) {
                        throw ValidationException::withMessages(['rombel_ids' => 'Materi terbit memerlukan minimal satu penugasan rombel aktif.']);
                    }
                }
                $fields = collect($data)->only(['code', 'title', 'description', 'phase', 'grade', 'competency', 'objectives', 'estimated_minutes', 'sort_order', 'status', 'sequential_learning'])->all();
                if ($path) {
                    $fields['thumbnail'] = $path;
                }
                if ($data['status'] === 'published' && (! $module || $module->status !== 'published')) {
                    $fields['published_at'] = now();
                }
                if ($new) {
                    $module = Module::create($fields + ['created_by' => $actor->id]);
                } else {
                    $module->update($fields);
                }
                $module->rombels()->sync($ids);
                app(AuditService::class)->record($new ? 'module.created' : 'module.updated', $actor->id, ['module_id' => $module->id, 'status' => $module->status]);

                return $module;
            });
        } catch (\Throwable $e) {
            if ($path) {
                Storage::disk('local')->delete($path);
            }throw $e;
        }
    }

    public function section(Module $module, array $data, ?ModuleSection $section = null): ModuleSection
    {
        if ($module->package_slug) throw ValidationException::withMessages(['module'=>'Struktur paket materi dikelola melalui penerbitan versi paket.']);
        $result = DB::transaction(function () use ($module, $data, $section) {
            $module = Module::whereKey($module->id)->lockForUpdate()->firstOrFail();
            if ($section && $module->status === 'published' && $section->is_published && ! $data['is_published'] && $module->sections()->where('is_published', true)->count() <= 1) {
                throw ValidationException::withMessages(['is_published' => 'Tarik publikasi modul sebelum menyembunyikan submateri terbit terakhir.']);
            }
            $new = $section === null;
            if ($new) {
                $section = $module->sections()->create($data);
            } else {
                $section->update($data);
            }app(AuditService::class)->record($new ? 'section.created' : 'section.updated', auth()->id(), ['module_id' => $module->id, 'section_id' => $section->id]);

            return $section;
        });
        app(ProgressService::class)->refreshForModule($module);

        return $result;
    }

    public function archiveSection(Module $module, ModuleSection $section): void
    {
        if ($module->package_slug) throw ValidationException::withMessages(['module'=>'Tahap paket tidak dapat dihapus dari penyunting submateri.']);
        DB::transaction(function () use ($module, $section) {
            $module = Module::whereKey($module->id)->lockForUpdate()->firstOrFail();
            if ($module->status === 'published' && $section->is_published && $module->sections()->where('is_published', true)->count() <= 1) {
                throw ValidationException::withMessages(['section' => 'Tarik publikasi modul sebelum mengarsipkan submateri terbit terakhir.']);
            }$section->delete();
            app(AuditService::class)->record('section.archived', auth()->id(), ['module_id' => $module->id, 'section_id' => $section->id]);
        });
        app(ProgressService::class)->refreshForModule($module);
    }

    public function duplicate(User $actor, Module $source): Module
    {
        if ($source->package_slug) throw ValidationException::withMessages(['module'=>'Gunakan penugasan kelas untuk memakai paket yang sama tanpa menyalin progres.']);
        return DB::transaction(function () use ($actor, $source) {
            app(PrerequisiteService::class)->lockGraph();
            $source = Module::whereKey($source->id)->lockForUpdate()->firstOrFail();
            $copy = $source->replicate(['code', 'published_at']);
            $copy->code = substr($source->code, 0, 25).'-'.Str::upper(Str::random(8));
            $copy->title = mb_substr('Salinan '.$source->title, 0, 200);
            $copy->status = 'draft';
            $copy->created_by = $actor->id;
            $copy->save();
            $sectionMap = [];
            foreach ($source->sections as $section) {
                $new = $section->replicate();
                $new->module_id = $copy->id;
                $new->save();
                $sectionMap[$section->id] = $new->id;
            }
            foreach ($source->activities()->with('currentVersion', 'questions')->get() as $activity) {
                if ($activity->module_section_id && ! isset($sectionMap[$activity->module_section_id])) {
                    continue;
                }
                $newActivity = $activity->replicate(['current_version_id']);
                $newActivity->module_id = $copy->id;
                $newActivity->module_section_id = $activity->module_section_id ? $sectionMap[$activity->module_section_id] : null;
                $newActivity->is_published = false;
                $newActivity->save();
                $newActivity->questions()->sync($activity->questions->mapWithKeys(fn ($q) => [$q->id => ['position' => $q->pivot->position]])->all());
                if ($activity->currentVersion) {
                    $version = $newActivity->versions()->create(['created_by' => $actor->id, 'version' => 1, 'definition' => $activity->currentVersion->definition]);
                    $newActivity->update(['current_version_id' => $version->id]);
                }
            }
            foreach ($source->prerequisites as $rule) {
                $copy->prerequisites()->create($rule->only(['required_module_id', 'type', 'min_score']));
            }app(AuditService::class)->record('module.duplicated', $actor->id, ['module_id' => $copy->id, 'source_id' => $source->id]);

            return $copy;
        });
    }

    public function archive(Module $module): void
    {
        DB::transaction(function () use ($module) {
            app(PrerequisiteService::class)->lockGraph();
            $module = Module::whereKey($module->id)->lockForUpdate()->firstOrFail();
            if (DB::table('module_prerequisites')->where('required_module_id', $module->id)->exists()) {
                throw ValidationException::withMessages(['module' => 'Modul masih menjadi prasyarat. Lepaskan hubungan tersebut atau gunakan status Archived tanpa menghapus dari daftar.']);
            }$module->update(['status' => 'archived']);
            $module->delete();
            app(AuditService::class)->record('module.archived', auth()->id(), ['module_id' => $module->id]);
        });
    }
}
