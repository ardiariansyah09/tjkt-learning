<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabAssessment extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['score' => 'float', 'assessed_at' => 'datetime'];
    }

    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessed_by')->withTrashed();
    }

    public function submission()
    {
        return $this->belongsTo(LabSubmission::class, 'lab_submission_id');
    }
}
