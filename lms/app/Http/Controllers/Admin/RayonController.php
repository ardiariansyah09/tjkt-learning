<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rayon;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RayonController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate(['q' => 'nullable|string|max:50', 'status' => 'nullable|in:0,1', 'page' => 'nullable|integer|min:1|max:100000']);
        $query = Rayon::withCount('students')->ordered();
        if ($request->filled('q')) {
            $query->where('name', 'like', '%'.addcslashes($data['q'], '%_\\').'%');
        }
        if ($request->filled('status')) {
            $query->where('is_active', $data['status']);
        }
        $rayons = $query->paginate(40)->withQueryString();

        return view('admin.rayons.index', compact('rayons'));
    }

    private function data(Request $request, ?Rayon $rayon = null): array
    {
        if (is_string($request->input('name'))) {
            $request->merge(['name' => preg_replace('/\s+/u', ' ', trim($request->input('name')))]);
        }

        return $request->validate(['name' => ['required', 'string', 'max:50', Rule::unique('rayons', 'name')->ignore($rayon?->id)], 'is_active' => 'required|boolean']);
    }

    public function create()
    {
        return view('admin.rayons.form', ['rayon' => new Rayon(['is_active' => true])]);
    }

    public function store(Request $request)
    {
        $data = $this->data($request);
        DB::transaction(function () use ($data) {
            $rayon = Rayon::create($data);
            app(AuditService::class)->record('rayon.created', auth()->id(), ['rayon_id' => $rayon->id]);
        });

        return redirect()->route('admin.rayons.index')->with('status', 'Rayon berhasil ditambahkan.');
    }

    public function edit(Rayon $rayon)
    {
        return view('admin.rayons.form', compact('rayon'));
    }

    public function update(Request $request, Rayon $rayon)
    {
        $data = $this->data($request, $rayon);
        DB::transaction(function () use ($data, $rayon) {
            $rayon = Rayon::whereKey($rayon->id)->lockForUpdate()->firstOrFail();
            $rayon->update($data);
            // Keep the previous text field compatible with earlier import/export scripts.
            User::withTrashed()->where('rayon_id', $rayon->id)->update(['rayon' => $rayon->name]);
            app(AuditService::class)->record('rayon.updated', auth()->id(), ['rayon_id' => $rayon->id]);
        }, 3);

        return redirect()->route('admin.rayons.index')->with('status', 'Rayon diperbarui. Data siswa tetap terhubung.');
    }

    public function destroy(Rayon $rayon)
    {
        DB::transaction(function () use ($rayon) {
            $rayon = Rayon::whereKey($rayon->id)->lockForUpdate()->firstOrFail();
            if (User::withTrashed()->where('rayon_id', $rayon->id)->exists()) {
                throw ValidationException::withMessages(['rayon' => 'Rayon masih digunakan siswa. Pindahkan siswa terlebih dahulu atau nonaktifkan rayon.']);
            }
            $rayon->update(['is_active' => false]);
            $rayon->delete();
            app(AuditService::class)->record('rayon.archived', auth()->id(), ['rayon_id' => $rayon->id]);
        });

        return redirect()->route('admin.rayons.index')->with('status','Rayon diarsipkan.');
    }
}
