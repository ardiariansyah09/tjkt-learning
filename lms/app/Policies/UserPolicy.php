<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->is_active && $actor->role === 'admin';
    }

    public function create(User $actor): bool
    {
        return $this->viewAny($actor);
    }

    public function update(User $actor, User $subject): bool
    {
        return $this->viewAny($actor) && in_array($subject->role, ['siswa', 'guru'], true);
    }

    public function delete(User $actor, User $subject): bool
    {
        return $this->update($actor, $subject);
    }
}
