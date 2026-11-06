<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PracticeAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('assess', $this->route('submission'));
    }

    public function rules(): array
    {
        return ['decision' => 'required|in:approved,revision_requested', 'score' => 'nullable|required_if:decision,approved|numeric|min:0|max:100', 'feedback' => 'required|string|min:5|max:5000'];
    }

    public function attributes(): array
    {
        return ['decision' => 'keputusan', 'score' => 'nilai praktik', 'feedback' => 'catatan guru'];
    }
}
