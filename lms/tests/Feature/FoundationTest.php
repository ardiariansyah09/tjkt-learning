<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Module;
use App\Models\Rombel;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class FoundationTest extends TestCase
{
    use DatabaseTransactions;

    private function account(string $role = 'siswa', array $extra = []): User
    {
        return User::create(array_merge(['name' => 'Pengguna Uji', 'username' => 'uji_'.bin2hex(random_bytes(6)), 'role' => $role, 'password' => 'PasswordUji2026!', 'is_active' => true, 'must_change_password' => false], $extra));
    }

    public function test_login_page_is_indonesian_and_guest_dashboard_requires_login(): void
    {
        $this->get('/login')->assertOk()->assertSee('Masuk ke ruang belajar');
        foreach (['admin', 'guru', 'siswa'] as $role) {
            $this->get('/'.$role.'/dashboard')->assertRedirect('/login');
        }
    }

    public function test_each_role_logs_in_and_only_accesses_own_dashboard(): void
    {
        foreach (['admin', 'guru', 'siswa'] as $role) {
            $u = $this->account($role);
            $this->post('/login', ['username' => $u->username, 'password' => 'PasswordUji2026!'])->assertRedirect('/'.$role.'/dashboard');
            $this->assertAuthenticatedAs($u);
            $this->get('/'.$role.'/dashboard')->assertOk()->assertSee('Beranda')->assertSee($u->name);
            foreach (array_diff(['admin', 'guru', 'siswa'], [$role]) as $other) {
                $this->get('/'.$other.'/dashboard')->assertForbidden();
            }$this->post('/logout')->assertRedirect('/login');
            $this->assertGuest();
        }
    }

    public function test_wrong_password_and_inactive_account_are_rejected(): void
    {
        $u = $this->account(extra: ['is_active' => false]);
        $this->post('/login', ['username' => $u->username, 'password' => 'PasswordUji2026!'])->assertSessionHasErrors('username');
        $u->update(['is_active' => true]);
        $this->post('/login', ['username' => $u->username, 'password' => 'salah'])->assertSessionHasErrors('username');
        $this->assertGuest();
    }

    public function test_inactive_existing_session_is_revoked(): void
    {
        $u = $this->account();
        $this->actingAs($u);
        $u->update(['is_active' => false]);
        $this->get('/siswa/dashboard')->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_first_login_requires_password_change_and_validates_current_password(): void
    {
        $u = $this->account(extra: ['must_change_password' => true]);
        $this->post('/login', ['username' => $u->username, 'password' => 'PasswordUji2026!'])->assertRedirect('/ganti-password');
        $this->get('/siswa/dashboard')->assertRedirect('/ganti-password');
        $this->put('/ganti-password', ['current_password' => 'salah', 'password' => 'PasswordBaru2026!', 'password_confirmation' => 'PasswordBaru2026!'])->assertSessionHasErrors('current_password');
        $this->put('/ganti-password', ['current_password' => 'PasswordUji2026!', 'password' => 'PasswordBaru2026!', 'password_confirmation' => 'PasswordBaru2026!'])->assertRedirect('/siswa/dashboard');
        $this->assertFalse($u->fresh()->must_change_password);
        $this->assertTrue(Hash::check('PasswordBaru2026!', $u->fresh()->password));
        $this->assertDatabaseHas('audit_logs', ['event' => 'password.changed', 'user_id' => $u->id]);
        $this->get('/siswa/dashboard')->assertOk();
    }

    public function test_password_confirmation_and_strength_are_enforced(): void
    {
        $u = $this->account();
        $this->actingAs($u)->put('/ganti-password', ['current_password' => 'PasswordUji2026!', 'password' => 'pendek', 'password_confirmation' => 'berbeda'])->assertSessionHasErrors('password');
        $this->assertTrue(Hash::check('PasswordUji2026!', $u->fresh()->password));
    }

    public function test_login_is_rate_limited_after_five_failures(): void
    {
        $u = $this->account();
        $key = hash('sha256', strtolower($u->username).'|127.0.0.1');
        RateLimiter::clear($key);
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', ['username' => $u->username, 'password' => 'salah'])->assertSessionHasErrors('username');
        }$this->post('/login', ['username' => $u->username, 'password' => 'PasswordUji2026!'])->assertSessionHasErrors('username');
        $this->assertGuest();
        RateLimiter::clear($key);
    }

    public function test_audit_logs_do_not_contain_credentials_and_password_is_hashed(): void
    {
        $u = $this->account();
        $this->post('/login', ['username' => $u->username, 'password' => 'PasswordUji2026!']);
        $event = AuditLog::where('user_id', $u->id)->latest('id')->firstOrFail();
        $this->assertSame('login.success', $event->event);
        $this->assertStringNotContainsString('PasswordUji', json_encode($event));
        $this->assertNotSame('PasswordUji2026!', $u->password);
    }

    public function test_module_policy_respects_assignments_publication_and_teacher_ownership(): void
    {
        $teacher = $this->account('guru');
        $other = $this->account('guru');
        $student = $this->account();
        $admin = $this->account('admin');
        $module = Module::create(['code' => 'TEST-'.bin2hex(random_bytes(6)), 'title' => 'Materi uji', 'created_by' => $teacher->id, 'status' => 'draft']);
        $this->assertTrue(Gate::forUser($teacher)->allows('update', $module));
        $this->assertFalse(Gate::forUser($other)->allows('update', $module));
        $this->assertTrue(Gate::forUser($admin)->allows('view', $module));
        $this->assertFalse(Gate::forUser($student)->allows('view', $module));
        $rombel = Rombel::create(['name' => 'Uji '.bin2hex(random_bytes(4)), 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1]);
        $rombel->students()->attach($student->id, ['joined_at' => now()]);
        $module->rombels()->attach($rombel->id);
        $module->update(['status' => 'published']);
        $this->assertTrue(Gate::forUser($student)->allows('view', $module));
        $rombel->students()->updateExistingPivot($student->id, ['left_at' => now()]);
        $this->assertFalse(Gate::forUser($student)->allows('view', $module));
    }

    public function test_dashboard_uses_real_counts_and_scopes_teacher_data(): void
    {
        $teacher = $this->account('guru');
        $other = $this->account('guru');
        $rombel = Rombel::create(['name' => 'Uji '.bin2hex(random_bytes(4)), 'grade' => 10, 'academic_year' => '2026/2027', 'semester' => 1]);
        $rombel->teachers()->attach($teacher->id);
        $this->actingAs($teacher)->get('/guru/dashboard')->assertViewHas('stats', fn ($stats) => $stats['Rombel diampu'] === 1);
        $this->actingAs($other)->get('/guru/dashboard')->assertViewHas('stats', fn ($stats) => $stats['Rombel diampu'] === 0);
    }

    public function test_logout_route_rejects_get(): void
    {
        $this->actingAs($this->account())->get('/logout')->assertStatus(405);
    }

    public function test_https_headers_from_npm_are_trusted(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '172.16.10.5'])
            ->withHeaders(['X-Forwarded-Proto' => 'https', 'X-Forwarded-Port' => '443'])
            ->get('http://learning.tkjwikrama.my.id/login')
            ->assertOk()
            ->assertSee('https://learning.tkjwikrama.my.id/assets/bootstrap.min.css', false);
    }

    public function test_https_headers_from_other_addresses_are_ignored(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '172.16.10.99'])
            ->withHeaders(['X-Forwarded-Proto' => 'https', 'X-Forwarded-Port' => '443'])
            ->get('http://learning.tkjwikrama.my.id/login')
            ->assertOk()
            ->assertSee('http://learning.tkjwikrama.my.id/assets/bootstrap.min.css', false);
    }
}
