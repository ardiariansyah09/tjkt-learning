<?php

namespace App\Policies;

use App\Models\Module;
use App\Models\User;
use App\Services\LearningAccessService;

class ModulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active && in_array($user->role, ['admin', 'guru'], true);
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function preview(User $user, Module $module): bool
    {
        if (! $user->is_active) {
            return false;
        }if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'guru' && (($module->package_slug && $module->status === 'published') || $module->created_by === $user->id || $module->rombels()->whereHas('teachers', fn ($q) => $q->where('users.id', $user->id))->exists());
    }

    public function view(User $user, Module $module): bool
    {
        return $user->role === 'siswa' ? app(LearningAccessService::class)->accessible($user, $module) : $this->preview($user, $module);
    }

    public function update(User $user, Module $module): bool
    {
        return $this->viewAny($user) && ($user->role === 'admin' || $module->created_by === $user->id);
    }

    public function delete(User $user, Module $module): bool
    {
        return $this->update($user, $module);
    }
}
