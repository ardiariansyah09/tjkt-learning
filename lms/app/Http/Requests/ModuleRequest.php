<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'guru'], true);
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:40', 'regex:/^[A-Za-z0-9_-]+$/', Rule::unique('modules')->ignore($this->route('module')?->id)],
            'title' => ['required', 'string', 'max:200'], 'description' => ['required', 'string', 'max:5000'], 'phase' => ['required', 'in:E,F'], 'grade' => ['required', 'integer', 'in:10,11,12'], 'competency' => ['required', 'string', 'max:2000'], 'objectives' => ['required', 'string', 'max:5000'], 'estimated_minutes' => ['required', 'integer', 'min:1', 'max:10080'], 'sort_order' => ['required', 'integer', 'min:0', 'max:100000'], 'status' => ['required', 'in:draft,published,unpublished,archived'],
            'sequential_learning' => ['sometimes', 'boolean'],
            'rombel_ids' => ['sometimes', 'array', 'max:100'], 'rombel_ids.*' => ['integer', 'distinct', Rule::exists('rombels', 'id')->whereNull('deleted_at')],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:max_width=2000,max_height=2000']];
    }

    public function attributes(): array
    {
        return ['code' => 'kode modul', 'title' => 'judul modul', 'description' => 'deskripsi', 'phase' => 'fase', 'grade' => 'tingkat', 'competency' => 'elemen kompetensi', 'objectives' => 'tujuan pembelajaran', 'estimated_minutes' => 'estimasi waktu', 'sort_order' => 'urutan', 'rombel_ids' => 'penugasan rombel', 'thumbnail' => 'thumbnail'];
    }
}
