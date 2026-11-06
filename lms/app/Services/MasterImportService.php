<?php

namespace App\Services;

use App\Http\Requests\PersonRequest;
use App\Http\Requests\RombelRequest;
use App\Models\ImportRecord;
use App\Models\Rombel;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class MasterImportService
{
    public const HEADERS = ['siswa' => ['nis', 'nama', 'username', 'password', 'rombel_id', 'status'], 'rombel' => ['nama', 'tingkat', 'tahun_ajaran', 'semester', 'status']];

    public function __construct(private XlsxService $xlsx, private MasterDataService $master, private AuditService $audit) {}

    public function run(string $resource, string $path, string $filename): ImportRecord
    {
        $rows = $this->xlsx->read($path, self::HEADERS[$resource]);

        return DB::transaction(function () use ($resource, $rows, $filename) {
            $counts = ['succeeded' => 0, 'skipped' => 0, 'failed' => 0];
            $details = [];
            foreach ($rows as $number => $row) {
                $active = match (strtolower($row['status'])) {
                    'aktif','1' => 1,'nonaktif','0' => 0,default => $row['status']
                };
                $data = $resource === 'siswa' ? ['nis' => $row['nis'], 'name' => $row['nama'], 'username' => $row['username'], 'password' => $row['password'], 'rombel_id' => $row['rombel_id'], 'is_active' => $active] : ['name' => $row['nama'], 'grade' => $row['tingkat'], 'academic_year' => $row['tahun_ajaran'], 'semester' => $row['semester'], 'is_active' => $active];
                $duplicate = $resource === 'siswa' ? User::withTrashed()->where(fn ($q) => $q->where('username', $data['username'])->orWhere('nis', $data['nis']))->exists() : Rombel::withTrashed()->where('name', $data['name'])->where('academic_year', $data['academic_year'])->where('semester', $data['semester'])->exists();
                if ($duplicate) {
                    $counts['skipped']++;
                    $details[] = ['row' => $number, 'status' => 'Dilewati', 'reason' => 'Identitas sudah ada di database atau baris sebelumnya; termasuk arsip.'];

                    continue;
                }
                try {
                    $validator = Validator::make($data, $resource === 'siswa' ? PersonRequest::dataRules('siswa') : RombelRequest::dataRules($data));
                    $validated = $validator->validate();
                    $resource === 'siswa' ? $this->master->savePerson('siswa', $validated) : $this->master->saveRombel($validated);
                    $counts['succeeded']++;
                } catch (UniqueConstraintViolationException $e) {
                    $counts['skipped']++;
                    $details[] = ['row' => $number, 'status' => 'Dilewati', 'reason' => 'Identitas telah dibuat oleh proses lain.'];
                } catch (ValidationException $e) {
                    $counts['failed']++;
                    $details[] = ['row' => $number, 'status' => 'Gagal', 'reason' => implode(' ', collect($e->errors())->flatten()->all())];
                }
            }
            $record = ImportRecord::create($counts + ['user_id' => auth()->id(), 'resource' => $resource, 'filename' => mb_substr(basename($filename), 0, 200), 'details' => $details]);
            $this->audit->record('import.completed', auth()->id(), ['import_id' => $record->id, 'resource' => $resource] + $counts);

            return $record;
        });
    }
}
