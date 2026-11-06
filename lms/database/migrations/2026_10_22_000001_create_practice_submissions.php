<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_submissions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->foreignId('activity_id')->constrained()->restrictOnDelete();
            $t->foreignId('activity_version_id')->constrained()->restrictOnDelete();
            $t->unsignedInteger('attempt_number');
            $t->string('status', 30)->default('pending');
            $t->uuid('request_key');
            $t->json('snapshot');
            $t->text('report');
            $t->dateTime('submitted_at');
            $t->dateTime('assessed_at')->nullable();
            $t->timestamps();
            $t->unique(['user_id', 'activity_id', 'attempt_number']);
            $t->unique(['user_id', 'request_key']);
            $t->index(['status', 'submitted_at']);
        });
        Schema::create('lab_submission_files', function (Blueprint $t) {
            $t->id();
            $t->foreignId('lab_submission_id')->constrained()->restrictOnDelete();
            $t->string('path')->unique();
            $t->string('original_name', 180);
            $t->string('mime', 80);
            $t->unsignedInteger('size_bytes');
            $t->char('sha256', 64);
            $t->timestamps();
        });
        Schema::create('lab_assessments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('lab_submission_id')->unique()->constrained()->restrictOnDelete();
            $t->foreignId('assessed_by')->constrained('users')->restrictOnDelete();
            $t->string('decision', 30);
            $t->decimal('score', 5, 2)->nullable();
            $t->text('feedback');
            $t->dateTime('assessed_at');
            $t->timestamps();
        });
        Schema::table('module_progress', fn (Blueprint $t) => $t->decimal('practice_score', 5, 2)->nullable());
    }

    public function down(): void
    {
        Schema::table('module_progress', fn (Blueprint $t) => $t->dropColumn('practice_score'));
        Schema::dropIfExists('lab_assessments');
        Schema::dropIfExists('lab_submission_files');
        Schema::dropIfExists('lab_submissions');
    }
};
