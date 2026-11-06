<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAnswer extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['answer' => 'array', 'is_correct' => 'boolean', 'awarded_points' => 'float'];
    }
}
