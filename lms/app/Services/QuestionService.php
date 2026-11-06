<?php

namespace App\Services;

use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuestionService
{
    public function visible(User $u)
    {
        return Question::where(fn ($q) => $u->role === 'admin' ? $q->whereRaw('1=1') : $q->where('created_by', $u->id)->orWhere('is_shared', true));
    }

    public function save(User $u, array $data, ?Question $question = null): Question
    {
        return DB::transaction(function () use ($u, $data, $question) {
            $new = $question === null;
            $fields = collect($data)->only(['type', 'prompt', 'scenario', 'explanation', 'points', 'is_shared'])->all();
            $fields['scenario'] = $data['type'] === 'scenario' ? ($data['scenario'] ?? null) : null;
            $fields['answer_config'] = match ($data['type']) {
                'boolean' => ['value' => $data['boolean_answer']],'short' => ['accepted' => array_values(array_filter(array_map('trim', preg_split('/\r?\n/', $data['accepted_answers'])))), 'case_sensitive' => (bool) ($data['case_sensitive'] ?? false)],default => null
            };
            if ($question) {
                $question = Question::whereKey($question->id)->lockForUpdate()->firstOrFail();
                $question->update($fields);
                $question->options()->delete();
            } else {
                $question = Question::create($fields + ['created_by' => $u->id]);
            }
            if (! in_array($data['type'], ['boolean', 'short'], true)) {
                foreach (array_values($data['options'] ?? []) as $i => $option) {
                    $question->options()->create(['answer_key' => Str::random(16), 'label' => $option['label'], 'target' => $data['type'] === 'matching' ? $option['target'] : null, 'is_correct' => in_array($data['type'], ['single', 'multiple', 'scenario'], true) ? (bool) $option['is_correct'] : false, 'position' => $i]);
                }
            }app(AuditService::class)->record($new ? 'question.created' : 'question.updated', $u->id, ['question_id' => $question->id]);

            return $question;
        });
    }

    public function compile(Question $q): array
    {
        $options = $q->options;
        $choices = $options->map(fn ($o) => ['key' => $o->answer_key, 'label' => $o->label])->all();
        $answer = match ($q->type) {
            'single','scenario' => $options->firstWhere('is_correct', true)?->answer_key,'multiple' => $options->where('is_correct', true)->pluck('answer_key')->all(),'ordering' => $options->pluck('answer_key')->all(),'matching' => $options->pluck('target', 'answer_key')->all(),'boolean' => $q->answer_config['value'],'short' => $q->answer_config,default => null
        };

        return ['source_id' => $q->id, 'type' => $q->type, 'prompt' => $q->prompt, 'scenario' => $q->scenario, 'explanation' => $q->explanation, 'points' => (float) $q->points, 'choices' => $choices, 'correct' => $answer];
    }
}
