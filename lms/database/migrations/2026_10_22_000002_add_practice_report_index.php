<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_submissions', fn (Blueprint $t) => $t->index(['activity_id', 'status'], 'lab_submissions_activity_status_index'));
    }

    public function down(): void
    {
        Schema::table('lab_submissions', fn (Blueprint $t) => $t->dropIndex('lab_submissions_activity_status_index'));
    }
};
