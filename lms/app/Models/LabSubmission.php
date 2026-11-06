<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabSubmission extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['snapshot', 'request_key'];

    public const STATUSES = ['pending' => 'Menunggu penilaian', 'revision_requested' => 'Perlu perbaikan', 'approved' => 'Disetujui'];

    protected function casts(): array
    {
        return ['snapshot' => 'array', 'submitted_at' => 'datetime', 'assessed_at' => 'datetime'];
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class)->withTrashed();
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }

    public function files()
    {
        return $this->hasMany(LabSubmissionFile::class);
    }

    public function assessment()
    {
        return $this->hasOne(LabAssessment::class);
    }
}
