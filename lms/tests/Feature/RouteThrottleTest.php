<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RouteThrottleTest extends TestCase
{
    public function test_exhausting_one_route_does_not_exhaust_another_feature(): void
    {
        Route::middleware('throttle:2,1')->get('/uat-throttle-game', fn () => response('game'))->name('uat.throttle.game');
        Route::middleware('throttle:2,1')->get('/uat-throttle-upload', fn () => response('upload'))->name('uat.throttle.upload');
        $this->get('/uat-throttle-game')->assertOk();
        $this->get('/uat-throttle-game')->assertOk();
        $this->get('/uat-throttle-game')->assertStatus(429);
        $this->get('/uat-throttle-upload')->assertOk();
        $this->get('/uat-throttle-upload')->assertOk();
        $this->get('/uat-throttle-upload')->assertStatus(429);
    }
}
