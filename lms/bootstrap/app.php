<?php

use App\Http\Middleware\EnsureActive;
use App\Http\Middleware\EnsurePasswordChanged;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\RouteScopedThrottle;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php', commands: __DIR__.'/../routes/console.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(
            at: ['172.16.10.5'],
            headers: Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO,
        );
        $middleware->alias(['active' => EnsureActive::class, 'password.changed' => EnsurePasswordChanged::class, 'role' => RoleMiddleware::class, 'throttle' => RouteScopedThrottle::class]);
        $middleware->redirectUsersTo(fn () => route(auth()->user()->dashboard()));
    })->withExceptions(function (Exceptions $exceptions): void {})->create();
