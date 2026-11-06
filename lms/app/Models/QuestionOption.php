<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionOption extends Model
{
    public $timestamps = false;

    protected $guarded = ['id'];

    protected $hidden = ['is_correct', 'target'];

    protected function casts(): array
    {
        return ['is_correct' => 'boolean'];
    }
}
