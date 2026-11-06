<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('module'));
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('game_rows')) {
            $rows = $this->validate(['game_rows' => 'required|array|min:2|max:12', 'game_rows.*' => 'required|array|min:1|max:4', 'game_rows.*.*' => 'required|string|max:160']);
            $this->merge(['game_items' => implode("\n", array_map(fn ($row) => implode(' | ', array_values($row)), array_values($rows['game_rows'])))]);
        }
    }

    public function rules(): array
    {
        return ['title' => 'required|string|max:200', 'kind' => 'required|in:checkpoint,quiz,game,terminal,matching,drag_drop,sorting,network,practice', 'instructions' => 'nullable|string|max:5000', 'module_section_id' => ['nullable', 'integer', 'required_if:kind,checkpoint', Rule::exists('module_sections', 'id')->where('module_id', $this->route('module')->id)->whereNull('deleted_at')], 'is_published' => 'required|boolean', 'is_required' => 'required|boolean', 'progress_weight' => 'required|integer|min:1|max:100', 'sort_order' => 'required|integer|min:0|max:100000', 'passing_score' => 'required|integer|min:1|max:100', 'max_attempts' => 'required|integer|min:1|max:20', 'duration_minutes' => 'required|integer|min:1|max:180', 'question_count' => 'required|integer|min:1|max:100', 'random_questions' => 'required|boolean', 'shuffle_options' => 'required|boolean', 'min_active_seconds' => 'required|integer|min:0|max:3600', 'scenario' => 'nullable|in:guided,hardening,troubleshooting', 'game_template' => 'nullable|in:memory,categorize,word_search,maze,sudoku', 'game_difficulty' => 'nullable|in:easy,medium,hard', 'game_items' => 'nullable|string|max:6000', 'rubric' => 'nullable|string|max:5000', 'due_at' => 'nullable|date', 'level' => 'sometimes|integer|min:1|max:20', 'question_ids' => 'sometimes|array|max:100', 'question_ids.*' => ['integer', 'distinct', Rule::exists('questions', 'id')->whereNull('deleted_at')]];
    }

    public function attributes(): array
    {
        return ['title' => 'judul aktivitas', 'kind' => 'jenis aktivitas', 'question_ids' => 'soal', 'question_count' => 'jumlah soal', 'passing_score' => 'KKM', 'max_attempts' => 'batas percobaan', 'duration_minutes' => 'durasi', 'min_active_seconds' => 'durasi aktif minimum', 'module_section_id' => 'submateri'];
    }
}
