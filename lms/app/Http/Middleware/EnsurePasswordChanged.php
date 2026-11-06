<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next)
    {
        return $request->user()->must_change_password ? redirect()->route('password.edit') : $next($request);
    }
}
