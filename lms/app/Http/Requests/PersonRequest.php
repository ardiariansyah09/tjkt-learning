<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class PersonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public static function dataRules(string $kind, ?User $person = null): array
    {
        $unique = fn (string $column) => Rule::unique('users', $column)->ignore($person?->id);
        $rules = ['name' => ['required', 'string', 'max:150'], 'username' => ['required', 'alpha_dash:ascii', 'max:100', $unique('username')], 'is_active' => ['required', 'boolean']];
        if (! $person) {
            $rules['password'] = ['required', 'string', 'max:128', Password::min(12)->letters()->numbers()];
        }
        if ($kind === 'siswa') {
            $rules['rayon_id'] = ['nullable', 'integer', Rule::exists('rayons', 'id')->whereNull('deleted_at')];
            $rules['rayon'] = ['nullable', 'string', 'max:50'];
            $rules['nis'] = ['required', 'string', 'regex:/^[0-9]{1,32}$/', $unique('nis')];
            $rules['rombel_id'] = ['required', 'integer', Rule::exists('rombels', 'id')->whereNull('deleted_at')];
        } else {
            $rules['email'] = ['nullable', 'email', 'max:255', $unique('email')];
            $rules['rombel_ids'] = ['sometimes', 'array', 'max:50'];
            $rules['rombel_ids.*'] = ['integer', 'distinct', Rule::exists('rombels', 'id')->whereNull('deleted_at')];
        }

        return $rules;
    }

    public function rules(): array
    {
        return self::dataRules($this->route('kind'), $this->route('person'));
    }

    public function attributes(): array
    {
        return ['name' => 'nama', 'username' => 'username', 'is_active' => 'status akun', 'rombel_id' => 'rombel', 'rombel_ids' => 'penugasan rombel', 'nis' => 'NIS', 'password' => 'password awal'];
    }

    public function messages(): array
    {
        return ['required' => ':attribute wajib diisi.', 'unique' => ':attribute sudah digunakan, termasuk akun yang diarsipkan.', 'exists' => ':attribute tidak tersedia.', 'nis.regex' => 'NIS harus berupa 1–32 digit angka.', 'username.alpha_dash' => 'Username hanya boleh berisi huruf, angka, garis bawah, atau tanda hubung.', 'boolean' => ':attribute harus aktif atau nonaktif.'];
    }
}
