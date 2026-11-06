<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use DatabaseTransactions;
    private function person(string $role='siswa'): User
    {
        return User::create(['name'=>'Nama Akun Uji','username'=>'profile_'.bin2hex(random_bytes(5)),'password'=>'PasswordUji2026!','role'=>$role,'is_active'=>true,'must_change_password'=>false]);
    }

    public function test_all_roles_get_one_account_menu_with_profile_password_and_post_logout(): void
    {
        foreach(['admin','guru','siswa'] as $role){
            $person=$this->person($role);
            $response=$this->actingAs($person)->get(route($person->dashboard()))->assertOk()->assertSee('id="accountMenu"',false)->assertSee('Edit profil')->assertSee('Ganti password');
            $this->assertSame(1,substr_count($response->getContent(),'id="accountMenu"'));
            $this->get(route('profile.edit'))->assertOk()->assertSee('Foto profil')->assertSee($person->username);
            $this->get(route('password.edit'))->assertOk()->assertSee('id="accountMenu"',false);
        }
    }

    public function test_profile_only_updates_own_allowed_fields_and_preserves_learning_records(): void
    {
        $person=$this->person();$other=$this->person('guru');$password=$person->password;
        $this->actingAs($person)->put(route('profile.update'),['name'=>'Nama Baru','email'=>'profile_'.bin2hex(random_bytes(4)).'@example.test','user_id'=>$other->id,'role'=>'admin','username'=>'takeover','is_active'=>false,'must_change_password'=>true,'nis'=>'999999'])->assertRedirect(route('profile.edit'));
        $saved=$person->fresh();$this->assertSame('Nama Baru',$saved->name);$this->assertSame('siswa',$saved->role);$this->assertSame($person->username,$saved->username);$this->assertSame($password,$saved->password);$this->assertTrue($saved->is_active);$this->assertFalse($saved->must_change_password);$this->assertNull($saved->nis);
        $this->assertSame('Nama Akun Uji',$other->fresh()->name);
    }

    public function test_duplicate_email_and_blank_name_do_not_change_profile(): void
    {
        $person=$this->person();$other=$this->person();$email='taken_'.bin2hex(random_bytes(4)).'@example.test';$other->forceFill(['email'=>$email])->save();
        $this->actingAs($person)->put(route('profile.update'),['name'=>'Nama Baru','email'=>$email])->assertSessionHasErrors('email');
        $this->put(route('profile.update'),['name'=>'   ','email'=>null])->assertSessionHasErrors('name');
        $this->assertSame('Nama Akun Uji',$person->fresh()->name);
    }

    public function test_photo_is_normalized_stored_privately_and_can_only_be_read_by_owner(): void
    {
        $person=$this->person();$other=$this->person();
        $this->actingAs($person)->put(route('profile.update'),['name'=>$person->name,'photo'=>UploadedFile::fake()->image('avatar.png',400,300)])->assertRedirect(route('profile.edit'));
        $saved=$person->fresh();$this->assertNotNull($saved->avatar_hash);
        $photo=DB::table('profile_photos')->where('user_id',$person->id)->first();$bytes=base64_decode($photo->image_base64,true);$dimensions=getimagesizefromstring($bytes);$this->assertSame(256,$dimensions[0]);$this->assertSame(256,$dimensions[1]);$this->assertSame('image/jpeg',$dimensions['mime']);
        $this->get(route('profile.photo'))->assertOk()->assertHeader('Content-Type','image/jpeg')->assertContent($bytes);
        $this->get(route('profile.photo'),['If-None-Match'=>'"'.$saved->avatar_hash.'"'])->assertStatus(304);
        $this->actingAs($other)->get(route('profile.photo',['user_id'=>$person->id]))->assertNotFound();
        $this->actingAs($person)->put(route('profile.update'),['name'=>$person->name,'remove_photo'=>1])->assertRedirect();$this->assertNull($person->fresh()->avatar_hash);$this->get(route('profile.photo'))->assertNotFound();
    }

    public function test_invalid_or_oversized_photo_is_rejected_without_changing_profile(): void
    {
        $person=$this->person();$this->actingAs($person);
        foreach([UploadedFile::fake()->create('avatar.svg',10,'image/svg+xml'),UploadedFile::fake()->create('script.php',1,'text/plain'),UploadedFile::fake()->image('large.jpg')->size(3000),UploadedFile::fake()->image('wide.png',2100,200)] as $file)$this->put(route('profile.update'),['name'=>$person->name,'photo'=>$file])->assertSessionHasErrors('photo');
        $this->assertSame(0,DB::table('profile_photos')->where('user_id',$person->id)->count());
    }

    public function test_guest_inactive_and_password_change_requirements_are_preserved(): void
    {
        $this->get(route('profile.edit'))->assertRedirect(route('login'));$this->get(route('profile.photo'))->assertRedirect(route('login'));
        $person=$this->person();$person->update(['must_change_password'=>true]);$this->actingAs($person)->get(route('profile.edit'))->assertRedirect(route('password.edit'));
        $person->update(['is_active'=>false]);$this->get(route('profile.edit'))->assertRedirect(route('login'));
    }
}
