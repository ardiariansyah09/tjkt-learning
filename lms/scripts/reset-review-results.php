<?php
require __DIR__.'/../vendor/autoload.php';
$app=require __DIR__.'/../bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if(base_path()!=='/home/adminnazh/tjkt-lms-review-20261028'||config('database.default')!=='sqlite'||config('database.connections.sqlite.database')!==base_path('database/review.sqlite'))throw new RuntimeException('Review database required.');
$ids=App\Models\User::whereIn('username',['review.siswa','review.siswa2'])->pluck('id');
Illuminate\Support\Facades\DB::transaction(function()use($ids){
 foreach(['package_snapshots','module_progress','learning_events'] as $table)Illuminate\Support\Facades\DB::table($table)->whereIn('user_id',$ids)->delete();
});
echo "Only synthetic review students reset.\n";
