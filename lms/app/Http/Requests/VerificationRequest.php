<?php

namespace App\Http\Requests;

use App\Models\ModulePrerequisite;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'guru'], true);
    }

    public function rules(): array
    {
        return ['user_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', 'siswa')->whereNull('deleted_at')], 'module_id' => ['required', 'integer', Rule::exists('modules', 'id')->whereNull('deleted_at')], 'type' => ['required', Rule::in(array_keys(ModulePrerequisite::TYPES))], 'score' => ['nullable', 'integer', 'min:0', 'max:100', 'required_if:type,quiz_score'], 'note' => ['required', 'string', 'min:10', 'max:2000']];
    }

    public function attributes(): array
    {
        return ['user_id' => 'siswa', 'module_id' => 'modul', 'type' => 'jenis pencapaian', 'score' => 'nilai kuis terverifikasi', 'note' => 'catatan bukti'];
    }
}
