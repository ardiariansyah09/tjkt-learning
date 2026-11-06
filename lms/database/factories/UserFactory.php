<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return ['name' => fake()->name(), 'username' => fake()->unique()->userName(), 'email' => null, 'role' => 'siswa', 'is_active' => true, 'must_change_password' => true, 'password' => Hash::make(fake()->password(16, 24))];
    }
}
