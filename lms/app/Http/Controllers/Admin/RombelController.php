<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RombelRequest;
use App\Models\Rombel;
use App\Models\User;
use App\Services\MasterDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class RombelController extends Controller
{
    public function __construct(private MasterDataService $master) {}

    public function query(Request $request)
    {
        $data = $request->validate(['q' => 'nullable|string|max:100', 'academic_year' => 'nullable|string|max:9', 'semester' => 'nullable|in:1,2', 'status' => 'nullable|in:0,1', 'page' => 'nullable|integer|min:1|max:100000']);
        $query = Rombel::query()->with('teachers')->withCount(['students' => fn ($q) => $q->whereNull('rombel_students.left_at')]);
        if ($request->filled('q')) {
            $query->where('name', 'like', '%'.addcslashes($data['q'], '%_\\').'%');
        }
        foreach (['academic_year', 'semester'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $data[$field]);
            }
        }
        if ($request->filled('status')) {
            $query->where('is_active', $data['status']);
        }

        return $query->orderByDesc('academic_year')->orderByDesc('semester')->orderBy('name');
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Rombel::class);
        $rombels = $this->query($request)->paginate(15)->withQueryString();
        $years = Rombel::distinct()->orderByDesc('academic_year')->pluck('academic_year');

        return view('admin.rombels.index', compact('rombels', 'years'));
    }

    public function create()
    {
        Gate::authorize('create', Rombel::class);
        $rombel = new Rombel(['is_active' => true, 'semester' => 1, 'grade' => 10]);
        $teachers = User::where('role', 'guru')->orderBy('name')->get();

        return view('admin.rombels.form', compact('rombel', 'teachers'));
    }

    public function store(RombelRequest $request)
    {
        Gate::authorize('create', Rombel::class);
        $rombel = $this->master->saveRombel($request->validated());

        return redirect()->route('admin.rombels.show', $rombel)->with('status', 'Rombel berhasil dibuat.');
    }

    public function show(Request $request, Rombel $rombel)
    {
        Gate::authorize('view', $rombel);
        $filters = $request->validate(['q' => 'nullable|string|max:100', 'members' => 'nullable|in:current,history', 'page' => 'nullable|integer|min:1|max:100000']);
        $rombel->load('teachers');
        $query = $rombel->memberships()->with('user');
        if (($filters['members'] ?? 'current') === 'current') {
            $query->whereNull('left_at');
        }
        if ($request->filled('q')) {
            $query->whereHas('user', fn ($q) => $q->where(fn ($q) => $q->where('name', 'like', '%'.addcslashes($filters['q'], '%_\\').'%')->orWhere('nis', 'like', '%'.addcslashes($filters['q'], '%_\\').'%')));
        }
        $memberships = $query->orderByDesc('joined_at')->paginate(15)->withQueryString();

        return view('admin.rombels.show', compact('rombel', 'memberships'));
    }

    public function edit(Rombel $rombel)
    {
        Gate::authorize('update', $rombel);
        $rombel->load('teachers');
        $teachers = User::where('role', 'guru')->orderBy('name')->get();

        return view('admin.rombels.form', compact('rombel', 'teachers'));
    }

    public function update(RombelRequest $request, Rombel $rombel)
    {
        Gate::authorize('update', $rombel);
        $this->master->saveRombel($request->validated(), $rombel);

        return redirect()->route('admin.rombels.show', $rombel)->with('status', 'Rombel dan penugasan guru berhasil diperbarui.');
    }

    public function destroy(Rombel $rombel)
    {
        Gate::authorize('delete', $rombel);
        $this->master->archiveRombel($rombel);

        return redirect()->route('admin.rombels.index')->with('status', 'Rombel diarsipkan. Histori keanggotaan tetap disimpan.');
    }
}
