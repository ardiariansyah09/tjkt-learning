const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'../lms');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
let layout=read('resources/views/layouts/app.blade.php');
if(layout.includes("layouts._account-menu"))throw Error('Account menu is already prepared.');
const begin=layout.indexOf('<div class="text-end"><strong class="d-block small">{{ auth()->user()->name }}');
const end=layout.indexOf('</form></div></header>',begin);
if(begin<0||end<0)throw Error('Header account block not found.');
layout=layout.slice(0,begin)+"@include('layouts._account-menu')"+layout.slice(end+'</form>'.length);
layout=layout.replace("@stack('head')",`<link href="{{ asset('assets/account.css') }}?v={{ filemtime(public_path('assets/account.css')) }}" rel="stylesheet">@stack('head')`);
write('resources/views/layouts/app.blade.php',layout);
let routes=read('routes/web.php');routes+=`
Route::middleware(['auth','active'])->group(function () {
 Route::get('profil/foto',[\\App\\Http\\Controllers\\ProfileController::class,'photo'])->name('profile.photo');
 Route::middleware('password.changed')->group(function () {
  Route::get('profil',[\\App\\Http\\Controllers\\ProfileController::class,'edit'])->name('profile.edit');
  Route::put('profil',[\\App\\Http\\Controllers\\ProfileController::class,'update'])->middleware('throttle:10,1')->name('profile.update');
 });
});
`;write('routes/web.php',routes);
let password=read('resources/views/auth/password.blade.php');
password=password.replace("@extends('layouts.guest')","@extends(auth()->user()->must_change_password?'layouts.guest':'layouts.app')");
password=password.replace("@section('content')",`@section('content')
@unless(auth()->user()->must_change_password)<div class="profile-page card p-4"><a href="{{ route('profile.edit') }}" class="mb-3">← Profil saya</a>@endunless`);
password=password.replace('<form method="POST" action="{{ route(\'logout\') }}"',"@if(auth()->user()->must_change_password)<form method=\"POST\" action=\"{{ route('logout') }}\"");
password=password.replace('@endsection',"@endif @unless(auth()->user()->must_change_password)</div>@endunless\n@endsection");
write('resources/views/auth/password.blade.php',password);
console.log('Account controls moved into a single menu; profile routes and password layout prepared.');
