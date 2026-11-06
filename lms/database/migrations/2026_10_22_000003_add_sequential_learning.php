<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('modules', fn (Blueprint $t) => $t->boolean('sequential_learning')->default(false));
        Schema::create('section_completions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->foreignId('module_section_id')->constrained()->restrictOnDelete();
            $t->timestamp('completed_at');
            $t->unique(['user_id', 'module_section_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('section_completions');
        Schema::table('modules', fn (Blueprint $t) => $t->dropColumn('sequential_learning'));
    }
};
