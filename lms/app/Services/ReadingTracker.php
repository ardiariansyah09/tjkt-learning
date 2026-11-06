<?php

namespace App\Services;

use App\Models\LearningSession;
use App\Models\Module;
use App\Models\ModuleSection;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReadingTracker
{
    public function start(User $user, ModuleSection $section): LearningSession
    {
        return DB::transaction(function () use ($user, $section) {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            LearningSession::where('user_id', $user->id)->whereNull('ended_at')->update(['ended_at' => now()]);
            $session = LearningSession::create(['id' => (string) Str::uuid(), 'user_id' => $user->id, 'module_id' => $section->module_id, 'module_section_id' => $section->id, 'started_at' => now(), 'last_seen_at' => now()]);
            app(ProgressService::class)->recalculate($user, $section->module, true);
            app(ProgressService::class)->event($user, $section->module, 'reading.started', [], null, $section->id);

            return $session;
        });
    }

    public function heartbeat(User $user, LearningSession $session): LearningSession
    {
        return DB::transaction(function () use ($user, $session) {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $session = LearningSession::whereKey($session->id)->lockForUpdate()->firstOrFail();
            abort_unless($session->user_id === $user->id, 403);
            abort_if($session->ended_at, 409, 'Sesi belajar telah digantikan oleh sesi lain. Muat ulang halaman ini untuk melanjutkan.');
            $gap = $session->last_seen_at->diffInSeconds(now(), false);
            if ($gap >= 0 && $gap <= 45) {
                $session->active_seconds += min(20, (int) $gap);
            }$session->last_seen_at = now();
            $session->save();
            app(ProgressService::class)->recalculate($user, Module::findOrFail($session->module_id), true);

            return $session;
        });
    }

    public function seconds(User $user, int $sectionId): int
    {
        return (int) LearningSession::where('user_id', $user->id)->where('module_section_id',$sectionId)->sum('active_seconds');
    }
}
