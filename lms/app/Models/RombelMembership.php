<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RombelMembership extends Model
{
    protected $table = 'rombel_students';

    protected $guarded = ['id'];

    protected $dateFormat = 'Y-m-d H:i:s.u';

    protected function casts(): array
    {
        return ['joined_at' => 'datetime', 'left_at' => 'datetime'];
    }

    public function rombel()
    {
        return $this->belongsTo(Rombel::class)->withTrashed();
    }

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }
}
