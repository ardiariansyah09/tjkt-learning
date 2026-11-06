<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rombel extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function memberships()
    {
        return $this->hasMany(RombelMembership::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'rombel_students')->withPivot(['joined_at', 'left_at'])->withTimestamps();
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class, 'teacher_rombel')->withTimestamps();
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'module_assignments')->withTimestamps();
    }
}
