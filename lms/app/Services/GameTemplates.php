<?php

namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GameTemplates
{
    public const CATALOG = [
        'matching' => ['Menjodohkan', 'Hubungkan istilah dengan fungsi atau definisinya.', "Router | Menghubungkan jaringan\nSwitch | Menghubungkan perangkat LAN\nAccess point | Akses nirkabel"],
        'drag_drop' => ['Seret dan lepas', 'Pasangkan kartu perangkat, protokol, atau konsep.', "SSH | TCP 22\nHTTPS | TCP 443\nDNS | UDP/TCP 53"],
        'sorting' => ['Urutan langkah', 'Latih prosedur instalasi dan pemecahan masalah.', "Identifikasi masalah\nPeriksa koneksi\nUji konfigurasi\nDokumentasikan hasil"],
        'memory' => ['Kartu memori', 'Buka dua kartu untuk menemukan pasangan konsep.', "SSH | TCP 22\nHTTPS | TCP 443\nDNS | UDP/TCP 53"],
        'categorize' => ['Kelompokkan item', 'Klasifikasikan contoh ke dalam kategori materi.', "Router | Perangkat\nSwitch | Perangkat\nSSH | Protokol\nHTTPS | Protokol"],
        'word_search' => ['Cari kata', 'Cari istilah materi pada papan huruf.', "ROUTER | Penghubung antarjaringan\nSWITCH | Penghubung perangkat LAN\nSERVER | Penyedia layanan"],
        'maze' => ['Labirin misi', 'Jelajahi labirin 2D dan jawab pertanyaan di setiap pos.', "Port default SSH? | 22 | 80 | 443\nProtokol web aman? | HTTPS | HTTP | FTP\nPerangkat penghubung LAN? | Switch | Modem | Printer"],
        'sudoku' => ['Sudoku mini 4×4', 'Latih logika dengan empat simbol pilihan guru, tanpa pengulangan di baris, kolom, dan blok 2×2.', "Router\nSwitch\nServer\nFirewall"],
    ];

    public function compile(array $data): array
    {
        $template = $data['game_template'] ?? 'memory';
        $difficulty = $data['game_difficulty'] ?? 'medium';
        $this->require(isset(self::CATALOG[$template]) && ! in_array($template, ['matching', 'drag_drop', 'sorting'], true), 'Template tidak tersedia.');
        $this->require(in_array($difficulty, ['easy', 'medium', 'hard'], true), 'Kesulitan tidak tersedia.');
        $lines = preg_split('/\R/u', trim($data['game_items'] ?? ''));
        $this->require(count($lines) >= 2 && count($lines) <= 12, 'Isi 2–12 item.');
        $items = [];
        foreach ($lines as $line) {
            $parts = array_map('trim', explode('|', $line));
            $count = $template === 'sudoku' ? 1 : ($template === 'maze' ? 4 : 2);
            $this->require(count($parts) === $count && ! in_array('', $parts, true), $template === 'maze' ? 'Format: pertanyaan | jawaban benar | pengecoh 1 | pengecoh 2.' : 'Gunakan format yang ditampilkan pada template.');
            foreach ($parts as $part) {
                $this->require(mb_strlen($part) <= ($template === 'sudoku' ? 24 : 160), 'Label terlalu panjang (maksimal 160 karakter; simbol Sudoku 24).');
            }
            $this->require(! in_array(mb_strtolower($parts[0]), array_map(fn ($i) => mb_strtolower($i['label']), $items), true), 'Label item harus unik.');
            if ($template === 'memory') {
                foreach ($items as $existing) {
                    $this->require(array_intersect(array_map('mb_strtolower', [$parts[0], $parts[1]]), array_map('mb_strtolower', [$existing['label'], $existing['target']])) === [], 'Teks kartu harus berbeda antar pasangan agar tidak ambigu.');
                }
            }
            if ($template === 'word_search') {
                $parts[0] = strtoupper($parts[0]);
                $this->require((bool) preg_match('/^[A-Z]{2,12}$/D', $parts[0]), 'Kata memakai 2–12 huruf A–Z tanpa spasi.');
            }
            if ($template === 'maze') {
                $this->require(count(array_unique(array_map('mb_strtolower', array_slice($parts, 1)))) === 3, 'Pilihan jawaban pada setiap pos harus berbeda.');
            }
            $items[] = ['key' => Str::random(20), 'label' => $parts[0], 'target' => $parts[1] ?? null, 'options' => array_slice($parts, 1)];
        }
        $this->require($template !== 'sudoku' || count($items) === 4, 'Sudoku membutuhkan tepat empat simbol berbeda.');
        $this->require($template !== 'categorize' || count(array_unique(array_column($items, 'target'))) >= 2, 'Gunakan minimal dua kategori.');

        return ['game_template' => $template, 'game_difficulty' => $difficulty, 'source_items' => trim($data['game_items']), 'items' => $items];
    }

    public function snapshot(array $c): array
    {
        $t = $c['game_template'];
        if ($t === 'memory') {
            $cards = [];
            foreach ($c['items'] as $item) {
                foreach ([$item['label'], $item['target']] as $text) {
                    $cards[] = ['key' => Str::random(20), 'pair' => $item['key'], 'text' => $text];
                }
            }
            shuffle($cards);
            $c['cards'] = $cards;
        } elseif ($t === 'word_search') {
            $grid = array_fill(0, 12, array_fill(0, 12, ''));
            $rows = range(0, 11);
            shuffle($rows);
            $positions = [];
            foreach ($c['items'] as $i => $item) {
                $word = $item['label'];
                $reverse = $c['game_difficulty'] !== 'easy' && random_int(0, 1) === 1;
                $start = random_int(0, 12 - strlen($word));
                $letters = str_split($reverse ? strrev($word) : $word);
                foreach ($letters as $j => $letter) {
                    $grid[$rows[$i]][$start + $j] = $letter;
                }
                $positions[$item['key']] = [$rows[$i] * 12 + $start, $rows[$i] * 12 + $start + strlen($word) - 1];
            }
            foreach ($grid as &$row) {
                foreach ($row as &$letter) {
                    $letter = $letter ?: chr(random_int(65, 90));
                }
                unset($letter);
            }
            unset($row);
            if ($c['game_difficulty'] === 'hard') {
                $transposed = array_fill(0, 12, []);
                foreach ($grid as $r => $row) {
                    foreach ($row as $col => $letter) {
                        $transposed[$col][$r] = $letter;
                    }
                }
                $grid = $transposed;
                foreach ($positions as &$points) {
                    $points = array_map(fn ($p) => ($p % 12) * 12 + intdiv($p, 12), $points);
                }
                unset($points);
            }
            $c['grid'] = array_merge(...$grid);
            $c['positions'] = $positions;
        } elseif ($t === 'sudoku') {
            $symbols = [1, 2, 3, 4];
            shuffle($symbols);
            $solution = [];
            foreach ([0, 2, 1, 3] as $shift) {
                for ($col = 0; $col < 4; $col++) {
                    $solution[] = $symbols[($col + $shift) % 4];
                }
            }
            $givens = $solution;
            $order = range(0, 15);
            shuffle($order);
            $minimum = ['easy' => 10, 'medium' => 8, 'hard' => 6][$c['game_difficulty']];
            foreach ($order as $index) {
                if (count(array_filter($givens)) <= $minimum) {
                    break;
                }
                $value = $givens[$index];
                $givens[$index] = 0;
                if ($this->solutions($givens) !== 1) {
                    $givens[$index] = $value;
                }
            }
            $c['solution'] = $solution;
            $c['givens'] = $givens;
        } elseif ($t === 'maze') {
            // A connected winding maze: every mission and exit is reachable.
            $map = ['.........', '########.', '.........', '.########', '.........', '########.', '.........'];
            $path = [];
            for ($row = 0; $row < 7; $row++) {
                $cols = $row % 4 === 2 ? array_reverse(range(0, 8)) : range(0, 8);
                foreach ($cols as $col) {
                    if ($map[$row][$col] === '.') {
                        $path[] = $row * 9 + $col;
                    }
                }
            }
            $c['map'] = $map;
            $c['missions'] = [];
            foreach ($c['items'] as $i => &$item) {
                $c['missions'][$path[(int) floor(($i + 1) * (count($path) - 2) / (count($c['items']) + 1))]] = $item['key'];
                $item['choices'] = [];
                foreach ($item['options'] as $option) {
                    $item['choices'][] = ['key' => Str::random(20), 'label' => $option];
                }
                $item['correct_choice'] = $item['choices'][0]['key'];
                shuffle($item['choices']);
            }
            unset($item);
            $c['exit'] = end($path);
        }

        return $c;
    }

    public function initial(array $c): array
    {
        return ['answer' => [], 'open' => [], 'matched' => [], 'found' => [], 'position' => 0, 'solved' => [], 'mistakes' => 0, 'escaped' => false];
    }

    public function publicConfig(array $c): array
    {
        $result = collect($c)->only(['kind', 'game_template', 'game_difficulty', 'level', 'duration_minutes', 'passing_score', 'max_attempts', 'grid', 'givens', 'map', 'missions', 'exit'])->all();
        $result['items'] = array_map(fn ($i) => collect($i)->only(['key', 'label', 'choices'])->all(), $c['items']);
        if ($c['game_template'] === 'word_search') {
            foreach ($result['items'] as $i => &$item) {
                $item['clue'] = $c['items'][$i]['target'];
            }
            unset($item);
        }
        if ($c['game_template'] === 'memory') {
            $result['items'] = [];
            $result['cards'] = array_column($c['cards'], 'key');
        }
        if ($c['game_template'] === 'categorize') {
            $result['categories'] = array_values(array_unique(array_column($c['items'], 'target')));
            shuffle($result['categories']);
        }

        return $result;
    }

    public function publicState(array $c, array $s): array
    {
        if ($c['game_template'] === 'memory') {
            $s['revealed'] = [];
            $s['locked'] = [];
            foreach ($c['cards'] as $card) {
                if (in_array($card['key'], $s['open'], true) || in_array($card['pair'], $s['matched'], true)) {
                    $s['revealed'][$card['key']] = $card['text'];
                    if (in_array($card['pair'], $s['matched'], true)) {
                        $s['locked'][] = $card['key'];
                    }
                }
            }
        }

        return $s;
    }

    public function play(array $c, array $s, array $input): array
    {
        $t = $c['game_template'];
        if ($t === 'memory') {
            $cards = array_column($c['cards'], null, 'key');
            $key = $input['key'] ?? '';
            $this->require(is_string($key) && isset($cards[$key]), 'Kartu tidak tersedia.');
            $this->require(! in_array($cards[$key]['pair'], $s['matched'], true), 'Pasangan sudah ditemukan.');
            if (count($s['open']) === 2) {
                $s['open'] = [];
            }
            $this->require(! in_array($key, $s['open'], true), 'Pilih kartu lain.');
            $s['open'][] = $key;
            if (count($s['open']) === 2) {
                if ($cards[$s['open'][0]]['pair'] === $cards[$s['open'][1]]['pair']) {
                    $s['matched'][] = $cards[$key]['pair'];
                } else {
                    $s['mistakes']++;
                }
            }
        } elseif ($t === 'word_search') {
            $a = $input['start'] ?? null;
            $b = $input['end'] ?? null;
            $this->require(is_int($a) && is_int($b) && $a >= 0 && $b >= 0 && $a < 144 && $b < 144, 'Koordinat tidak valid.');
            foreach ($c['positions'] as $key => [$first, $last]) {
                if ([$a, $b] === [$first, $last] || [$a, $b] === [$last, $first]) {
                    $s['found'] = array_values(array_unique([...$s['found'], $key]));

                    return $s;
                }
            }
            $s['mistakes']++;
        } elseif ($t === 'sudoku') {
            $i = $input['cell'] ?? null;
            $v = $input['value'] ?? null;
            $this->require(is_int($i) && $i >= 0 && $i < 16 && is_int($v) && $v >= 0 && $v <= 4 && $c['givens'][$i] === 0, 'Sel atau simbol tidak valid; petunjuk tidak bisa diubah.');
            $s['answer'][$i] = $v;
        } elseif ($t === 'categorize') {
            $key = $input['key'] ?? null;
            $target = $input['target'] ?? null;
            $this->require(is_string($key) && in_array($key, array_column($c['items'], 'key'), true) && is_string($target) && in_array($target, array_column($c['items'], 'target'), true), 'Item atau kategori tidak tersedia.');
            $s['answer'][$key] = $target;
        } elseif ($t === 'maze') {
            $pending = $c['missions'][$s['position']] ?? null;
            if (isset($input['choice'])) {
                $item = collect($c['items'])->firstWhere('key', $pending);
                $this->require($item !== null && ! in_array($pending, $s['solved'], true) && is_string($input['choice']) && in_array($input['choice'], array_column($item['choices'], 'key'), true), 'Pilihan atau pos tidak valid.');
                if ($input['choice'] === $item['correct_choice']) {
                    $s['solved'][] = $pending;
                } else {
                    $s['mistakes']++;
                }
            } else {
                $this->require(! $pending || in_array($pending, $s['solved'], true), 'Selesaikan pertanyaan pos ini sebelum bergerak.');
                $directions = ['up' => -9, 'down' => 9, 'left' => -1, 'right' => 1];
                $direction = $input['direction'] ?? '';
                $this->require(is_string($direction) && isset($directions[$direction]), 'Arah tidak valid.');
                $next = $s['position'] + $directions[$direction];
                $this->require($next >= 0 && $next < 63 && abs(($next % 9) - ($s['position'] % 9)) <= 1 && $c['map'][intdiv($next, 9)][$next % 9] === '.', 'Jalur terhalang dinding.');
                $s['position'] = $next;
                $s['escaped'] = $next === $c['exit'] && count($s['solved']) === count($c['items']);
            }
        }

        return $s;
    }

    public function checks(array $c, array $s): array
    {
        $checks = [];
        foreach ($c['items'] as $i => $item) {
            $checks[$item['label']] = match ($c['game_template']) {
                'memory' => in_array($item['key'], $s['matched'], true),
                'word_search' => in_array($item['key'], $s['found'], true),
                'maze' => in_array($item['key'], $s['solved'], true),
                'categorize' => ($s['answer'][$item['key']] ?? null) === $item['target'],
                default => false,
            };
        }
        if ($c['game_template'] === 'sudoku') {
            $checks = [];
            foreach ($c['solution'] as $i => $v) {
                if (! $c['givens'][$i]) {
                    $checks['Sel '.($i + 1)] = ($s['answer'][$i] ?? 0) === $v;
                }
            }
        }
        if ($c['game_template'] === 'maze') {
            $checks['Mencapai pintu keluar'] = $s['escaped'];
        }

        return $checks;
    }

    public function solutions(array $grid): int
    {
        $index = array_search(0, $grid, true);
        if ($index === false) {
            return 1;
        }
        $total = 0;
        for ($v = 1; $v <= 4; $v++) {
            $valid = true;
            for ($j = 0; $j < 16; $j++) {
                if ($grid[$j] === $v && (intdiv($j, 4) === intdiv($index, 4) || $j % 4 === $index % 4 || (intdiv(intdiv($j, 4), 2) === intdiv(intdiv($index, 4), 2) && intdiv($j % 4, 2) === intdiv($index % 4, 2)))) {
                    $valid = false;
                }
            }
            if ($valid) {
                $next = $grid;
                $next[$index] = $v;
                $total += $this->solutions($next);
                if ($total >= 2) {
                    return 2;
                }
            }
        }

        return $total;
    }

    private function require(bool $condition, string $message): void
    {
        if (! $condition) {
            throw ValidationException::withMessages(['game_items' => $message]);
        }
    }
}
