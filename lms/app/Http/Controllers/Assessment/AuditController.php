<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ExportJob;
use App\Services\XlsxService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuditController extends Controller
{
    private function query(Request $r)
    {
        $data = $r->validate(['q' => 'nullable|string|max:100', 'event' => 'nullable|string|max:100', 'from' => 'nullable|date', 'to' => ['nullable', 'date', Rule::when($r->filled('from'), 'after_or_equal:from')]]);
        $query = AuditLog::with('user');
        if ($r->filled('q')) {
            $query->whereHas('user', fn ($q) => $q->where(fn ($u) => $u->where('name', 'like', '%'.addcslashes($data['q'], '%_\\').'%')->orWhere('username', 'like', '%'.addcslashes($data['q'], '%_\\').'%')));
        }if ($r->filled('event')) {
            $query->where('event', $data['event']);
        }if ($r->filled('from')) {
            $query->whereDate('created_at', '>=', $data['from']);
        }if ($r->filled('to')) {
            $query->whereDate('created_at', '<=', $data['to']);
        }

        return $query;
    }

    public function index(Request $r)
    {
        $events = AuditLog::distinct()->orderBy('event')->pluck('event');
        $logs = $this->query($r)->latest('id')->paginate(20)->withQueryString();

        return view('assessment.reports.audit', compact('logs', 'events'));
    }

    public function export(Request $r, XlsxService $xlsx)
    {
        $query = $this->query($r);
        if ((clone $query)->count() > 2000) {
            throw ValidationException::withMessages(['export' => 'Maksimal 2.000 baris audit. Persempit filter.']);
        }$logs = $query->latest('id')->get();
        $path = $xlsx->write(['waktu', 'pengguna', 'username', 'aktivitas', 'ip', 'detail'], $logs->map(fn ($log) => [$log->created_at->format('Y-m-d H:i:s'), $log->user?->name ?? 'Tamu', $log->user?->username ?? '', $log->event, $log->ip_address, json_encode($log->metadata, JSON_UNESCAPED_UNICODE)]));
        ExportJob::create(['user_id' => $r->user()->id, 'resource' => 'audit_report', 'row_count' => $logs->count()]);

        return response()->download($path, 'audit-'.now()->format('Ymd-His').'.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Cache-Control' => 'private, no-store'])->deleteFileAfterSend(true);
    }
}
