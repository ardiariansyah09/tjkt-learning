<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\ImportRecord;
use App\Models\Rombel;
use App\Models\User;
use App\Services\MasterImportService;
use App\Services\XlsxService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MasterDataTest extends TestCase
{
    use DatabaseTransactions;

    private array $files = [];

    private function user(string $role = 'admin', array $data = []): User
    {
        return User::create(array_merge(['name' => 'Pengguna uji', 'username' => 'uji_'.bin2hex(random_bytes(6)), 'password' => 'PasswordUji2026!', 'role' => $role, 'is_active' => true, 'must_change_password' => false], $data));
    }

    private function rombel(array $data = []): Rombel
    {
        return Rombel::create(array_merge(['name' => 'X TJKT '.bin2hex(random_bytes(4)), 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true], $data));
    }

    private function studentData(Rombel $rombel, array $extra = []): array
    {
        return array_merge(['name' => 'Siswa baru', 'nis' => '00'.random_int(10000000, 99999999), 'username' => 'siswa_'.bin2hex(random_bytes(6)), 'password' => 'PasswordAwal2026!', 'rombel_id' => $rombel->id, 'is_active' => 1], $extra);
    }

    private function upload(array $headers, array $rows): UploadedFile
    {
        $path = app(XlsxService::class)->write($headers, $rows);
        $this->files[] = $path;

        return UploadedFile::fake()->createWithContent('data.xlsx', file_get_contents($path));
    }

    protected function tearDown(): void
    {
        foreach ($this->files as $path) {
            if (is_file($path)) {
                unlink($path);
            }
        }parent::tearDown();
    }

    public function test_admin_can_open_all_master_data_pages(): void
    {
        $this->actingAs($this->user());
        foreach (['/admin/siswa', '/admin/guru', '/admin/rombel', '/admin/siswa/tambah', '/admin/guru/tambah', '/admin/rombel/create', '/admin/impor/siswa', '/admin/impor/rombel'] as $path) {
            $this->get($path)->assertOk();
        }
    }

    public function test_student_creation_hashes_password_and_assigns_rombel(): void
    {
        $this->actingAs($this->user());
        $r = $this->rombel();
        $data = $this->studentData($r, ['rayon' => 'Taj 6']);
        $this->post('/admin/siswa', $data)->assertSessionHasNoErrors()->assertRedirect();
        $u = User::where('username', $data['username'])->firstOrFail();
        $this->assertSame($data['nis'], $u->nis);
        $this->assertSame('Taj 6', $u->rayon);
        $this->assertSame('siswa', $u->role);
        $this->assertTrue(Hash::check($data['password'], $u->password));
        $this->assertTrue($u->must_change_password);
        $this->assertDatabaseHas('rombel_students', ['user_id' => $u->id, 'rombel_id' => $r->id, 'left_at' => null]);
        $this->get('/admin/siswa/'.$u->id.'/edit')->assertOk()->assertSee('Riwayat keanggotaan');
    }

    public function test_student_transfer_preserves_history_and_idempotent_updates(): void
    {
        $this->actingAs($this->user());
        $a = $this->rombel();
        $b = $this->rombel(['semester' => 2]);
        $data = $this->studentData($a);
        $this->post('/admin/siswa', $data);
        $u = User::where('username', $data['username'])->firstOrFail();
        $data['rombel_id'] = $b->id;
        $this->put('/admin/siswa/'.$u->id, $data)->assertSessionHasNoErrors();
        $this->assertSame(1, $u->memberships()->whereNotNull('left_at')->count());
        $this->assertDatabaseHas('rombel_students', ['user_id' => $u->id, 'rombel_id' => $b->id, 'left_at' => null]);
        $this->put('/admin/siswa/'.$u->id, $data)->assertSessionHasNoErrors();
        $this->assertSame(2, $u->memberships()->count());
        $data['rombel_id'] = $a->id;
        $this->put('/admin/siswa/'.$u->id, $data)->assertSessionHasNoErrors();
        $this->assertSame(3, $u->memberships()->count());
        $this->assertSame(1, $u->memberships()->whereNull('left_at')->count());
        $this->get('/admin/rombel/'.$a->id.'?members=history')->assertOk()->assertSee($u->name);
    }

    public function test_invalid_and_duplicate_student_does_not_create_partial_data(): void
    {
        $this->actingAs($this->user());
        $r = $this->rombel(['is_active' => false]);
        $data = $this->studentData($r);
        $this->post('/admin/siswa', $data)->assertSessionHasErrors('rombel_id');
        $this->assertDatabaseMissing('users', ['username' => $data['username']]);
        $r->update(['is_active' => true]);
        $this->post('/admin/siswa', $data)->assertSessionHasNoErrors();
        $this->post('/admin/siswa', $data)->assertSessionHasErrors(['nis', 'username']);
        $data = $this->studentData($r, ['password' => 'pendek']);
        $this->post('/admin/siswa', $data)->assertSessionHasErrors('password');
        $this->assertDatabaseMissing('users', ['username' => $data['username']]);
    }

    public function test_teacher_crud_assignments_and_role_tampering_are_safe(): void
    {
        $this->actingAs($this->user());
        $a = $this->rombel();
        $b = $this->rombel();
        $data = ['name' => 'Guru Baru', 'username' => 'guru_'.bin2hex(random_bytes(6)), 'password' => 'PasswordGuru2026!', 'email' => null, 'is_active' => 1, 'rombel_ids' => [$a->id], 'role' => 'admin'];
        $this->post('/admin/guru', $data)->assertSessionHasNoErrors();
        $u = User::where('username', $data['username'])->firstOrFail();
        $this->assertSame('guru', $u->role);
        $this->assertSame([$a->id], $u->teachingRombels->modelKeys());
        $data['rombel_ids'] = [$b->id];
        $data['name'] = 'Guru Diperbarui';
        $this->put('/admin/guru/'.$u->id, $data)->assertSessionHasNoErrors();
        $this->assertSame([$b->id], $u->fresh()->teachingRombels->modelKeys());
        $this->get('/admin/guru/'.$u->id.'/edit')->assertOk();
        $this->get('/admin/siswa/'.$u->id.'/edit')->assertNotFound();
        $this->delete('/admin/guru/'.$u->id)->assertRedirect('/admin/guru');
        $this->assertSoftDeleted('users', ['id' => $u->id]);
    }

    public function test_password_reset_revokes_sessions_and_requires_change(): void
    {
        $this->actingAs($this->user());
        $u = $this->user('siswa');
        $session = 'uji_'.bin2hex(random_bytes(12));
        DB::table('sessions')->insert(['id' => $session, 'user_id' => $u->id, 'payload' => '', 'last_activity' => time()]);
        $this->get('/admin/siswa/'.$u->id.'/reset-password')->assertOk();
        $this->put('/admin/siswa/'.$u->id.'/reset-password', ['password' => 'PasswordReset2026!', 'password_confirmation' => 'berbeda'])->assertSessionHasErrors('password');
        $this->put('/admin/siswa/'.$u->id.'/reset-password', ['password' => 'PasswordReset2026!', 'password_confirmation' => 'PasswordReset2026!'])->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('sessions', ['id' => $session]);
        $this->assertTrue($u->fresh()->must_change_password);
        $this->assertTrue(Hash::check('PasswordReset2026!', $u->fresh()->password));
        $audit = AuditLog::where('event', 'person.password_reset')->latest('id')->firstOrFail();
        $this->assertStringNotContainsString('PasswordReset', json_encode($audit));
        $this->actingAs($u->fresh())->get('/siswa/dashboard')->assertRedirect('/ganti-password');
    }

    public function test_deactivation_revokes_sessions_and_can_be_reactivated(): void
    {
        $this->actingAs($this->user());
        $u = $this->user('siswa');
        $session = 'uji_'.bin2hex(random_bytes(12));
        DB::table('sessions')->insert(['id' => $session, 'user_id' => $u->id, 'payload' => '', 'last_activity' => time()]);
        $this->patch('/admin/siswa/'.$u->id.'/status', ['is_active' => 0])->assertSessionHasNoErrors();
        $this->assertFalse($u->fresh()->is_active);
        $this->assertDatabaseMissing('sessions', ['id' => $session]);
        $this->patch('/admin/siswa/'.$u->id.'/status', ['is_active' => 1])->assertSessionHasNoErrors();
        $this->assertTrue($u->fresh()->is_active);
    }

    public function test_archive_student_preserves_identity_and_memberships(): void
    {
        $this->actingAs($this->user());
        $r = $this->rombel();
        $data = $this->studentData($r);
        $this->post('/admin/siswa', $data);
        $u = User::where('username', $data['username'])->firstOrFail();
        $this->delete('/admin/siswa/'.$u->id)->assertRedirect('/admin/siswa');
        $this->assertSoftDeleted('users', ['id' => $u->id]);
        $this->assertSame(1, $u->memberships()->whereNotNull('left_at')->count());
        $this->post('/admin/siswa', $data)->assertSessionHasErrors(['username', 'nis']);
        $this->get('/admin/rombel/'.$r->id.'?members=history')->assertOk()->assertSee($u->name);
    }

    public function test_rombel_crud_validates_period_and_teacher_roles(): void
    {
        $this->actingAs($this->user());
        $teacher = $this->user('guru');
        $data = ['name' => 'X TJKT '.bin2hex(random_bytes(4)), 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => 1, 'teacher_ids' => [$teacher->id]];
        $this->post('/admin/rombel', $data)->assertSessionHasNoErrors();
        $r = Rombel::where('name', $data['name'])->firstOrFail();
        $this->assertSame([$teacher->id], $r->teachers->modelKeys());
        $this->get('/admin/rombel/'.$r->id)->assertOk();
        $this->get('/admin/rombel/'.$r->id.'/edit')->assertOk();
        $this->post('/admin/rombel', $data)->assertSessionHasErrors('name');
        $bad = $data;
        $bad['academic_year'] = '2026/2029';
        $this->post('/admin/rombel', $bad)->assertSessionHasErrors('academic_year');
        $bad = $data;
        $bad['teacher_ids'] = [$this->user('siswa')->id];
        $this->put('/admin/rombel/'.$r->id, $bad)->assertSessionHasErrors('teacher_ids.0');
        $data['name'] .= ' Baru';
        $this->put('/admin/rombel/'.$r->id, $data)->assertSessionHasNoErrors();
        $this->delete('/admin/rombel/'.$r->id)->assertRedirect('/admin/rombel');
        $this->assertSoftDeleted('rombels', ['id' => $r->id]);
    }

    public function test_rombel_with_students_cannot_be_archived_or_have_period_rewritten(): void
    {
        $this->actingAs($this->user());
        $r = $this->rombel();
        $this->post('/admin/siswa', $this->studentData($r));
        $this->delete('/admin/rombel/'.$r->id)->assertSessionHasErrors('rombel');
        $this->put('/admin/rombel/'.$r->id, ['name' => $r->name, 'grade' => 10, 'academic_year' => '2027/2028', 'semester' => 1, 'is_active' => 1])->assertSessionHasErrors('academic_year');
        $this->assertFalse($r->fresh()->trashed());
    }

    public function test_search_filter_pagination_and_rombel_listing_are_database_backed(): void
    {
        $this->actingAs($this->user());
        $r = $this->rombel();
        $data = $this->studentData($r, ['name' => 'Nama Pencarian Khusus']);
        $this->post('/admin/siswa', $data);
        $this->get('/admin/siswa?q=Nama%20Pencarian%20Khusus&rombel_id='.$r->id.'&status=1')->assertOk()->assertViewHas('people', fn ($p) => $p->total() === 1);
        $this->get('/admin/siswa?status=0')->assertViewHas('people', fn ($p) => $p->total() === 0);
        for ($i = 0; $i < 16; $i++) {
            $this->user('guru');
        }$this->get('/admin/guru?page=2')->assertOk()->assertViewHas('people', fn ($p) => $p->currentPage() === 2 && $p->count() === 1);
        $this->get('/admin/rombel?academic_year=2026%2F2027&semester=1')->assertOk();
    }

    public function test_non_admin_cannot_read_or_mutate_master_data_or_download_excel(): void
    {
        $target = $this->user('siswa');
        $r = $this->rombel();
        foreach (['guru', 'siswa'] as $role) {
            $this->actingAs($this->user($role));
            foreach (['/admin/siswa', '/admin/guru', '/admin/rombel', '/admin/siswa/ekspor', '/admin/rombel/ekspor', '/admin/impor/siswa/template', '/admin/impor/siswa'] as $path) {
                $this->get($path)->assertForbidden();
            }$this->post('/admin/siswa', $this->studentData($r))->assertForbidden();
            $this->put('/admin/siswa/'.$target->id.'/reset-password', ['password' => 'PasswordReset2026!', 'password_confirmation' => 'PasswordReset2026!'])->assertForbidden();
            $this->delete('/admin/rombel/'.$r->id)->assertForbidden();
        }
    }

    public function test_student_xlsx_import_reports_success_duplicates_and_failures_without_passwords(): void
    {
        $this->actingAs($this->user());
        $r = $this->rombel();
        $unique = bin2hex(random_bytes(5));
        $file = $this->upload(MasterImportService::HEADERS['siswa'], [['NIS-tidak-valid', 'Siswa tidak valid', 'bad_'.$unique, 'PasswordImport2026!', $r->id, 'aktif'], ['00123456789', 'Siswa Excel', 'excel_'.$unique, 'PasswordImport2026!', $r->id, 'aktif'], ['00123456789', 'Duplikat', 'excel_'.$unique, 'PasswordImport2026!', $r->id, 'aktif'], ['00999999999', 'Password pendek', 'short_'.$unique, 'pendek', $r->id, 'aktif']]);
        $this->post('/admin/impor/siswa', ['file' => $file])->assertSessionHasNoErrors()->assertRedirect();
        $record = ImportRecord::latest('id')->firstOrFail();
        $this->assertSame(1, $record->succeeded);
        $this->assertSame(1, $record->skipped);
        $this->assertSame(2, $record->failed);
        $this->assertStringNotContainsString('PasswordImport', json_encode($record));
        $this->assertDatabaseHas('users', ['username' => 'excel_'.$unique, 'nis' => '00123456789']);
        $this->get('/admin/impor/hasil/'.$record->id)->assertOk()->assertSee('Dilewati')->assertSee('Gagal');
    }

    public function test_rombel_xlsx_import_and_template_are_functional(): void
    {
        $this->actingAs($this->user());
        $name = 'X Excel '.bin2hex(random_bytes(5));
        $this->post('/admin/impor/rombel', ['file' => $this->upload(MasterImportService::HEADERS['rombel'], [[$name, '10', '2026/2027', '1', 'aktif'], [$name, '10', '2026/2027', '1', 'aktif'], ['Buruk', '99', '2026/2027', '1', 'aktif']])])->assertSessionHasNoErrors();
        $record = ImportRecord::latest('id')->firstOrFail();
        $this->assertSame([1, 1, 1], [$record->succeeded, $record->skipped, $record->failed]);
        $response = $this->get('/admin/impor/rombel/template')->assertOk()->assertDownload('template-rombel.xlsx');
        $this->files[] = $response->baseResponse->getFile()->getPathname();
    }

    public function test_excel_exports_preserve_text_and_exclude_passwords(): void
    {
        $this->actingAs($this->user());
        $r = $this->rombel();
        $data = $this->studentData($r, ['nis' => '00000012345', 'rayon' => 'Cib 4', 'name' => '=HYPERLINK("https://example.invalid")']);
        $this->post('/admin/siswa', $data);
        $response = $this->get('/admin/siswa/ekspor')->assertOk()->assertDownload();
        $path = $response->baseResponse->getFile()->getPathname();
        $this->files[] = $path;
        $rows = app(XlsxService::class)->read($path, ['nis', 'nama', 'username', 'rayon', 'rombel_id', 'rombel', 'tahun_ajaran', 'semester', 'status', 'dibuat_pada']);
        $this->assertSame('00000012345', $rows[2]['nis']);
        $this->assertSame('Cib 4', $rows[2]['rayon']);
        $this->assertSame($data['name'], $rows[2]['nama']);
        $zip = new \ZipArchive;
        $zip->open($path);
        $xml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();
        $this->assertStringNotContainsString('password', strtolower($xml));
        $this->assertStringNotContainsString('PasswordAwal', $xml);
        $this->assertStringNotContainsString('<f>', $xml);
        foreach (['/admin/guru/ekspor', '/admin/rombel/ekspor'] as $url) {
            $res = $this->get($url)->assertOk()->assertDownload();
            $this->files[] = $res->baseResponse->getFile()->getPathname();
        }
    }

    public function test_malformed_formula_external_and_oversized_xlsx_are_rejected(): void
    {
        $this->actingAs($this->user());
        $this->post('/admin/impor/siswa', ['file' => UploadedFile::fake()->createWithContent('data.xlsx', 'not a zip')])->assertSessionHasErrors('file');
        $this->post('/admin/impor/siswa', ['file' => UploadedFile::fake()->create('huge.xlsx', 2049, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')])->assertSessionHasErrors('file');
        $this->post('/admin/impor/siswa', ['file' => $this->upload(['wrong'], [['bad']])])->assertSessionHasErrors('file');
        $path = app(XlsxService::class)->write(MasterImportService::HEADERS['rombel'], [['X Formula', '10', '2026/2027', '1', 'aktif']]);
        $this->files[] = $path;
        $zip = new \ZipArchive;
        $zip->open($path);
        $xml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->addFromString('xl/worksheets/sheet1.xml', str_replace('<is><t xml:space="preserve">X Formula</t></is>', '<f>1+1</f><v>2</v>', $xml));
        $zip->close();
        $this->post('/admin/impor/rombel', ['file' => UploadedFile::fake()->createWithContent('formula.xlsx', file_get_contents($path))])->assertSessionHasErrors('file');
        $this->assertSame(0, ImportRecord::count());
    }

    public function test_import_result_is_private_to_its_admin_owner(): void
    {
        $owner = $this->user();
        $other = $this->user();
        $record = ImportRecord::create(['user_id' => $owner->id, 'resource' => 'siswa', 'filename' => 'data.xlsx', 'succeeded' => 0, 'skipped' => 0, 'failed' => 0, 'details' => []]);
        $this->actingAs($other)->get('/admin/impor/hasil/'.$record->id)->assertForbidden();
    }

    public function test_import_rejects_more_than_500_rows_and_external_links(): void
    {
        $this->actingAs($this->user());
        $rows = array_fill(0, 501, ['X Banyak', '10', '2026/2027', '1', 'aktif']);
        $this->post('/admin/impor/rombel', ['file' => $this->upload(MasterImportService::HEADERS['rombel'], $rows)])->assertSessionHasErrors('file');
        $path = app(XlsxService::class)->write(MasterImportService::HEADERS['rombel'], [['X Tautan', '10', '2026/2027', '1', 'aktif']]);
        $this->files[] = $path;
        $zip = new \ZipArchive;
        $zip->open($path);
        $zip->addFromString('xl/worksheets/_rels/sheet1.xml.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.invalid" TargetMode="External"/></Relationships>');
        $zip->close();
        $this->post('/admin/impor/rombel', ['file' => UploadedFile::fake()->createWithContent('tautan.xlsx', file_get_contents($path))])->assertSessionHasErrors('file');
        $this->assertSame(0, ImportRecord::count());
    }

    public function test_failed_import_row_rolls_back_its_account_creation(): void
    {
        $this->actingAs($this->user());
        $rombel = $this->rombel(['is_active' => false]);
        $username = 'inactive_'.bin2hex(random_bytes(5));
        $this->post('/admin/impor/siswa', ['file' => $this->upload(MasterImportService::HEADERS['siswa'], [['0000087654321', 'Siswa Uji', $username, 'PasswordImport2026!', $rombel->id, 'aktif']])])->assertSessionHasNoErrors();
        $record = ImportRecord::latest('id')->firstOrFail();
        $this->assertSame(1, $record->failed);
        $this->assertSame(0, $record->succeeded);
        $this->assertDatabaseMissing('users', ['username' => $username]);
        $this->assertDatabaseMissing('rombel_students', ['rombel_id' => $rombel->id]);
    }
}
