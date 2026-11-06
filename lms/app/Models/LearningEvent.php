<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningEvent extends Model
{
    public $timestamps = false;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'created_at' => 'datetime'];
    }

    public function module()
    {
        return $this->belongsTo(Module::class)->withTrashed();
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }
}
