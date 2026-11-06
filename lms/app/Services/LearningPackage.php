<?php

namespace App\Services;

use App\Models\Module;
use App\Models\ModuleProgress;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LearningPackage
{
    public function manifest(): array
    {
        return json_decode(file_get_contents(storage_path('app/learning-pack/manifest.json')), true, 512, JSON_THROW_ON_ERROR);
    }

    public function entry(Module $module): array
    {
        $stored=DB::table('learning_package_definitions')->where('version',$module->package_version)->first();
        if($stored){$entry=json_decode($stored->definition,true,512,JSON_THROW_ON_ERROR);abort_unless($entry['id']===$module->package_slug,404);return $entry;}
        $definition=storage_path('app/learning-pack/definitions/'.$module->package_version.'.json');
        $entry=is_file($definition)?json_decode(file_get_contents($definition),true,512,JSON_THROW_ON_ERROR):null;
        if (!$entry) {
            $entry = collect($this->manifest())->firstWhere('id', $module->package_slug);
            abort_unless($entry && hash('sha256',json_encode($entry))===$module->package_version,409,'Definisi versi materi tidak tersedia. Hubungi admin.');
        }
        abort_unless($entry['id']===$module->package_slug,404);
        return $entry;
    }

    public function asset(array $entry,string $path): string
    {
        // A compatible content revision never changes the assessment version,
        // progress key, stage schema, snapshots or offline queue namespace.
        $revision=DB::table('learning_package_content_revisions')->where('version',hash('sha256',json_encode($entry)))->value('release');
        $release=$revision??$entry['contentVersion'];
        $stored=DB::table('learning_package_assets')->where('release',$release)->where('path',$path)->first();
        if($stored){
            $bytes=base64_decode($stored->content_base64,true);
            abort_unless($bytes!==false&&hash('sha256',$bytes)===$stored->sha256,503,'Isi materi belum dapat dibaca.');
            return $bytes;
        }
        abort_if(DB::table('learning_package_definitions')->where('version',hash('sha256',json_encode($entry)))->exists(),404);
        // Compatibility for an unimported preview release; published releases are
        // fully imported and checked before activation.
        $root=realpath(storage_path('app/learning-pack/releases/'.$release.'/site'));
        $file=$root?realpath($root.'/'.$path):false;
        abort_unless($file&&str_starts_with($file,$root.DIRECTORY_SEPARATOR)&&is_file($file),404);
        return file_get_contents($file);
    }

    public function snapshot(User $user, Module $module): ?object
    {
        return DB::table('package_snapshots')->where('user_id', $user->id)->where('module_id', $module->id)->where('version', $module->package_version)->first();
    }

    public function acceptsKey(array $entry, string $key): bool
    {
        return $key === $entry['key'] || str_starts_with($key, 'tjkt:'.$entry['id'].':')
            || ($entry['id'] === 'pengenalan-jaringan' && str_starts_with($key, 'tjkt:intro-network:'))
            || ($entry['id'] === 'topologi-jaringan' && str_starts_with($key, 'tjkt:topology:'));
    }

    public function grades(array $entry, array $data): array
    {
        $state = json_decode($data[$entry['key']] ?? '{}', true) ?: [];
        if (!is_array($state)) $state=[];
        $result = [];
        $prior = true;
        foreach ($entry['stages'] as $stage) {
            $raw = $state['passed'][$stage['id']] ?? null;
            $grade = is_int($raw) || is_float($raw) ? $raw : ($state['scores'][$stage['id']] ?? null);
            $valid = is_numeric($grade) && $grade >= 0 && $grade <= 100;
            $passed = $prior && (bool) $raw && $valid && $grade >= $stage['threshold'];
            $result[] = $stage + ['grade' => $valid ? (float) $grade : null, 'passed' => $passed];
            $prior = $passed;
        }
        return $result;
    }

    public function recalculate(User $user, Module $module, bool $touch = false): ModuleProgress
    {
        $snapshot = $this->snapshot($user, $module);
        $data = $snapshot ? json_decode($snapshot->data, true) : [];
        $stages = collect($this->grades($this->entry($module), $data));
        $done = $stages->where('passed', true)->count();
        $row = ModuleProgress::firstOrNew(['user_id' => $user->id, 'module_id' => $module->id]);
        $wasComplete = $row->status === 'completed';
        $row->required_items = $stages->count();
        $row->completed_items = $done;
        $row->completion_percent = $stages->isEmpty() ? 0 : round(100 * $done / $stages->count(), 2);
        $row->status = $done === $stages->count() && $done > 0 ? 'completed' : ($snapshot ? 'in_progress' : 'not_started');
        $row->final_score = $stages->last()['grade'] ?? null;
        $row->quiz_score = null;
        $row->practice_score = null;
        if ($touch) {
            $row->started_at ??= now();
            $row->last_activity_at = now();
        }
        $row->completed_at = $row->status === 'completed' ? ($row->completed_at ?? now()) : null;
        if ($row->completed_at) $row->first_completed_at ??= now();
        $row->save();
        if (!$wasComplete && $row->status === 'completed') {
            app(ProgressService::class)->event($user, $module, 'module.completed', ['source' => $snapshot->source, 'reported_by_client' => true]);
        }
        return $row;
    }
}
