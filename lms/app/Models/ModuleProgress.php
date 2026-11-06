<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModuleProgress extends Model
{
    protected $table = 'module_progress';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['started_at' => 'datetime', 'last_activity_at' => 'datetime', 'first_completed_at' => 'datetime', 'completed_at' => 'datetime', 'completion_percent' => 'float', 'final_score' => 'float', 'quiz_score' => 'float', 'practice_score' => 'float'];
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
