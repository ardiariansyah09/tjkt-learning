<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditService
{
    public function record(string $event, ?int $userId = null, array $metadata = []): void
    {
        AuditLog::create(['event' => $event, 'user_id' => $userId, 'ip_address' => request()->ip(), 'metadata' => $metadata ?: null]);
    }
}
