<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModulePrerequisite extends Model
{
    protected $guarded = ['id'];

    public const TYPES = ['module_completed' => 'Modul selesai', 'quiz_score' => 'Nilai kuis minimum', 'lab_completed' => 'Lab selesai', 'teacher_verified' => 'Persetujuan guru'];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function requiredModule()
    {
        return $this->belongsTo(Module::class, 'required_module_id')->withTrashed();
    }
}
