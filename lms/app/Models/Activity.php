<?php

namespace App\Models;

use App\Services\InteractiveDefinition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Activity extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'is_required' => 'boolean'];
    }

    public function module()
    {
        return $this->belongsTo(Module::class)->withTrashed();
    }

    public function section()
    {
        return $this->belongsTo(ModuleSection::class, 'module_section_id')->withTrashed();
    }

    public function versions()
    {
        return $this->hasMany(ActivityVersion::class);
    }

    public function currentVersion()
    {
        return $this->belongsTo(ActivityVersion::class, 'current_version_id');
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'activity_questions')->withPivot('position')->orderByPivot('position');
    }

    public function interactiveAttempts()
    {
        return $this->hasMany(InteractiveAttempt::class);
    }

    public const KINDS = ['checkpoint' => 'Checkpoint membaca', 'quiz' => 'Kuis / asesmen', 'practice' => 'Praktikum laptop / unggah bukti'] + InteractiveDefinition::KINDS;

    public function submissions()
    {
        return $this->hasMany(LabSubmission::class);
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
