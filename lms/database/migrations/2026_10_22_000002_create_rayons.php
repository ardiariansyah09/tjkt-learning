<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rayons', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('rayon_id')->nullable()->after('rayon')->constrained('rayons')->restrictOnDelete();
        });
        foreach (['Cia' => 6, 'Cib' => 4, 'Cic' => 10, 'Cis' => 7, 'Suk' => 2, 'Taj' => 6, 'Wik' => 5] as $prefix => $count) {
            for ($number = 1; $number <= $count; $number++) {
                $name = $prefix.' '.$number;
                $id = DB::table('rayons')->insertGetId(['name' => $name, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
                DB::table('users')->where('rayon', $name)->update(['rayon_id' => $id]);
            }
        }
        if (DB::table('users')->whereNotNull('rayon')->where('rayon', '!=', '')->whereNull('rayon_id')->exists()) {
            throw new RuntimeException('Ada rayon lama yang tidak cocok dengan master. Periksa data sebelum melanjutkan.');
        }
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropConstrainedForeignId('rayon_id'));
        Schema::dropIfExists('rayons');
    }
};
