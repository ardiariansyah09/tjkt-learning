<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class PasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return ['current_password' => ['required', 'current_password'], 'password' => ['required', 'confirmed', 'different:current_password', Password::min(12)->letters()->numbers()]];
    }

    public function messages(): array
    {
        return ['current_password.current_password' => 'Password saat ini tidak sesuai.', 'password.confirmed' => 'Konfirmasi password tidak sama.', 'password.different' => 'Gunakan password yang berbeda.', 'required' => ':attribute wajib diisi.'];
    }
}
