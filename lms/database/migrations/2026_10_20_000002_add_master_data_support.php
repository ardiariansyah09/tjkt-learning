<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->softDeletes());
        Schema::table('rombel_students', function (Blueprint $t) {
            $t->timestamp('joined_at', 6)->change();
            $t->timestamp('left_at', 6)->nullable()->change();
        });
        Schema::create('imports', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->string('resource', 20);
            $t->string('filename');
            $t->unsignedInteger('succeeded')->default(0);
            $t->unsignedInteger('skipped')->default(0);
            $t->unsignedInteger('failed')->default(0);
            $t->json('details');
            $t->timestamps();
            $t->index(['user_id', 'created_at']);
        });
        Schema::create('export_jobs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->string('resource', 20);
            $t->unsignedInteger('row_count');
            $t->string('status', 20)->default('generated');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('export_jobs');
        Schema::dropIfExists('imports');
        Schema::table('users', fn (Blueprint $t) => $t->dropSoftDeletes());
    }
};
