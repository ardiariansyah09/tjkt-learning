<?php

namespace App\Http\Requests;

use App\Models\ModulePrerequisite;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PrerequisiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('module'));
    }

    public function rules(): array
    {
        return ['rules' => ['sometimes', 'array', 'max:30'], 'rules.*' => ['array'], 'rules.*.required_module_id' => ['required', 'integer', Rule::exists('modules', 'id')->whereNull('deleted_at')], 'rules.*.type' => ['required', Rule::in(array_keys(ModulePrerequisite::TYPES))], 'rules.*.min_score' => ['nullable', 'integer', 'min:0', 'max:100']];
    }

    public function after(): array
    {
        return [function ($validator) {
            $seen = [];
            $rules = $this->input('rules', []);
            if (! is_array($rules)) {
                return;
            }foreach ($rules as $i => $rule) {
                if (! is_array($rule)) {
                    continue;
                }if (! is_scalar($rule['required_module_id'] ?? null) || ! is_string($rule['type'] ?? null)) {
                    continue;
                }
                $key = (int) $rule['required_module_id'].':'.$rule['type'];
                if (isset($seen[$key])) {
                    $validator->errors()->add('rules', 'Jenis prasyarat untuk modul yang sama tidak boleh ganda.');
                }$seen[$key] = true;
                if (($rule['type'] ?? null) === 'quiz_score' && (! isset($rule['min_score']) || $rule['min_score'] === '')) {
                    $validator->errors()->add("rules.$i.min_score", 'Nilai kuis minimum wajib diisi.');
                }
            }
        }];
    }
}
