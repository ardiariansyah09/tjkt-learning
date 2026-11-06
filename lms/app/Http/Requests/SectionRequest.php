<?php

namespace App\Http\Requests;

use App\Models\ModuleSection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('module'));
    }

    public function rules(): array
    {
        return ['title' => ['required', 'string', 'max:200'], 'kind' => ['required', Rule::in(array_keys(ModuleSection::KINDS))], 'content' => ['required', 'string', 'max:100000'], 'sort_order' => ['required', 'integer', 'min:0', 'max:100000'], 'is_published' => ['required', 'boolean'], 'is_required' => ['required', 'boolean'], 'progress_weight' => ['required', 'integer', 'min:1', 'max:100']];
    }

    public function attributes(): array
    {
        return ['title' => 'judul submateri', 'kind' => 'jenis submateri', 'content' => 'isi materi', 'sort_order' => 'urutan', 'is_published' => 'status submateri', 'is_required' => 'kewajiban', 'progress_weight' => 'bobot progres'];
    }
}
