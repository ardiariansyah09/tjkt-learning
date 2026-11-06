<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;
use App\Services\LearningSequence;

class ActivityPolicy
{
    public function view(User $u, Activity $a): bool
    {
        return app(LearningSequence::class)->activityAllows($u, $a) && $u->role === 'siswa' && $a->is_published && $a->current_version_id && (! $a->module_section_id || ($a->section && ! $a->section->trashed() && $a->section->is_published)) && $u->can('view', $a->module);
    }

    public function update(User $u, Activity $a): bool
    {
        return $u->can('update', $a->module);
    }
}
