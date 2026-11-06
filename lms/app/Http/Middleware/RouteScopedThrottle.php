<?php

namespace App\Http\Middleware;

use Illuminate\Routing\Middleware\ThrottleRequests;

class RouteScopedThrottle extends ThrottleRequests
{
    protected function resolveRequestSignature($request)
    {
        $route = $request->route();

        return parent::resolveRequestSignature($request).'|'.($route?->getName() ?? $route?->uri() ?? $request->path());
    }
}
