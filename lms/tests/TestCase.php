<?php

namespace Tests;

abstract class TestCase extends \Illuminate\Foundation\Testing\TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $review = config('database.default') === 'sqlite'
            && in_array(config('database.connections.sqlite.database'), [base_path('database/review.sqlite'),base_path('database/testing-review.sqlite')],true)
            && base_path() === '/home/adminnazh/tjkt-lms-review-20261028';
        if (!$review && (config('database.default') !== 'mysql' || config('database.connections.mysql.database') !== 'tjkt_learning_testing')) {
            throw new \RuntimeException('Pengujian harus memakai database tjkt_learning_testing.');
        }
    }
}
