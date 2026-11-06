<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_sections', function (Blueprint $t) {
            $t->id();
            $t->foreignId('module_id')->constrained()->restrictOnDelete();
            $t->string('title');
            $t->string('kind', 30)->default('theory');
            $t->longText('content');
            $t->unsignedInteger('sort_order')->default(0);
            $t->boolean('is_published')->default(false);
            $t->boolean('is_required')->default(true);
            $t->unsignedSmallInteger('progress_weight')->default(1);
            $t->timestamps();
            $t->softDeletes();
            $t->index(['module_id', 'is_published', 'sort_order']);
        });
        Schema::create('module_prerequisites', function (Blueprint $t) {
            $t->id();
            $t->foreignId('module_id')->constrained()->restrictOnDelete();
            $t->foreignId('required_module_id')->constrained('modules')->restrictOnDelete();
            $t->string('type', 30);
            $t->unsignedTinyInteger('min_score')->nullable();
            $t->timestamps();
            $t->unique(['module_id', 'required_module_id', 'type'], 'module_requirement_unique');
        });
        Schema::create('learning_verifications', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->foreignId('module_id')->constrained()->restrictOnDelete();
            $t->string('type', 30);
            $t->unsignedTinyInteger('score')->nullable();
            $t->text('note');
            $t->foreignId('verified_by')->constrained('users')->restrictOnDelete();
            $t->timestamp('verified_at');
            $t->timestamp('revoked_at')->nullable();
            $t->foreignId('revoked_by')->nullable()->constrained('users')->restrictOnDelete();
            $t->text('revocation_reason')->nullable();
            $t->timestamps();
            $t->index(['user_id', 'module_id', 'type', 'revoked_at'], 'verification_lookup');
        });
        Schema::create('module_access_overrides', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->foreignId('module_id')->constrained()->restrictOnDelete();
            $t->foreignId('granted_by')->constrained('users')->restrictOnDelete();
            $t->text('reason');
            $t->timestamp('expires_at')->nullable();
            $t->timestamp('revoked_at')->nullable();
            $t->foreignId('revoked_by')->nullable()->constrained('users')->restrictOnDelete();
            $t->text('revocation_reason')->nullable();
            $t->timestamps();
            $t->index(['user_id', 'module_id', 'revoked_at']);
        });
        Schema::create('learning_locks', function (Blueprint $t) {
            $t->string('name')->primary();
        });
        DB::table('learning_locks')->insert(['name' => 'prerequisites']);
    }

    public function down(): void
    {
        foreach (['learning_locks', 'module_access_overrides', 'learning_verifications', 'module_prerequisites', 'module_sections'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
