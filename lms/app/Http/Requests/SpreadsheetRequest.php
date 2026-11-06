<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SpreadsheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return ['file' => ['required', 'file', 'max:2048', 'extensions:xlsx', 'mimetypes:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip']];
    }

    public function messages(): array
    {
        return ['file.required' => 'Pilih file Excel terlebih dahulu.', 'file.max' => 'Ukuran file maksimal 2 MB.', 'file.extensions' => 'Gunakan file .xlsx.', 'file.mimetypes' => 'Format file harus Excel .xlsx.'];
    }
}
