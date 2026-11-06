<?php

namespace App\Policies;

use App\Models\LabSubmission;
use App\Models\User;
use App\Services\LearningReportService;

class LabSubmissionPolicy
{
    public function view(User $user, LabSubmission $submission): bool
    {
        if (! $user->is_active) {
            return false;
        }
        if ($user->role === 'admin') {
            return true;
        }
        if ($user->role === 'siswa') {
            return $submission->user_id === $user->id;
        }
        if (! in_array($user->role, ['admin', 'guru'], true)) {
            return false;
        }

        // Retained assignments and membership history preserve the teacher's authorized reporting scope.
        return app(LearningReportService::class)->pairs($user, ['history' => true, 'module_id' => $submission->activity->module_id])->where('u.id', $submission->user_id)->exists();
    }

    public function assess(User $user, LabSubmission $submission): bool
    {
        return in_array($user->role, ['admin', 'guru'], true) && $this->view($user, $submission);
    }
}
