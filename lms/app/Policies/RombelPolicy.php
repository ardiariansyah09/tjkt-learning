<?php

namespace App\Policies;

use App\Models\Rombel;
use App\Models\User;

class RombelPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active && $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function view(User $user, Rombel $rombel): bool
    {
        return $this->viewAny($user);
    }

    public function update(User $user, Rombel $rombel): bool
    {
        return $this->viewAny($user);
    }

    public function delete(User $user, Rombel $rombel): bool
    {
        return $this->viewAny($user);
    }
}
