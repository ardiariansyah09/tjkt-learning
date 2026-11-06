<?php

namespace App\Http\Requests;

use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (in_array($this->input('type'), ['boolean', 'short'], true)) {
            $this->merge(['options' => []]);
        }
    }

    public function authorize(): bool
    {
        return $this->route('question') ? $this->user()->can('update', $this->route('question')) : $this->user()->can('create', Question::class);
    }

    public function rules(): array
    {
        return ['type' => ['required', Rule::in(array_keys(Question::TYPES))], 'prompt' => 'required|string|max:10000', 'scenario' => 'nullable|string|max:10000|required_if:type,scenario', 'explanation' => 'nullable|string|max:10000', 'points' => 'required|numeric|min:0.1|max:100', 'is_shared' => 'required|boolean', 'case_sensitive' => 'sometimes|boolean', 'accepted_answers' => 'nullable|string|max:10000|required_if:type,short', 'boolean_answer' => 'nullable|in:true,false|required_if:type,boolean', 'options' => 'sometimes|array|max:12', 'options.*' => 'array', 'options.*.label' => 'required|string|max:1000', 'options.*.target' => 'nullable|string|max:1000', 'options.*.is_correct' => 'required|boolean'];
    }

    public function after(): array
    {
        return [function ($v) {
            $type = $this->input('type');
            $options = $this->input('options', []);
            if (! is_array($options)) {
                return;
            }
            if (in_array($type, ['single', 'multiple', 'scenario', 'matching', 'ordering'], true) && count($options) < 2) {
                $v->errors()->add('options', 'Tambahkan minimal dua pilihan atau pasangan.');
            }
            $correct = 0;
            $targets = [];
            foreach ($options as $option) {
                if (! is_array($option)) {
                    continue;
                }$correct += (int) filter_var($option['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN);
                if ($type === 'matching') {
                    if (! is_string($option['target'] ?? null) || trim($option['target']) === '') {
                        $v->errors()->add('options', 'Setiap pasangan memerlukan teks tujuan.');
                    } else {
                        $target = mb_strtolower(trim($option['target']));
                        if (in_array($target, $targets, true)) {
                            $v->errors()->add('options', 'Teks tujuan pasangan harus berbeda.');
                        }$targets[] = $target;
                    }
                }
            }
            if (in_array($type, ['single', 'scenario'], true) && $correct !== 1) {
                $v->errors()->add('options', 'Tandai tepat satu jawaban benar.');
            }if ($type === 'multiple' && $correct < 1) {
                $v->errors()->add('options', 'Tandai minimal satu jawaban benar.');
            }
            if ($type === 'short' && is_string($this->input('accepted_answers')) && ! array_filter(array_map('trim', explode("\n", $this->input('accepted_answers'))))) {
                $v->errors()->add('accepted_answers', 'Isi minimal satu jawaban yang diterima.');
            }
        }];
    }

    public function attributes(): array
    {
        return ['prompt' => 'pertanyaan', 'scenario' => 'skenario', 'points' => 'poin', 'explanation' => 'pembahasan', 'accepted_answers' => 'jawaban yang diterima', 'boolean_answer' => 'jawaban benar/salah', 'options' => 'pilihan soal'];
    }
}
