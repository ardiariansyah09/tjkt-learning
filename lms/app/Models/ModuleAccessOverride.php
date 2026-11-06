<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModuleAccessOverride extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'revoked_at' => 'datetime'];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }

    public function module()
    {
        return $this->belongsTo(Module::class)->withTrashed();
    }
}
