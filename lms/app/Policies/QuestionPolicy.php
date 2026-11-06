<?php

namespace App\Policies;

use App\Models\Question;
use App\Models\User;

class QuestionPolicy
{
    public function viewAny(User $u): bool
    {
        return $u->is_active && in_array($u->role, ['admin', 'guru'], true);
    }

    public function create(User $u): bool
    {
        return $this->viewAny($u);
    }

    public function update(User $u, Question $q): bool
    {
        return $this->viewAny($u) && ($u->role === 'admin' || $q->created_by === $u->id);
    }

    public function delete(User $u, Question $q): bool
    {
        return $this->update($u, $q);
    }
}
