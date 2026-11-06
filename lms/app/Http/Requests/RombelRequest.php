<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RombelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public static function dataRules(array $data, ?int $id = null): array
    {
        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('rombels')->where(fn ($q) => $q->where('academic_year', $data['academic_year'] ?? '')->where('semester', $data['semester'] ?? 0))->ignore($id)],
            'grade' => ['required', 'integer', 'in:10,11,12'],
            'academic_year' => ['required', 'regex:/^[0-9]{4}\/[0-9]{4}$/', function ($attribute, $value, $fail) {
                if (preg_match('/^([0-9]{4})\/([0-9]{4})$/', (string) $value, $m) && ((int) $m[2] !== ((int) $m[1] + 1))) {
                    $fail('Tahun ajaran harus berurutan, misalnya 2026/2027.');
                }
            }],
            'semester' => ['required', 'integer', 'in:1,2'], 'is_active' => ['required', 'boolean'],
            'teacher_ids' => ['sometimes', 'array', 'max:50'], 'teacher_ids.*' => ['integer', 'distinct', Rule::exists('users', 'id')->where('role', 'guru')->whereNull('deleted_at')]];
    }

    public function rules(): array
    {
        return self::dataRules($this->all(), $this->route('rombel')?->id);
    }

    public function attributes(): array
    {
        return ['name' => 'nama rombel', 'grade' => 'tingkat', 'academic_year' => 'tahun ajaran', 'semester' => 'semester', 'is_active' => 'status rombel', 'teacher_ids' => 'guru'];
    }

    public function messages(): array
    {
        return ['required' => ':attribute wajib diisi.', 'unique' => 'Rombel pada tahun ajaran dan semester tersebut sudah ada, termasuk arsip.', 'in' => ':attribute tidak sesuai pilihan.', 'exists' => 'Guru yang dipilih tidak tersedia.', 'academic_year.regex' => 'Gunakan format tahun ajaran 2026/2027.'];
    }
}
