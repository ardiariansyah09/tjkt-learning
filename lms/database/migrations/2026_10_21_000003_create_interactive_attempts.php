<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interactive_attempts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->foreignId('activity_id')->constrained()->restrictOnDelete();
            $t->foreignId('activity_version_id')->constrained()->restrictOnDelete();
            $t->unsignedInteger('attempt_number');
            $t->string('status', 20)->default('in_progress');
            $t->json('snapshot');
            $t->json('state');
            $t->json('result')->nullable();
            $t->unsignedInteger('revision')->default(0);
            $t->unsignedInteger('resets_count')->default(0);
            $t->unsignedInteger('level')->default(1);
            $t->decimal('score', 5, 2)->nullable();
            $t->boolean('passed')->default(false);
            $t->dateTime('started_at');
            $t->dateTime('expires_at');
            $t->dateTime('finished_at')->nullable();
            $t->timestamps();
            $t->unique(['user_id', 'activity_id', 'attempt_number']);
            $t->index(['status', 'expires_at']);
        });
        Schema::create('interactive_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('interactive_attempt_id')->constrained()->restrictOnDelete();
            $t->unsignedInteger('revision');
            $t->string('action', 30);
            $t->json('payload');
            $t->dateTime('created_at');
            $t->unique(['interactive_attempt_id', 'revision']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interactive_events');
        Schema::dropIfExists('interactive_attempts');
    }
};
