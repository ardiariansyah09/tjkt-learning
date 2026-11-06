<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = ['name', 'username', 'email', 'nis', 'rayon', 'rayon_id', 'password', 'role', 'is_active', 'must_change_password'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'is_active' => 'boolean', 'must_change_password' => 'boolean'];
    }

    public function dashboard(): string
    {
        return $this->role.'.dashboard';
    }

    public function rayonMaster()
    {
        return $this->belongsTo(Rayon::class, 'rayon_id')->withTrashed();
    }

    public function rombels()
    {
        return $this->belongsToMany(Rombel::class, 'rombel_students')->withPivot(['joined_at', 'left_at'])->withTimestamps();
    }

    public function teachingRombels()
    {
        return $this->belongsToMany(Rombel::class, 'teacher_rombel')->withTimestamps();
    }

    public function memberships()
    {
        return $this->hasMany(RombelMembership::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class, 'created_by');
    }
}
