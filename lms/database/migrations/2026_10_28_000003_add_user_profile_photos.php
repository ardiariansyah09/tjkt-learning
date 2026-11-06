<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users',fn(Blueprint $t)=>$t->string('avatar_hash',64)->nullable());
        Schema::create('profile_photos',function(Blueprint $t){
            $t->foreignId('user_id')->primary()->constrained()->restrictOnDelete();
            $t->longText('image_base64');
            $t->string('sha256',64);
            $t->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('profile_photos');
        Schema::table('users',fn(Blueprint $t)=>$t->dropColumn('avatar_hash'));
    }
};
