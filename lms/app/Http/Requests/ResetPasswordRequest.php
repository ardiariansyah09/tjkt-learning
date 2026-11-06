<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return ['password' => ['required', 'string', 'confirmed', 'max:128', Password::min(12)->letters()->numbers()]];
    }

    public function messages(): array
    {
        return ['password.confirmed' => 'Konfirmasi password tidak sama.', 'password.required' => 'Password baru wajib diisi.'];
    }
}
