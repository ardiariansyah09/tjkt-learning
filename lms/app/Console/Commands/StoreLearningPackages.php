<?php

namespace App\Console\Commands;

use App\Services\LearningPackage;
use App\Services\PackageContentStore;
use Illuminate\Console\Command;

class StoreLearningPackages extends Command
{
    protected $signature='learning:store-packages';
    protected $description='Simpan definisi dan seluruh isi paket materi ke database tanpa mengubah progres siswa.';
    public function handle(LearningPackage $packages,PackageContentStore $store): int
    {
        $this->info(json_encode($store->import($packages->manifest()),JSON_PRETTY_PRINT));
        return self::SUCCESS;
    }
}
