<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModuleSection extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    public const KINDS = ['orientation' => 'Orientasi dan tujuan', 'apperception' => 'Apersepsi dan pemantik', 'theory' => 'Materi teori', 'diagram' => 'Diagram dan visualisasi', 'guided_lab' => 'Guided Lab', 'challenge' => 'Independent Challenge', 'troubleshooting' => 'Troubleshooting', 'game' => 'Game edukasi', 'assessment' => 'Kuis dan asesmen', 'reflection' => 'Refleksi dan hasil belajar'];

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'is_required' => 'boolean'];
    }

    public function module()
    {
        return $this->belongsTo(Module::class)->withTrashed();
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'module_section_id')->orderBy('sort_order')->orderBy('id');
    }
}
