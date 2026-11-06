<?php

namespace App\Services;

use DOMDocument;
use DOMXPath;
use Illuminate\Validation\ValidationException;
use ZipArchive;

/** Narrow XLSX data interchange: strings only, no formulas, macros or external resources. */
class XlsxService
{
    private function invalid(string $message): never
    {
        throw ValidationException::withMessages(['file' => $message]);
    }

    private function xml(string|false $source): DOMDocument
    {
        if ($source === false || preg_match('/<!DOCTYPE|<!ENTITY/i', $source)) {
            $this->invalid('Struktur XML Excel tidak aman atau tidak lengkap.');
        }
        $previous = libxml_use_internal_errors(true);
        try {
            $doc = new DOMDocument;
            if (! $doc->loadXML($source, LIBXML_NONET | LIBXML_NOBLANKS)) {
                $this->invalid('Struktur file Excel tidak valid.');
            }

            return $doc;
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
    }

    private function query(DOMDocument $document, string $query): \DOMNodeList
    {
        return (new DOMXPath($document))->query($query);
    }

    public function read(string $path, array $headers): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            $this->invalid('File tidak dapat dibaca sebagai Excel .xlsx.');
        }
        try {
            if ($zip->numFiles > 2000) {
                $this->invalid('File Excel terlalu kompleks. Gunakan template yang disediakan.');
            }
            $total = 0;
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $entry = $zip->statIndex($i);
                $total += $entry['size'];
                if ($total > 20 * 1024 * 1024) {
                    $this->invalid('Ukuran hasil ekstraksi Excel melebihi 20 MB.');
                }
                if (preg_match('~vbaProject|embeddings/|externalLinks/~i', $entry['name'])) {
                    $this->invalid('Makro, objek tersemat, dan tautan eksternal tidak diizinkan.');
                }
                if (str_ends_with($entry['name'], '.rels')) {
                    $rels = $this->xml($zip->getFromIndex($i));
                    foreach ($this->query($rels, '//*[local-name()="Relationship"]') as $rel) {
                        if (strcasecmp($rel->getAttribute('TargetMode'), 'External') === 0) {
                            $this->invalid('Tautan eksternal tidak diizinkan dalam file impor.');
                        }
                    }
                }
            }
            $book = $this->xml($zip->getFromName('xl/workbook.xml'));
            $sheets = $this->query($book, '//*[local-name()="sheets"]/*[local-name()="sheet"]');
            if ($sheets->count() !== 1) {
                $this->invalid('Gunakan satu lembar kerja saja untuk impor.');
            }
            $rid = $sheets->item(0)->getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
            $rels = $this->xml($zip->getFromName('xl/_rels/workbook.xml.rels'));
            $target = null;
            foreach ($this->query($rels, '//*[local-name()="Relationship"]') as $rel) {
                if ($rel->getAttribute('Id') === $rid) {
                    $target = $rel->getAttribute('Target');
                }
            }
            if (! $target || str_contains($target, '..')) {
                $this->invalid('Referensi lembar Excel tidak valid.');
            }
            $target = str_starts_with($target, '/') ? ltrim($target, '/') : 'xl/'.$target;
            $strings = [];
            $shared = $zip->getFromName('xl/sharedStrings.xml');
            if ($shared !== false) {
                foreach ($this->query($this->xml($shared), '//*[local-name()="sst"]/*[local-name()="si"]') as $item) {
                    $str = '';
                    foreach ($item->getElementsByTagName('t') as $text) {
                        $str .= $text->textContent;
                    }
                    $strings[] = $str;
                }
            }
            $doc = $this->xml($zip->getFromName($target));
            if ($this->query($doc, '//*[local-name()="f"]')->count()) {
                $this->invalid('Rumus Excel tidak diizinkan. Salin sebagai nilai teks terlebih dahulu.');
            }
            $table = [];
            foreach ($this->query($doc, '//*[local-name()="sheetData"]/*[local-name()="row"]') as $row) {
                $number = (int) $row->getAttribute('r');
                $values = array_fill(0, count($headers), '');
                foreach ($row->getElementsByTagName('c') as $cell) {
                    if (! preg_match('/^([A-Z]{1,3})([0-9]+)$/', $cell->getAttribute('r'), $m)) {
                        $this->invalid('Koordinat sel Excel tidak valid.');
                    }
                    $column = 0;
                    foreach (str_split($m[1]) as $char) {
                        $column = $column * 26 + ord($char) - 64;
                    }
                    $column--;
                    $value = $cell->getElementsByTagName('v')->item(0)?->textContent ?? '';
                    if ($cell->getAttribute('t') === 's') {
                        $index = filter_var($value, FILTER_VALIDATE_INT);
                        if ($index === false || ! array_key_exists($index, $strings)) {
                            $this->invalid('Referensi teks Excel tidak valid.');
                        }
                        $value = $strings[$index];
                    } elseif ($cell->getAttribute('t') === 'inlineStr') {
                        $value = '';
                        foreach ($cell->getElementsByTagName('t') as $text) {
                            $value .= $text->textContent;
                        }
                    }
                    if (mb_strlen($value) > 1000) {
                        $this->invalid('Isi sel terlalu panjang (maksimal 1.000 karakter).');
                    }
                    if ($column >= count($headers)) {
                        if (trim($value) !== '') {
                            $this->invalid('Jumlah kolom tidak sesuai template.');
                        }

                        continue;
                    }
                    $values[$column] = trim($value);
                }
                if (! array_filter($values, fn ($v) => $v !== '')) {
                    continue;
                }
                if ($number < 1 || $number > 501) {
                    $this->invalid('Maksimal 500 baris data, dimulai setelah header pada baris pertama.');
                }
                if (isset($table[$number])) {
                    $this->invalid('Nomor baris ganda dalam Excel.');
                }
                $table[$number] = $values;
            }
            if (($table[1] ?? []) !== $headers) {
                $this->invalid('Header harus persis: '.implode(', ', $headers).'. Gunakan template impor.');
            }
            unset($table[1]);
            if (! $table) {
                $this->invalid('File tidak memiliki baris data.');
            }
            $result = [];
            foreach ($table as $number => $values) {
                $result[$number] = array_combine($headers, $values);
            }

