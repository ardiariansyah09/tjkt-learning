<?php

namespace App\Services;

class QuizScorer
{
    private function text(string $value, bool $caseSensitive = false): string
    {
        $value = preg_replace('/\s+/u', ' ', trim($value));

        return $caseSensitive ? $value : mb_strtolower($value);
    }

    public function correct(array $q, mixed $answer): bool
    {
        $expected = $q['correct'];

        return match ($q['type']) {
            'single','scenario','boolean' => is_string($answer) && $answer === $expected,
            'multiple' => $this->set($answer, $expected),
            'ordering' => is_array($answer) && array_values($answer) === array_values($expected),
            'matching' => is_array($answer) && count($answer) === count($expected) && collect($expected)->every(fn ($v, $k) => ($answer[$k] ?? null) === $v),
            'short' => is_string($answer) && collect($expected['accepted'])->contains(fn ($value) => $this->text($answer, $expected['case_sensitive']) === $this->text($value, $expected['case_sensitive'])),default => false,
        };
    }

    private function set(mixed $answer, array $expected): bool
    {
        if (! is_array($answer)) {
            return false;
        }$answer = array_values(array_unique($answer));
        sort($answer);
        sort($expected);

        return $answer === $expected;
    }
}
