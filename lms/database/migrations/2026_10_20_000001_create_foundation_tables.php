<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('username')->unique();
            $t->string('nis')->nullable()->unique();
            $t->string('email')->nullable()->change();
            $t->enum('role', ['admin', 'guru', 'siswa'])->default('siswa')->index();
            $t->boolean('is_active')->default(true)->index();
            $t->boolean('must_change_password')->default(true);
        });
        Schema::create('rombels', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->unsignedTinyInteger('grade');
            $t->string('academic_year', 9);
            $t->unsignedTinyInteger('semester');
            $t->boolean('is_active')->default(true);
            $t->timestamps();
            $t->softDeletes();
            $t->unique(['name', 'academic_year', 'semester']);
        });
        Schema::create('rombel_students', function (Blueprint $t) {
            $t->id();
            $t->foreignId('rombel_id')->constrained()->restrictOnDelete();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->timestamp('joined_at');
            $t->timestamp('left_at')->nullable();
            $t->timestamps();
            $t->index(['user_id', 'left_at']);
            $t->unique(['rombel_id', 'user_id', 'joined_at']);
        });
        Schema::create('teacher_rombel', function (Blueprint $t) {
            $t->id();
            $t->foreignId('rombel_id')->constrained()->restrictOnDelete();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->timestamps();
            $t->unique(['rombel_id', 'user_id']);
        });
        Schema::create('modules', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('title');
            $t->text('description')->nullable();
            $t->string('phase')->nullable();
            $t->unsignedTinyInteger('grade')->nullable();
            $t->text('competency')->nullable();
            $t->text('objectives')->nullable();
            $t->unsignedInteger('estimated_minutes')->default(0);
            $t->unsignedInteger('sort_order')->default(0);
            $t->string('thumbnail')->nullable();
            $t->enum('status', ['draft', 'published', 'unpublished', 'archived'])->default('draft')->index();
            $t->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $t->timestamp('published_at')->nullable();
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('module_assignments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('module_id')->constrained()->restrictOnDelete();
            $t->foreignId('rombel_id')->constrained()->restrictOnDelete();
            $t->timestamps();
            $t->unique(['module_id', 'rombel_id']);
        });
        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('event')->index();
            $t->string('ip_address', 45)->nullable();
            $t->json('metadata')->nullable();
            $t->timestamp('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        foreach (['audit_logs', 'module_assignments', 'modules', 'teacher_rombel', 'rombel_students', 'rombels'] as $table) {
            Schema::dropIfExists($table);
        }Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['username', 'nis', 'role', 'is_active', 'must_change_password']));
    }
};
