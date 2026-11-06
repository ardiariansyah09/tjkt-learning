<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InteractiveAttempt extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['snapshot', 'state'];

    protected function casts(): array
    {
        return ['snapshot' => 'array', 'state' => 'array', 'result' => 'array', 'started_at' => 'datetime', 'expires_at' => 'datetime', 'finished_at' => 'datetime', 'score' => 'float', 'passed' => 'boolean'];
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class)->withTrashed();
    }

    public function events()
    {
        return $this->hasMany(InteractiveEvent::class);
    }
}
