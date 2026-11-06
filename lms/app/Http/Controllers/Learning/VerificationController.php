<?php

namespace App\Http\Controllers\Learning;

use App\Http\Controllers\Controller;
use App\Http\Requests\VerificationRequest;
use App\Models\LearningVerification;
use App\Models\ModuleAccessOverride;
use App\Models\User;
use App\Services\LearningVerificationService;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function index(Request $request, ModuleController $modules)
    {
        $students = User::where('role', 'siswa')->where('is_active', true);
        if ($request->user()->role === 'guru') {
            $students->whereHas('rombels', fn ($q) => $q->whereNull('rombel_students.left_at')->where('is_active', true)->whereHas('teachers', fn ($t) => $t->where('users.id', $request->user()->id)));
        }$students = $students->orderBy('name')->get();
        $moduleChoices = $modules->visible($request->user())->orderBy('title')->get();
        $query = LearningVerification::with('student', 'module', 'verifier');
        if ($request->user()->role === 'guru') {
            $query->where('verified_by', $request->user()->id);
        }$verifications = $query->latest()->paginate(15, ['*'], 'verification_page');
        $overrides = $request->user()->role === 'admin' ? ModuleAccessOverride::with('student', 'module')->latest()->paginate(10, ['*'], 'override_page') : null;

        return view('learning.manage.verifications', compact('students', 'moduleChoices', 'verifications', 'overrides'));
    }

    public function store(VerificationRequest $request, LearningVerificationService $service)
    {
        $service->verify($request->user(), $request->validated());

        return back()->with('status', 'Pencapaian terverifikasi disimpan. Prasyarat siswa dievaluasi otomatis pada akses berikutnya.');
    }

    public function revoke(Request $request, LearningVerification $verification, LearningVerificationService $service)
    {
        $data = $request->validate(['reason' => 'required|string|min:10|max:2000']);
        $service->revoke($request->user(), $verification, $data['reason']);

        return back()->with('status', 'Verifikasi dicabut; histori dan alasan tetap tersimpan.');
    }

    public function override(Request $request, LearningVerificationService $service)
    {
        abort_unless($request->user()->role === 'admin', 403);
        $data = $request->validate(['user_id' => 'required|integer|exists:users,id', 'module_id' => 'required|integer|exists:modules,id', 'reason' => 'required|string|min:10|max:2000', 'expires_at' => 'nullable|date|after:now']);
        $service->override($request->user(), $data);

        return back()->with('status', 'Override prasyarat tersimpan beserta alasan dalam audit log.');
    }

    public function revokeOverride(Request $request, ModuleAccessOverride $override, LearningVerificationService $service)
    {
        $data = $request->validate(['reason' => 'required|string|min:10|max:2000']);
        $service->revokeOverride($request->user(), $override, $data['reason']);

        return back()->with('status', 'Override dicabut.');
    }
}
