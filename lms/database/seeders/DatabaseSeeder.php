<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $username = config('foundation.admin_username');
        $password = config('foundation.admin_password');
        if (! $username || ! $password || strlen($password) < 12) {
            throw new \RuntimeException('Isi TJKT_ADMIN_USERNAME dan TJKT_ADMIN_PASSWORD minimal 12 karakter di .env.');
        }
        User::firstOrCreate(['username' => $username], ['name' => 'Administrator TJKT', 'role' => 'admin', 'password' => $password, 'is_active' => true, 'must_change_password' => true]);
    }
}
