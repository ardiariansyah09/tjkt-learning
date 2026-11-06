<?php

namespace App\Services;

use App\Models\Rayon;
use App\Models\Rombel;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MasterDataService
{
    public function __construct(private MembershipService $membership, private AuditService $audit) {}

    public function savePerson(string $kind, array $data, ?User $person = null): User
    {
        return DB::transaction(function () use ($kind, $data, $person) {
            $new = $person === null;
            if ($person) {
                $person = User::whereKey($person->id)->lockForUpdate()->firstOrFail();
            }
            $fields = collect($data)->only($kind === 'siswa' ? ['name', 'username', 'nis', 'rayon', 'rayon_id', 'is_active'] : ['name', 'username', 'email', 'is_active'])->all();
            if ($kind === 'siswa' && (array_key_exists('rayon_id', $data) || array_key_exists('rayon', $data))) {
                $rayon = null;
                if (! empty($data['rayon_id'])) {
                    $rayon = Rayon::whereKey($data['rayon_id'])->lockForUpdate()->first();
                } elseif (! array_key_exists('rayon_id', $data) && ! empty($data['rayon'])) {
                    $rayon = Rayon::where('name', $data['rayon'])->lockForUpdate()->first();
                }
                $requested = ! empty($data['rayon_id']) || (! array_key_exists('rayon_id', $data) && ! empty($data['rayon']));
                if ($requested && (! $rayon || (! $rayon->is_active && $person?->rayon_id !== $rayon->id))) {
                    throw ValidationException::withMessages(['rayon_id' => 'Pilih rayon aktif dari master rayon.']);
                }
                $fields['rayon_id'] = $rayon?->id;
                $fields['rayon'] = $rayon?->name;
            }
            if ($new) {
                $fields += ['role' => $kind, 'password' => $data['password'], 'must_change_password' => true];
                $person = User::create($fields);
            } else {
                $person->update($fields);
            }
            if ($kind === 'siswa') {
                $this->membership->move($person, (int) $data['rombel_id']);
            } else {
                $person->teachingRombels()->sync($data['rombel_ids'] ?? []);
            }
            if (! $person->is_active) {
                $this->revokeSessions($person);
            }
            $this->audit->record($new ? 'person.created' : 'person.updated', auth()->id(), ['subject_id' => $person->id, 'role' => $kind]);

            return $person;
        });
    }

    public function revokeSessions(User $person): void
    {
        DB::table('sessions')->where('user_id', $person->id)->delete();
        $person->forceFill(['remember_token' => Str::random(60)])->save();
    }

    public function resetPassword(User $person, string $password): void
    {
        DB::transaction(function () use ($person, $password) {
            $person = User::whereKey($person->id)->lockForUpdate()->firstOrFail();
            if (Hash::check($password, $person->password)) {
                throw ValidationException::withMessages(['password' => 'Password baru harus berbeda dari password saat ini.']);
            }
            $person->update(['password' => $password, 'must_change_password' => true]);
            $this->revokeSessions($person);
            $this->audit->record('person.password_reset', auth()->id(), ['subject_id' => $person->id]);
        });
    }

    public function archivePerson(User $person): void
    {
        DB::transaction(function () use ($person) {
            $person = User::whereKey($person->id)->lockForUpdate()->firstOrFail();
            if ($person->role === 'siswa') {
                $this->membership->move($person, null);
            }
            $person->update(['is_active' => false]);
            $this->revokeSessions($person);
            $person->delete();
            $this->audit->record('person.archived', auth()->id(), ['subject_id' => $person->id]);
        });
    }

    public function saveRombel(array $data, ?Rombel $rombel = null): Rombel
    {
        return DB::transaction(function () use ($data, $rombel) {
            $new = $rombel === null;
            $fields = collect($data)->only(['name', 'grade', 'academic_year', 'semester', 'is_active'])->all();
            if ($rombel) {
                $rombel = Rombel::whereKey($rombel->id)->lockForUpdate()->firstOrFail();
                if ($rombel->memberships()->exists() && ($rombel->academic_year !== $fields['academic_year'] || (int) $rombel->semester !== (int) $fields['semester'])) {
                    throw ValidationException::withMessages(['academic_year' => 'Periode rombel dengan histori siswa tidak dapat diubah. Buat rombel periode baru.']);
                }
                $rombel->update($fields);
            } else {
                $rombel = Rombel::create($fields);
            }
            $rombel->teachers()->sync($data['teacher_ids'] ?? []);
            $this->audit->record($new ? 'rombel.created' : 'rombel.updated', auth()->id(), ['rombel_id' => $rombel->id]);

            return $rombel;
        });
    }

    public function archiveRombel(Rombel $rombel): void
    {
        DB::transaction(function () use ($rombel) {
            $rombel = Rombel::whereKey($rombel->id)->lockForUpdate()->firstOrFail();
            if ($rombel->memberships()->whereNull('left_at')->exists() || $rombel->modules()->exists()) {
                throw ValidationException::withMessages(['rombel' => 'Pindahkan siswa aktif dan lepaskan penugasan materi sebelum mengarsipkan rombel.']);
            }
            $rombel->update(['is_active' => false]);
            $rombel->delete();
            $this->audit->record('rombel.archived', auth()->id(), ['rombel_id' => $rombel->id]);
        });
    }
}