            return $result;
        } finally {
            $zip->close();
        }
    }

    public function write(array $headers, iterable $rows): string
    {
        $directory = storage_path('app/private/exports');
        if (! is_dir($directory) && ! mkdir($directory, 02770, true) && ! is_dir($directory)) {
            throw new \RuntimeException('Direktori ekspor tidak dapat dibuat.');
        }
        $path = tempnam($directory, 'xlsx_');
        if ($path === false) {
            throw new \RuntimeException('Berkas ekspor tidak dapat dibuat.');
        }
        chmod($path, 0600);
        $escape = fn ($v) => htmlspecialchars(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', (string) $v), ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $xml = '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="'.count($headers).'" width="24" customWidth="1" style="1"/></cols><sheetData>';
        $number = 0;
        foreach ((function () use ($headers, $rows) {
            yield $headers;
            yield from $rows;
        })() as $row) {
            $number++;
            $xml .= '<row r="'.$number.'">';
            foreach (array_values($row) as $index => $value) {
                $n = $index + 1;
                $column = '';
                while ($n > 0) {
                    $n--;
                    $column = chr(65 + $n % 26).$column;
                    $n = intdiv($n, 26);
                }
                $xml .= '<c r="'.$column.$number.'" t="inlineStr" s="1"><is><t xml:space="preserve">'.$escape($value).'</t></is></c>';
            }
            $xml .= '</row>';
        }
        $xml .= '</sheetData></worksheet>';
        $parts = [
            '[Content_Types].xml' => '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
            '_rels/.rels' => '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
            'xl/workbook.xml' => '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>',
            'xl/_rels/workbook.xml.rels' => '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
            'xl/styles.xml' => '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
            'xl/worksheets/sheet1.xml' => $xml,
        ];
        $zip = new ZipArchive;
        try {
            if ($zip->open($path, ZipArchive::OVERWRITE) !== true) {
                throw new \RuntimeException('Arsip ekspor tidak dapat dibuat.');
            }
            foreach ($parts as $name => $body) {
                if (! $zip->addFromString($name, $body)) {
                    throw new \RuntimeException('Isi ekspor tidak dapat ditulis.');
                }
            }
            if (! $zip->close()) {
                throw new \RuntimeException('Ekspor tidak dapat diselesaikan.');
            }

            return $path;
        } catch (\Throwable $e) {
            @unlink($path);
            throw $e;
        }
    }
}
