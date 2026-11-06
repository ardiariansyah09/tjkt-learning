<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabSubmissionFile extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['path'];

    public function submission()
    {
        return $this->belongsTo(LabSubmission::class, 'lab_submission_id');
    }
}
