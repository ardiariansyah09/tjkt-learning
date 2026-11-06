<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PracticeSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->route('activity')->kind === 'practice' && $this->user()->can('view', $this->route('activity'));
    }

    public function rules(): array
    {
        return ['request_key' => 'required|uuid', 'report' => 'required|string|min:20|max:12000', 'evidence' => 'required|array|min:1|max:3', 'evidence.*' => 'required|file|max:1024'];
    }

    public function attributes(): array
    {
        return ['report' => 'laporan praktik', 'evidence' => 'berkas bukti', 'evidence.*' => 'berkas bukti'];
    }
}
