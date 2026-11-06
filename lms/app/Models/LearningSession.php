<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningSession extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['started_at' => 'datetime', 'last_seen_at' => 'datetime', 'ended_at' => 'datetime'];
    }
}
