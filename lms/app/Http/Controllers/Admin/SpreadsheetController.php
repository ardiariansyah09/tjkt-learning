<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SpreadsheetRequest;
use App\Models\ExportJob;
use App\Models\ImportRecord;
use App\Models\Rombel;
use App\Models\User;
use App\Services\AuditService;
use App\Services\MasterImportService;
use App\Services\XlsxService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class SpreadsheetController extends Controller
{
    public function form(string $resource)
    {
        Gate::authorize('viewAny', User::class);
        $imports = ImportRecord::where('user_id', auth()->id())->where('resource', $resource)->latest()->paginate(10);
        $rombels = Rombel::where('is_active', true)->orderBy('name')->get();

        return view('admin.imports.form', compact('resource', 'imports', 'rombels'));
    }

    public function template(string $resource, XlsxService $xlsx)
    {
        Gate::authorize('create', User::class);
        $path = $xlsx->write(MasterImportService::HEADERS[$resource], []);

        return response()->download($path, 'template-'.$resource.'.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Cache-Control' => 'private, no-store'])->deleteFileAfterSend(true);
    }

    public function store(SpreadsheetRequest $request, string $resource, MasterImportService $importer)
    {
        Gate::authorize('create', User::class);
        $record = $importer->run($resource, $request->file('file')->getRealPath(), $request->file('file')->getClientOriginalName());

        return redirect()->route('admin.imports.show', $record)->with('status', 'Impor selesai. Periksa rekap dan alasan pada setiap baris yang bermasalah.');
    }

    public function show(ImportRecord $import)
    {
        Gate::authorize('viewAny', User::class);
        abort_unless($import->user_id === auth()->id(), 403);

        return view('admin.imports.show', compact('import'));
    }

    public function exportPeople(Request $request, string $kind, PersonController $people, XlsxService $xlsx, AuditService $audit)
    {
        Gate::authorize('viewAny', User::class);
        $query = $people->query($request, $kind);
        if ((clone $query)->count() > 10000) {
            throw ValidationException::withMessages(['export' => 'Maksimal 10.000 akun per ekspor. Persempit filter terlebih dahulu.']);
        }
        $users = $query->get();
        $rows = $users->map(fn ($u) => $kind === 'siswa' ? [$u->nis, $u->name, $u->username, $u->rayonMaster?->name, $u->rombels->first()?->id, $u->rombels->first()?->name, $u->rombels->first()?->academic_year, $u->rombels->first()?->semester, $u->is_active ? 'aktif' : 'nonaktif', $u->created_at->format('Y-m-d H:i:s')] : [$u->name, $u->username, $u->email, $u->teachingRombels->map(fn ($r) => $r->name.' ('.$r->academic_year.', '.$r->semester.')')->join('; '), $u->is_active ? 'aktif' : 'nonaktif', $u->created_at->format('Y-m-d H:i:s')]);
        $headers = $kind === 'siswa' ? ['nis', 'nama', 'username', 'rayon', 'rombel_id', 'rombel', 'tahun_ajaran', 'semester', 'status', 'dibuat_pada'] : ['nama', 'username', 'email', 'rombel_diampu', 'status', 'dibuat_pada'];
        $path = $xlsx->write($headers, $rows);
        ExportJob::create(['user_id' => auth()->id(), 'resource' => $kind, 'row_count' => $users->count()]);
        $audit->record('export.generated', auth()->id(), ['resource' => $kind, 'rows' => $users->count()]);

        return response()->download($path, $kind.'-'.now()->format('Ymd-His').'.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Cache-Control' => 'private, no-store'])->deleteFileAfterSend(true);
    }

    public function exportRombels(Request $request, RombelController $controller, XlsxService $xlsx, AuditService $audit)
    {
        Gate::authorize('viewAny', Rombel::class);
        $query = $controller->query($request);
        if ((clone $query)->count() > 10000) {
            throw ValidationException::withMessages(['export' => 'Maksimal 10.000 rombel per ekspor. Persempit filter.']);
        }
        $rombels = $query->get();
        $path = $xlsx->write(['id', 'nama', 'tingkat', 'tahun_ajaran', 'semester', 'status', 'jumlah_siswa', 'guru'], $rombels->map(fn ($r) => [$r->id, $r->name, $r->grade, $r->academic_year, $r->semester, $r->is_active ? 'aktif' : 'nonaktif', $r->students_count, $r->teachers->pluck('name')->join('; ')]));
        ExportJob::create(['user_id' => auth()->id(), 'resource' => 'rombel', 'row_count' => $rombels->count()]);
        $audit->record('export.generated', auth()->id(), ['resource' => 'rombel', 'rows' => $rombels->count()]);

        return response()->download($path, 'rombel-'.now()->format('Ymd-His').'.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Cache-Control' => 'private, no-store'])->deleteFileAfterSend(true);
    }
}
