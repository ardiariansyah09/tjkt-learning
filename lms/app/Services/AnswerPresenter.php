<?php

namespace App\Services;

class AnswerPresenter
{
    public static function text(array $q, mixed $answer): string
    {
        if ($answer === null || $answer === '' || $answer === []) {
            return 'Tidak dijawab';
        }
        if ($q['type'] === 'short') {
            return is_array($answer) ? implode(' / ', $answer['accepted'] ?? []) : (string) $answer;
        }
        if ($q['type'] === 'boolean') {
            return $answer === 'true' ? 'Benar' : 'Salah';
        }
        $labels = collect($q['choices'])->pluck('label', 'key');
        if ($q['type'] === 'matching') {
            $right = collect($q['right'])->pluck('label', 'key');

            return collect($answer)->map(fn ($v, $k) => ($labels[$k] ?? '?').' → '.($right[$v] ?? 'Belum dipilih'))->join('; ');
        }

        return is_array($answer) ? collect($answer)->map(fn ($v) => $labels[$v] ?? 'Belum dipilih')->join(' → ') : ($labels[$answer] ?? 'Tidak dijawab');
    }
}
