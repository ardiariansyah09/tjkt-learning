<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class EvidenceStorage
{
    public const MAX_FILES = 3;

    public const MAX_KB = 1024;

    public const MAX_TOTAL_BYTES = 2 * 1024 * 1024;

    public function validate(array $files): void
    {
        if (count($files) < 1 || count($files) > self::MAX_FILES) {
            $this->invalid('Unggah 1–3 berkas bukti.');
        }
        $total = 0;
        foreach ($files as $file) {
            if (! $file instanceof UploadedFile || ! $file->isValid() || ! $file->getSize() || $file->getSize() > self::MAX_KB * 1024) {
                $this->invalid('Setiap berkas harus valid, tidak kosong, dan maksimal 1 MB.');
            }
            $total += $file->getSize();
            $mime = $file->getMimeType();
            $ext = strtolower($file->getClientOriginalExtension());
            $allowed = ['application/pdf' => ['pdf'], 'image/png' => ['png'], 'image/jpeg' => ['jpg', 'jpeg'], 'image/webp' => ['webp']];
            if (! isset($allowed[$mime]) || ! in_array($ext, $allowed[$mime], true)) {
                $this->invalid('Gunakan PDF, PNG, JPEG atau WebP dengan ekstensi sesuai isi berkas.');
            }
            if ($mime === 'application/pdf') {
                $h = fopen($file->getRealPath(), 'rb');
                $signature = fread($h, 5);
                fclose($h);
                if ($signature !== '%PDF-') {
                    $this->invalid('Struktur PDF tidak dikenali.');
                }
            } else {
                $image = @getimagesize($file->getRealPath());
                if (! $image || $image['mime'] !== $mime || $image[0] > 12000 || $image[1] > 12000 || $image[0] * $image[1] > 40000000) {
                    $this->invalid('Gambar tidak valid atau dimensinya terlalu besar.');
                }
            }
        }
        if ($total > self::MAX_TOTAL_BYTES) {
            $this->invalid('Total berkas maksimal 2 MB per pengumpulan.');
        }
    }

    public function put(UploadedFile $file): array
    {
        $ext = match ($file->getMimeType()) {
            'application/pdf' => 'pdf','image/png' => 'png','image/jpeg' => 'jpg','image/webp' => 'webp'
        };
        $name = mb_substr(preg_replace('/[\x00-\x1F\x7F\/\\\\]/u', '_', mb_convert_encoding($file->getClientOriginalName(), 'UTF-8', 'UTF-8')), 0, 160);
        $path = bin2hex(random_bytes(24)).'.'.$ext;
        $stream = fopen($file->getRealPath(), 'rb');
        try {
            if (! Storage::disk('evidence')->put($path, $stream, ['visibility' => 'private'])) {
                throw new \RuntimeException('Bukti tidak dapat disimpan.');
            }
        } catch (\Throwable $e) {
            Storage::disk('evidence')->delete($path);
            throw $e;
        } finally {
            fclose($stream);
        }

        return ['path' => $path, 'original_name' => $name, 'mime' => $file->getMimeType(), 'size_bytes' => $file->getSize(), 'sha256' => hash_file('sha256', $file->getRealPath())];
    }

    private function invalid(string $message): never
    {
        throw ValidationException::withMessages(['evidence' => $message]);
    }
}
