<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rayon extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function students()
    {
        return $this->hasMany(User::class)->where('role', 'siswa');
    }

    public function scopeOrdered($query)
    {
        if ($query->getModel()->getConnection()->getDriverName() === 'sqlite') {
            return $query->orderByRaw("substr(name, 1, instr(name, ' ') - 1)")
                ->orderByRaw("CAST(substr(name, instr(name, ' ') + 1) AS INTEGER)")->orderBy('name');
        }
        return $query->orderByRaw('SUBSTRING_INDEX(name, \' \', 1)')->orderByRaw('CAST(SUBSTRING_INDEX(name, \' \', -1) AS UNSIGNED)')->orderBy('name');
    }
}
