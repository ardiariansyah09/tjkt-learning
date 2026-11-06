<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('learning_package_content_revisions', function(Blueprint $table){
            $table->string('version',64)->primary();
            $table->string('release',64);
            $table->string('previous_release',64)->nullable();
            $table->string('reason',200);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('learning_package_content_revisions'); }
};
