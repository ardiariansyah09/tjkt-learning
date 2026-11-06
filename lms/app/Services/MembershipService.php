<?php

namespace App\Services;

use App\Models\Rombel;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MembershipService
{
    public function move(User $student, ?int $rombelId): void
    {
        // The user row is the serialization lock, including students without a membership yet.
        DB::transaction(function () use ($student, $rombelId) {
            User::whereKey($student->id)->lockForUpdate()->firstOrFail();
            $current = $student->memberships()->whereNull('left_at')->lockForUpdate()->get();
            if ($current->count() === 1 && $current->first()->rombel_id === $rombelId) {
                return;
            }
            if ($rombelId) {
                $target = Rombel::whereKey($rombelId)->lockForUpdate()->firstOrFail();
                if (! $target->is_active) {
                    throw ValidationException::withMessages(['rombel_id' => 'Rombel tujuan tidak aktif.']);
                }
            }
            $time = now()->format('Y-m-d H:i:s.u');
            $student->memberships()->whereNull('left_at')->update(['left_at' => $time]);
            if ($rombelId) {
                $student->memberships()->create(['rombel_id' => $rombelId, 'joined_at' => $time]);
            }
        });
    }
}
