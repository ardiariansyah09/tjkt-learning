<?php

namespace App\Services;

use App\Models\LearningVerification;
use App\Models\Module;
use App\Models\ModuleAccessOverride;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LearningVerificationService
{
    public function verify(User $actor, array $data): LearningVerification
    {
        return DB::transaction(function () use ($actor, $data) {
            $student = User::whereKey($data['user_id'])->lockForUpdate()->firstOrFail();
            $module = Module::findOrFail($data['module_id']);
            abort_unless(app(LearningAccessService::class)->teacherCanVerify($actor, $student, $module), 403);
            $proof = LearningVerification::create(['user_id' => $student->id, 'module_id' => $module->id, 'type' => $data['type'], 'score' => $data['type'] === 'quiz_score' ? $data['score'] : null, 'note' => $data['note'], 'verified_by' => $actor->id, 'verified_at' => now()]);
            app(AuditService::class)->record('learning.verified', $actor->id, ['verification_id' => $proof->id, 'user_id' => $student->id, 'module_id' => $module->id, 'type' => $proof->type]);

            return $proof;
        });
    }

    public function revoke(User $actor, LearningVerification $proof, string $reason): void
    {
        DB::transaction(function () use ($actor, $proof, $reason) {
            $proof = LearningVerification::whereKey($proof->id)->lockForUpdate()->firstOrFail();
            abort_unless($actor->role === 'admin' || ($proof->verified_by === $actor->id && app(LearningAccessService::class)->teacherCanVerify($actor, $proof->student, $proof->module)), 403);
            if ($proof->revoked_at) {
                return;
            }$proof->update(['revoked_at' => now(), 'revoked_by' => $actor->id, 'revocation_reason' => $reason]);
            app(AuditService::class)->record('learning.verification_revoked', $actor->id, ['verification_id' => $proof->id, 'reason' => $reason]);
        });
    }

    public function override(User $actor, array $data): void
    {
        abort_unless($actor->role === 'admin', 403);
        DB::transaction(function () use ($actor, $data) {
            $student = User::whereKey($data['user_id'])->lockForUpdate()->firstOrFail();
            if ($student->role !== 'siswa' || ! $student->is_active) {
                throw ValidationException::withMessages(['user_id' => 'Pilih siswa aktif.']);
            }
            $module = Module::findOrFail($data['module_id']);
            $override = ModuleAccessOverride::create(['user_id' => $student->id, 'module_id' => $module->id, 'granted_by' => $actor->id, 'reason' => $data['reason'], 'expires_at' => $data['expires_at'] ?? null]);
            app(AuditService::class)->record('module.override_granted', $actor->id, ['override_id' => $override->id, 'module_id' => $module->id, 'user_id' => $student->id, 'reason' => $data['reason']]);
        });
    }

    public function revokeOverride(User $actor, ModuleAccessOverride $override, string $reason): void
    {
        abort_unless($actor->role === 'admin', 403);
        DB::transaction(function () use ($actor, $override, $reason) {
            $override = ModuleAccessOverride::whereKey($override->id)->lockForUpdate()->firstOrFail();
            if ($override->revoked_at) {
                return;
            }$override->update(['revoked_at' => now(), 'revoked_by' => $actor->id, 'revocation_reason' => $reason]);
            app(AuditService::class)->record('module.override_revoked', $actor->id, ['override_id' => $override->id, 'reason' => $reason]);
        });
    }
}
