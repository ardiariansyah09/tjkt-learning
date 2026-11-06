<?php

namespace Tests\Feature;

use App\Models\Rayon;
use App\Models\Rombel;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class RayonTest extends TestCase
{
    use DatabaseTransactions;

    private function user(string $role = 'admin'): User
    {
        return User::create(['name' => 'Uji rayon', 'username' => 'rayon_'.bin2hex(random_bytes(6)), 'password' => 'PasswordUji2026!', 'role' => $role, 'is_active' => true, 'must_change_password' => false]);
    }

    public function test_master_contains_all_40_rayons_and_only_admin_can_manage_them(): void
    {
        $this->assertSame(40, Rayon::count());
        $this->actingAs($this->user('guru'))->get('/admin/rayon')->assertForbidden();
        $this->post('/admin/rayon', ['name' => 'Test', 'is_active' => 1])->assertForbidden();
        $this->actingAs($this->user())->get('/admin/rayon')->assertOk()->assertSee('Cia 1')->assertSee('Cic 10')->assertSee('Wik 5');
        $this->get('/admin/rayon/create')->assertOk();
        $this->post('/admin/rayon', ['name' => 'Baru 1', 'is_active' => 1])->assertSessionHasNoErrors()->assertRedirect();
        $rayon = Rayon::where('name', 'Baru 1')->firstOrFail();
        $this->get('/admin/rayon/'.$rayon->id.'/edit')->assertOk();
        $this->post('/admin/rayon', ['name' => 'Baru 1', 'is_active' => 1])->assertSessionHasErrors('name');
        $this->delete('/admin/rayon/'.$rayon->id)->assertSessionHasNoErrors();
        $this->assertSoftDeleted('rayons', ['id' => $rayon->id]);
    }

    public function test_students_use_master_rayon_and_renames_and_filters_remain_consistent(): void
    {
        $this->actingAs($this->user());
        $rayon = Rayon::where('name', 'Cib 4')->firstOrFail();
        $rombel = Rombel::create(['name' => 'Rayon test', 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1, 'is_active' => true]);
        $data = ['name' => 'Siswa Rayon Khusus', 'nis' => '99887766', 'username' => 'rayonsiswa', 'password' => 'PasswordAwal2026!', 'is_active' => 1, 'rombel_id' => $rombel->id, 'rayon_id' => $rayon->id];
        $this->post('/admin/siswa', $data)->assertSessionHasNoErrors();
        $u = User::where('nis', $data['nis'])->firstOrFail();
        $this->assertSame($rayon->id, $u->rayon_id);
        $this->assertSame('Cib 4', $u->rayon);
        $this->get('/admin/siswa?rayon_id='.$rayon->id)->assertOk()->assertSee('<th>Rayon</th>', false)->assertSee('<td>99887766</td>', false)->assertSee('<td>Cib 4</td>', false);
        $this->get('/admin/siswa?rayon_id='.Rayon::where('name', 'Cia 1')->value('id'))->assertDontSee('Siswa Rayon Khusus');
        $this->get('/admin/siswa/'.$u->id.'/edit')->assertOk()->assertSee('name="rayon_id"', false)->assertDontSee('name="rayon"', false);
        $this->put('/admin/rayon/'.$rayon->id, ['name' => 'Cib Empat', 'is_active' => 1])->assertSessionHasNoErrors();
        $this->assertSame('Cib Empat', $u->fresh()->rayon);
        $this->assertSame('Cib Empat', $u->fresh()->rayonMaster->name);
        $this->delete('/admin/rayon/'.$rayon->id)->assertSessionHasErrors('rayon');
        $this->assertNotNull(Rayon::find($rayon->id));
        $this->put('/admin/rayon/'.$rayon->id, ['name' => 'Cib Empat', 'is_active' => 0])->assertSessionHasNoErrors();
        $this->put('/admin/siswa/'.$u->id, $data)->assertSessionHasNoErrors();
        $data['username'] = 'newrayonsiswa';
        $data['nis'] = '99887765';
        $this->post('/admin/siswa', $data)->assertSessionHasErrors('rayon_id');
        $data['rayon_id'] = 9999999;
        $this->post('/admin/siswa', $data)->assertSessionHasErrors('rayon_id');
        $data['rayon_id'] = null;
        $this->put('/admin/siswa/'.$u->id, $data)->assertSessionHasNoErrors();
        $this->assertNull($u->fresh()->rayon_id);
        $this->assertNull($u->fresh()->rayon);
    }
}
