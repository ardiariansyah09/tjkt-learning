<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\PasswordRequest;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request, AuditService $audit)
    {
        $key = hash('sha256', Str::lower($request->string('username')->toString()).'|'.$request->ip());
        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages(['username' => 'Terlalu banyak percobaan. Coba lagi dalam '.RateLimiter::availableIn($key).' detik.']);
        }
        if (! Auth::attempt(['username' => $request->input('username'), 'password' => $request->input('password'), 'is_active' => true])) {
            RateLimiter::hit($key, 60);
            $audit->record('login.failed');
            throw ValidationException::withMessages(['username' => 'Username atau password salah, atau akun tidak aktif.']);
        }
        RateLimiter::clear($key);
        $request->session()->regenerate();
        $audit->record('login.success', Auth::id());

        return redirect()->route($request->user()->must_change_password ? 'password.edit' : $request->user()->dashboard());
    }

    public function logout(Request $request, AuditService $audit)
    {
        $audit->record('logout', $request->user()->id);
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function password(PasswordRequest $request, AuditService $audit)
    {
        DB::transaction(function () use ($request, $audit) {
            $request->user()->forceFill(['password' => $request->input('password'), 'must_change_password' => false, 'remember_token' => Str::random(60)])->save();
            DB::table('sessions')->where('user_id', $request->user()->id)->where('id', '!=', $request->session()->getId())->delete();
            $audit->record('password.changed', $request->user()->id);
        });
        $request->session()->regenerate();

        return redirect()->route($request->user()->dashboard())->with('status', 'Password berhasil diperbarui.');
    }
}
