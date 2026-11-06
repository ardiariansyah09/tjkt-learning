<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Module extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by')->withTrashed();
    }

    public function rombels()
    {
        return $this->belongsToMany(Rombel::class, 'module_assignments')->withTimestamps();
    }

    protected function casts(): array
    {
        return ['published_at' => 'datetime', 'sequential_learning' => 'boolean'];
    }

    public function sections()
    {
        return $this->hasMany(ModuleSection::class)->orderBy('sort_order')->orderBy('id');
    }

    public function prerequisites()
    {
        return $this->hasMany(ModulePrerequisite::class);
    }

    public function verifications()
    {
        return $this->hasMany(LearningVerification::class);
    }

    public function overrides()
    {
        return $this->hasMany(ModuleAccessOverride::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class)->orderBy('sort_order')->orderBy('id');
    }
}
