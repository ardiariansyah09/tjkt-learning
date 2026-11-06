<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $t) {
            $t->string('package_slug')->nullable()->unique();
            $t->string('package_version', 64)->nullable();
        });
        Schema::table('module_progress', fn (Blueprint $t) => $t->decimal('final_score', 5, 2)->nullable());
        Schema::create('package_snapshots', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->foreignId('module_id')->constrained()->restrictOnDelete();
            $t->string('version', 64);
            $t->unsignedInteger('revision')->default(0);
            $t->json('data');
            $t->string('source')->default('browser');
            $t->timestamps();
            $t->unique(['user_id', 'module_id', 'version']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('package_snapshots');
        Schema::table('module_progress', fn (Blueprint $t) => $t->dropColumn('final_score'));
        Schema::table('modules', fn (Blueprint $t) => $t->dropColumn(['package_slug','package_version']));
    }
};
