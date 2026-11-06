<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningVerification extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['verified_at' => 'datetime', 'revoked_at' => 'datetime'];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }

    public function module()
    {
        return $this->belongsTo(Module::class)->withTrashed();
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by')->withTrashed();
    }
}
