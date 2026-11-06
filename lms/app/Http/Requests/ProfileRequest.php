<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool{return $this->user()!==null;}
    public function rules(): array
    {
        return ['name'=>'required|string|max:150','email'=>['nullable','email','max:255',Rule::unique('users','email')->ignore($this->user()->id)],'photo'=>'nullable|image|mimes:jpg,jpeg,png,webp|max:2048|dimensions:max_width=2000,max_height=2000','remove_photo'=>'sometimes|boolean'];
    }
    public function attributes(): array{return ['name'=>'nama tampilan','email'=>'email','photo'=>'foto profil'];}
    public function messages(): array
    {
        return ['name.required'=>'Nama tampilan wajib diisi.','email.unique'=>'Email sudah digunakan akun lain.','photo.image'=>'Pilih foto JPG, PNG, atau WebP.','photo.mimes'=>'Pilih foto JPG, PNG, atau WebP.','photo.max'=>'Ukuran foto maksimal 2 MB.','photo.dimensions'=>'Dimensi foto maksimal 2.000 × 2.000 piksel.'];
    }
}
