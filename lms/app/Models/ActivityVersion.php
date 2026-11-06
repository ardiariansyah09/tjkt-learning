<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityVersion extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['definition'];

    protected function casts(): array
    {
        return ['definition' => 'array'];
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class)->withTrashed();
    }
}
