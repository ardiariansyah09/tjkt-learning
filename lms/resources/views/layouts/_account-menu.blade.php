@php($account=auth()->user())
<div class="dropdown account-menu">
<button class="btn account-trigger dropdown-toggle" id="accountMenu" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Buka menu akun">
<span class="account-name-block"><strong>{{ $account->name }}</strong><small>{{ ucfirst($account->role) }}</small></span>
@if($account->avatar_hash)<img class="account-avatar" src="{{ route('profile.photo',['v'=>$account->avatar_hash]) }}" alt="Foto profil">@else<span class="avatar account-avatar" aria-hidden="true">{{ mb_substr($account->name,0,1) }}</span>@endif
</button>
<div class="dropdown-menu dropdown-menu-end account-dropdown" aria-labelledby="accountMenu">
<div class="px-3 py-2"><strong class="d-block account-full-name">{{ $account->name }}</strong><small class="text-secondary">{{ ucfirst($account->role) }}</small></div><hr class="dropdown-divider">
<a class="dropdown-item" href="{{ route('profile.edit') }}"><i class="bi bi-person-circle me-2" aria-hidden="true"></i>Edit profil</a>
<a class="dropdown-item" href="{{ route('password.edit') }}"><i class="bi bi-key me-2" aria-hidden="true"></i>Ganti password</a><hr class="dropdown-divider">
<form method="POST" action="{{ route('logout') }}">@csrf<button class="dropdown-item text-danger" type="submit"><i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>Keluar</button></form>
</div></div>
