<?php

namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InteractiveDefinition
{
    public const KINDS = ['game' => 'Pustaka template game', 'terminal' => 'Terminal virtual', 'matching' => 'Game menjodohkan', 'drag_drop' => 'Game seret dan lepas', 'sorting' => 'Game mengurutkan', 'network' => 'Diagram jaringan interaktif'];

    public const SCENARIOS = ['guided' => 'Instalasi SSH terpandu', 'hardening' => 'Challenge SSH hardening', 'troubleshooting' => 'Troubleshooting port dan firewall'];

    public function compile(array $data): array
    {
        $kind = $data['kind'];
        $definition = ['kind' => $kind, 'passing_score' => (int) $data['passing_score'], 'max_attempts' => (int) $data['max_attempts'], 'duration_minutes' => (int) $data['duration_minutes'], 'level' => (int) ($data['level'] ?? 1)];
        if ($kind === 'game') {
            return $definition + app(GameTemplates::class)->compile($data);
        }
        if (in_array($kind, ['terminal', 'network'], true)) {
            $scenario = $data['scenario'] ?? 'guided';
            if (! isset(self::SCENARIOS[$scenario])) {
                $this->invalid('Skenario tidak tersedia.');
            }

            return $definition + ['scenario' => $scenario];
        }
        $lines = preg_split('/\R/u', trim($data['game_items'] ?? ''));
        if (count($lines) < 2 || count($lines) > 12) {
            $this->invalid('Isi 2–12 baris item permainan.');
        }
        $items = [];
        $labels = [];
        $targets = [];
        foreach ($lines as $line) {
            $parts = array_map('trim', explode('|', $line));
            if (count($parts) !== ($kind === 'sorting' ? 1 : 2) || in_array('', $parts, true)) {
                $this->invalid('Gunakan satu item per baris; pasangan memakai format kiri | kanan.');
            }
            foreach ($parts as $p) {
                if (mb_strlen($p) > 160) {
                    $this->invalid('Setiap label maksimal 160 karakter.');
                }
            }
            if (in_array(mb_strtolower($parts[0]), $labels, true) || (isset($parts[1]) && in_array(mb_strtolower($parts[1]), $targets, true))) {
                $this->invalid('Label dan pasangan harus berbeda agar jawaban tidak ambigu.');
            }
            $labels[] = mb_strtolower($parts[0]);
            $targets[] = mb_strtolower($parts[1] ?? '');
            $items[] = ['key' => Str::random(20), 'label' => $parts[0], 'target' => $parts[1] ?? null];
        }

        return $definition + ['items' => $items];
    }

    private function invalid(string $message): never
    {
        throw ValidationException::withMessages(['game_items' => $message]);
    }

    public function snapshot(array $definition): array
    {
        if ($definition['kind'] === 'game') {
            return app(GameTemplates::class)->snapshot($definition);
        }
        if (in_array($definition['kind'], ['matching', 'drag_drop'], true)) {
            $right = [];
            $correct = [];
            foreach ($definition['items'] as &$item) {
                $key = Str::random(20);
                $right[] = ['key' => $key, 'label' => $item['target']];
                $correct[$item['key']] = $key;
                unset($item['target']);
            }
            unset($item);
            shuffle($right);
            shuffle($definition['items']);
            $definition['right'] = $right;
            $definition['correct'] = $correct;
        } elseif ($definition['kind'] === 'sorting') {
            $definition['correct'] = array_column($definition['items'], 'key');
            shuffle($definition['items']);
        }

        return $definition;
    }

    public function publicConfig(array $snapshot): array
    {
        if ($snapshot['kind'] === 'game') {
            return app(GameTemplates::class)->publicConfig($snapshot);
        }

        return collect($snapshot)->only(['kind', 'scenario', 'items', 'right', 'level', 'duration_minutes', 'passing_score', 'max_attempts'])->all();
    }
}
