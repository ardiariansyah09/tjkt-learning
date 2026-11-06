<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('learning_package_definitions', function (Blueprint $t) {
            $t->string('version',64)->primary();
            $t->string('slug');
            $t->json('definition');
            $t->timestamps();
        });
        Schema::create('learning_package_assets', function (Blueprint $t) {
            $t->id();
            $t->string('release',64);
            $t->string('path',255);
            $t->string('sha256',64);
            $t->longText('content_base64');
            $t->timestamps();
            $t->unique(['release','path'],'learning_package_asset_unique');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('learning_package_assets');
        Schema::dropIfExists('learning_package_definitions');
    }
};
