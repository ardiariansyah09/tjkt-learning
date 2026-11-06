<?php

namespace App\Console\Commands;

use App\Models\Module;
use App\Models\ModuleProgress;
use App\Models\User;
use App\Services\LearningPackage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportLearningPackages extends Command
{
    protected $signature = 'learning:import-packages {--author= : ID admin pemilik materi}';
    protected $description = 'Daftarkan paket materi sebagai draft; tidak mengubah materi lama atau menugaskan kelas otomatis.';

    public function handle(LearningPackage $packages): int
    {
        $author = User::whereKey($this->option('author'))->where('role', 'admin')->where('is_active', true)->first();
        if (!$author) { $this->error('Tentukan --author dengan ID admin aktif.'); return self::FAILURE; }
        $manifest = $packages->manifest();
        DB::transaction(function () use ($manifest, $author) {
            foreach ($manifest as $index=>$entry) {
                $version = hash('sha256', json_encode($entry));
                $directory=storage_path('app/learning-pack/definitions');
                if(!is_dir($directory))mkdir($directory,0755,true);
                $definition=$directory.'/'.$version.'.json';
                if(!is_file($definition))file_put_contents($definition,json_encode($entry,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
                $module = Module::withTrashed()->where('package_slug', $entry['id'])->first();
                if ($module && $module->package_version !== $version) {
                    throw new \RuntimeException('Modul '.$entry['id'].' sudah mempunyai versi lain. Tinjau rilis/siklus baru sebelum mengubah versi.');
                }
                if ($module) continue;
                $module = Module::create(['code'=>'PKG-'.substr(hash('sha256', $entry['id']),0,20), 'package_slug'=>$entry['id'], 'package_version'=>$version, 'title'=>$entry['title'], 'description'=>$entry['description'], 'phase'=>$entry['phase'], 'grade'=>$entry['grade'], 'competency'=>$entry['category'], 'objectives'=>'Pelajari materi, jalankan aktivitas, dan selesaikan evaluasi sesuai urutan tahap.', 'sort_order'=>1000+$index, 'status'=>'draft', 'created_by'=>$author->id, 'sequential_learning'=>false]);
                foreach ($entry['stages'] as $i=>$stage) {
                    $module->sections()->create(['title'=>$stage['title'], 'kind'=>'theory', 'content'=>'Tahap ini tersedia pada paket materi interaktif.', 'sort_order'=>$i, 'is_published'=>true, 'is_required'=>true, 'progress_weight'=>1]);
                }
            }
            foreach ($manifest as $entry) {
                $module = Module::where('package_slug',$entry['id'])->firstOrFail();
                foreach ($entry['prerequisites'] as $slug) {
                    $required = Module::where('package_slug', $slug)->firstOrFail();
                    $module->prerequisites()->firstOrCreate(['required_module_id'=>$required->id, 'type'=>'module_completed'], ['min_score'=>null]);
                }
            }
        });
        $this->info(count($manifest).' paket tersedia sebagai draft. Pilih kelas dan terbitkan melalui Materi.');
        return self::SUCCESS;
    }
}
