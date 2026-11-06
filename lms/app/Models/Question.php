<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $hidden = ['answer_config'];

    public const TYPES = ['single' => 'Pilihan ganda', 'multiple' => 'Pilihan ganda kompleks', 'boolean' => 'Benar / salah', 'matching' => 'Menjodohkan', 'ordering' => 'Mengurutkan', 'short' => 'Jawaban singkat', 'scenario' => 'Soal skenario'];

    protected function casts(): array
    {
        return ['answer_config' => 'array', 'is_shared' => 'boolean'];
    }

    public function options()
    {
        return $this->hasMany(QuestionOption::class)->orderBy('position');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by')->withTrashed();
    }
}
