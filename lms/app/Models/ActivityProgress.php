<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityProgress extends Model
{
    protected $table = 'activity_progress';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['started_at' => 'datetime', 'last_activity_at' => 'datetime', 'completed_at' => 'datetime', 'validator_result' => 'array', 'best_score' => 'float', 'last_score' => 'float'];
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class)->withTrashed();
    }
}
