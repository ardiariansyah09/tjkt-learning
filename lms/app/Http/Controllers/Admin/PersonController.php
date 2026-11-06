<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PersonRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\Rayon;
use App\Models\Rombel;
use App\Models\User;
use App\Services\AuditService;
use App\Services\MasterDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class PersonController extends Controller
{
    public function __construct(private MasterDataService $master) {}

    private function subject(string $kind, User $person): void
    {
        abort_unless($person->role === $kind, 404);
        Gate::authorize('update', $person);
    }

    public function query(Request $request, string $kind)
    {
        $filters = $request->validate(['q' => 'nullable|string|max:100', 'rombel_id' => 'nullable|integer|min:1', 'rayon_id' => 'nullable|integer|min:1', 'status' => 'nullable|in:0,1', 'page' => 'nullable|integer|min:1|max:100000']);
        $query = User::where('role', $kind);
        if ($request->filled('q')) {
            $text = '%'.addcslashes($filters['q'], '%_\\').'%';
            $query->where(fn ($q) => $q->where('name', 'like', $text)->orWhere('username', 'like', $text)->orWhere('nis', 'like', $text));
        }
        if ($request->filled('status')) {
            $query->where('is_active', $filters['status']);
        }
        if ($request->filled('rombel_id')) {
            $query->whereHas($kind === 'siswa' ? 'rombels' : 'teachingRombels', function ($q) use ($kind, $filters) {
                $q->where('rombels.id', $filters['rombel_id']);
                if ($kind === 'siswa') {
                    $q->whereNull('rombel_students.left_at');
                }
            });
        }

        if ($kind === 'siswa' && $request->filled('rayon_id')) {
            $query->where('rayon_id', $filters['rayon_id']);
        }

        return $query->with(['rayonMaster', 'rombels' => fn ($q) => $q->whereNull('rombel_students.left_at'), 'teachingRombels'])->orderBy('name')->orderBy('id');
    }

    public function index(Request $request, string $kind)
    {
        Gate::authorize('viewAny', User::class);
        $people = $this->query($request, $kind)->paginate(15)->withQueryString();
        $rombels = Rombel::orderByDesc('academic_year')->orderBy('name')->get();

        $rayons = Rayon::ordered()->get();

        return view('admin.people.index', compact('kind', 'people', 'rombels', 'rayons'));
    }

    public function create(Request $request, string $kind)
    {
        Gate::authorize('create', User::class);
        $person = new User(['is_active' => true]);
        $rombels = Rombel::orderByDesc('academic_year')->orderBy('name')->get();
        $history = null;

        $rayons = Rayon::where(fn ($q) => $q->where('is_active', true)->orWhere('id', $person->rayon_id))->ordered()->get();

        return view('admin.people.form', compact('kind', 'person', 'rombels', 'history', 'rayons'));
    }

    public function store(PersonRequest $request, string $kind)
    {
        Gate::authorize('create', User::class);
        $person = $this->master->savePerson($kind, $request->validated());

        return redirect()->route('admin.people.edit', [$kind, $person])->with('status', 'Akun berhasil dibuat. Pengguna wajib mengganti password awal saat login.');
    }

    public function edit(Request $request, string $kind, User $person)
    {
        $this->subject($kind, $person);
        $person->load(['rombels' => fn ($q) => $q->whereNull('rombel_students.left_at'), 'teachingRombels']);
        $rombels = Rombel::orderByDesc('academic_year')->orderBy('name')->get();
        $history = $kind === 'siswa' ? $person->memberships()->with('rombel')->orderByDesc('joined_at')->paginate(10) : null;

        $rayons = Rayon::where(fn ($q) => $q->where('is_active', true)->orWhere('id', $person->rayon_id))->ordered()->get();

        return view('admin.people.form', compact('kind', 'person', 'rombels', 'history', 'rayons'));
    }

    public function update(PersonRequest $request, string $kind, User $person)
    {
        $this->subject($kind, $person);
        $this->master->savePerson($kind, $request->validated(), $person);

        return back()->with('status', 'Data akun dan penugasan berhasil diperbarui.');
    }

    public function status(Request $request, string $kind, User $person, AuditService $audit)
    {
        $this->subject($kind, $person);
        $data = $request->validate(['is_active' => 'required|boolean']);
        DB::transaction(function () use ($person, $data, $audit) {
            $person = User::whereKey($person->id)->lockForUpdate()->firstOrFail();
            $person->update($data);
            if (! $person->is_active) {
                $this->master->revokeSessions($person);
            }
            $audit->record('person.status_changed', auth()->id(), ['subject_id' => $person->id, 'is_active' => $person->is_active]);
        });

        return back()->with('status', 'Status akun berhasil diperbarui.');
    }

    public function resetForm(Request $request, string $kind, User $person)
    {
        $this->subject($kind, $person);

        return view('admin.people.reset', compact('kind', 'person'));
    }

    public function reset(ResetPasswordRequest $request, string $kind, User $person)
    {
        $this->subject($kind, $person);
        $this->master->resetPassword($person, $request->validated('password'));

        return redirect()->route('admin.people.edit', [$kind, $person])->with('status', 'Password direset dan seluruh sesi akun dicabut. Pengguna wajib mengganti password pada login berikutnya.');
    }

    public function destroy(Request $request, string $kind, User $person)
    {
        $this->subject($kind, $person);
        Gate::authorize('delete', $person);
        $this->master->archivePerson($person);

        return redirect()->route('admin.people.index', $kind)->with('status', 'Akun diarsipkan. Identitas dan histori tetap disimpan.');
    }
}
