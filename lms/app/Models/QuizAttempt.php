<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['snapshot'];

    protected function casts(): array
    {
        return ['snapshot' => 'array', 'started_at' => 'datetime', 'expires_at' => 'datetime', 'submitted_at' => 'datetime', 'passed' => 'boolean', 'score' => 'float'];
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class)->withTrashed();
    }

    public function answers()
    {
        return $this->hasMany(QuizAnswer::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }
}
