<?php
namespace App\Http\Controllers;

use App\Http\Requests\ProfileRequest;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function edit(Request $request){return view('profile.edit',['person'=>$request->user()]);}

    public function update(ProfileRequest $request,AuditService $audit)
    {
        if($request->boolean('remove_photo')&&$request->hasFile('photo'))throw ValidationException::withMessages(['photo'=>'Pilih mengganti foto atau menghapus foto, kemudian simpan.']);
        $image=null;
        if($request->hasFile('photo')){
            $source=@imagecreatefromstring($request->file('photo')->get());
            if(!$source)throw ValidationException::withMessages(['photo'=>'Foto belum dapat dibaca. Pilih gambar lain.']);
            $side=min(imagesx($source),imagesy($source));$target=imagecreatetruecolor(256,256);imagefill($target,0,0,imagecolorallocate($target,255,255,255));
            imagecopyresampled($target,$source,0,0,(int)((imagesx($source)-$side)/2),(int)((imagesy($source)-$side)/2),256,256,$side,$side);
            ob_start();imagejpeg($target,null,90);$image=ob_get_clean();imagedestroy($source);imagedestroy($target);
            if(!$image)throw ValidationException::withMessages(['photo'=>'Foto belum dapat disimpan.']);
        }
        DB::transaction(function()use($request,$image,$audit){
            $person=User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $name=trim(preg_replace('/\s+/u',' ',$request->validated('name')));$email=$request->validated('email')?:null;
            if($name==='')throw ValidationException::withMessages(['name'=>'Nama tampilan wajib diisi.']);
            $fields=['name'=>$name,'email'=>$email];if($email!==$person->email)$fields['email_verified_at']=null;
            if($image!==null){$hash=hash('sha256',$image);DB::table('profile_photos')->updateOrInsert(['user_id'=>$person->id],['image_base64'=>base64_encode($image),'sha256'=>$hash,'created_at'=>now(),'updated_at'=>now()]);$fields['avatar_hash']=$hash;}
            elseif($request->boolean('remove_photo')){DB::table('profile_photos')->where('user_id',$person->id)->delete();$fields['avatar_hash']=null;}
            $person->forceFill($fields)->save();
            $audit->record('profile.updated',$person->id,['fields'=>array_keys($fields),'photo_changed'=>$image!==null||$request->boolean('remove_photo')]);
        });
        return redirect()->route('profile.edit')->with('status','Profil berhasil diperbarui.');
    }

    public function photo(Request $request)
    {
        $photo=DB::table('profile_photos')->where('user_id',$request->user()->id)->first();abort_unless($photo,404);
        $bytes=base64_decode($photo->image_base64,true);abort_unless($bytes!==false&&hash('sha256',$bytes)===$photo->sha256,404);
        $response=response($bytes,200,['Content-Type'=>'image/jpeg','Cache-Control'=>'private, no-cache','X-Content-Type-Options'=>'nosniff','Content-Disposition'=>'inline']);
        $response->setEtag($photo->sha256);$response->isNotModified($request);return $response;
    }
}
