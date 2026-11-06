<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('questions')) {
            Schema::create('questions', function (Blueprint $t) {
                $t->id();
                $t->foreignId('created_by')->constrained('users')->restrictOnDelete();
                $t->string('type', 20);
                $t->text('prompt');
                $t->text('scenario')->nullable();
                $t->text('explanation')->nullable();
                $t->json('answer_config')->nullable();
                $t->decimal('points', 8, 2)->default(1);
                $t->boolean('is_shared')->default(false);
                $t->timestamps();
                $t->softDeletes();
                $t->index(['created_by', 'type']);
            });
        }
        if (! Schema::hasTable('question_options')) {
            Schema::create('question_options', function (Blueprint $t) {
                $t->id();
                $t->foreignId('question_id')->constrained()->restrictOnDelete();
                $t->string('answer_key', 40);
                $t->text('label');
                $t->text('target')->nullable();
                $t->boolean('is_correct')->default(false);
                $t->unsignedSmallInteger('position');
                $t->unique(['question_id', 'answer_key']);
            });
        }
        if (! Schema::hasTable('activities')) {
            Schema::create('activities', function (Blueprint $t) {
                $t->id();
                $t->foreignId('module_id')->constrained()->restrictOnDelete();
                $t->foreignId('module_section_id')->nullable()->constrained()->restrictOnDelete();
                $t->string('kind', 20);
                $t->string('title');
                $t->text('instructions')->nullable();
                $t->boolean('is_published')->default(false);
                $t->boolean('is_required')->default(true);
                $t->unsignedSmallInteger('progress_weight')->default(1);
                $t->unsignedInteger('sort_order')->default(0);
                $t->unsignedBigInteger('current_version_id')->nullable();
                $t->timestamps();
                $t->softDeletes();
                $t->index(['module_id', 'is_published']);
            });
        }
        if (! Schema::hasTable('activity_questions')) {
            Schema::create('activity_questions', function (Blueprint $t) {
                $t->id();
                $t->foreignId('activity_id')->constrained()->restrictOnDelete();
                $t->foreignId('question_id')->constrained()->restrictOnDelete();
                $t->unsignedSmallInteger('position');
                $t->unique(['activity_id', 'question_id']);
            });
        }
        if (! Schema::hasTable('activity_versions')) {
            Schema::create('activity_versions', function (Blueprint $t) {
                $t->id();
                $t->foreignId('activity_id')->constrained()->restrictOnDelete();
                $t->foreignId('created_by')->constrained('users')->restrictOnDelete();
                $t->unsignedInteger('version');
                $t->json('definition');
                $t->timestamps();
                $t->unique(['activity_id', 'version']);
            });
        }
        if (! collect(Schema::getForeignKeys('activities'))->contains(fn ($key) => $key['columns'] === ['current_version_id'])) {
            Schema::table('activities', fn (Blueprint $t) => $t->foreign('current_version_id')->references('id')->on('activity_versions')->restrictOnDelete());
        }
        if (! Schema::hasTable('learning_sessions')) {
            Schema::create('learning_sessions', function (Blueprint $t) {
                $t->uuid('id')->primary();
                $t->foreignId('user_id')->constrained()->restrictOnDelete();
                $t->foreignId('module_id')->constrained()->restrictOnDelete();
                $t->foreignId('module_section_id')->constrained()->restrictOnDelete();
                $t->dateTime('started_at');
                $t->dateTime('last_seen_at');
                $t->unsignedInteger('active_seconds')->default(0);
                $t->dateTime('ended_at')->nullable();
                $t->index(['user_id', 'module_section_id']);
                $t->index(['user_id', 'ended_at']);
            });
        }
        if (! Schema::hasTable('quiz_attempts')) {
            Schema::create('quiz_attempts', function (Blueprint $t) {
                $t->id();
                $t->foreignId('user_id')->constrained()->restrictOnDelete();
                $t->foreignId('activity_id')->constrained()->restrictOnDelete();
                $t->foreignId('activity_version_id')->constrained()->restrictOnDelete();
                $t->unsignedInteger('attempt_number');
                $t->string('status', 20)->default('in_progress');
                $t->json('snapshot');
                $t->dateTime('started_at');
                $t->dateTime('expires_at');
                $t->dateTime('submitted_at')->nullable();
                $t->decimal('score', 5, 2)->nullable();
                $t->boolean('passed')->default(false);
                $t->timestamps();
                $t->unique(['user_id', 'activity_id', 'attempt_number']);
                $t->index(['status', 'expires_at']);
            });
        }
        if (! Schema::hasTable('quiz_answers')) {
            Schema::create('quiz_answers', function (Blueprint $t) {
                $t->id();
                $t->foreignId('quiz_attempt_id')->constrained()->restrictOnDelete();
                $t->string('question_key', 40);
                $t->json('answer');
                $t->boolean('is_correct')->nullable();
                $t->decimal('awarded_points', 8, 2)->nullable();
                $t->timestamps();
                $t->unique(['quiz_attempt_id', 'question_key']);
            });
        }
        if (! Schema::hasTable('activity_progress')) {
            Schema::create('activity_progress', function (Blueprint $t) {
                $t->id();
                $t->foreignId('user_id')->constrained()->restrictOnDelete();
                $t->foreignId('activity_id')->constrained()->restrictOnDelete();
                $t->string('status', 20)->default('in_progress');
                $t->unsignedInteger('attempts_count')->default(0);
                $t->decimal('last_score', 5, 2)->nullable();
                $t->decimal('best_score', 5, 2)->nullable();
                $t->dateTime('started_at');
                $t->dateTime('last_activity_at');
                $t->dateTime('completed_at')->nullable();
                $t->json('validator_result')->nullable();
                $t->timestamps();
                $t->unique(['user_id', 'activity_id']);
            });
        }
        if (! Schema::hasTable('module_progress')) {
            Schema::create('module_progress', function (Blueprint $t) {
                $t->id();
                $t->foreignId('user_id')->constrained()->restrictOnDelete();
                $t->foreignId('module_id')->constrained()->restrictOnDelete();
                $t->string('status', 20)->default('not_started');
                $t->decimal('completion_percent', 5, 2)->default(0);
                $t->unsignedInteger('completed_items')->default(0);
                $t->unsignedInteger('required_items')->default(0);
                $t->decimal('quiz_score', 5, 2)->nullable();
                $t->dateTime('started_at')->nullable();
                $t->dateTime('last_activity_at')->nullable();
                $t->dateTime('first_completed_at')->nullable();
                $t->dateTime('completed_at')->nullable();
                $t->timestamps();
                $t->unique(['user_id', 'module_id']);
                $t->index(['module_id', 'status']);
            });
        }
        if (! Schema::hasTable('learning_events')) {
            Schema::create('learning_events', function (Blueprint $t) {
                $t->id();
                $t->foreignId('user_id')->constrained()->restrictOnDelete();
                $t->foreignId('module_id')->constrained()->restrictOnDelete();
                $t->foreignId('activity_id')->nullable()->constrained()->restrictOnDelete();
                $t->foreignId('module_section_id')->nullable()->constrained()->restrictOnDelete();
                $t->string('event', 40);
                $t->json('metadata')->nullable();
                $t->dateTime('created_at')->useCurrent();
                $t->index(['user_id', 'module_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        foreach (['learning_events', 'module_progress', 'activity_progress', 'quiz_answers', 'quiz_attempts', 'learning_sessions'] as $name) {
            Schema::dropIfExists($name);
        }Schema::table('activities', fn (Blueprint $t) => $t->dropForeign(['current_version_id']));
        foreach (['activity_versions', 'activity_questions', 'activities', 'question_options', 'questions'] as $name) {
            Schema::dropIfExists($name);
        }
    }
};
