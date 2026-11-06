<?php

namespace App\Http\Controllers\Learning;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\User;
use App\Models\Rombel;
use App\Services\LearningPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class PackageController extends Controller
{
    public function manage(Request $request, Module $module)
    {
        $this->authorizePackage($request, $module);
        abort_unless(in_array($request->user()->role, ['admin','guru'], true), 403);
        $rombels = $request->user()->role === 'admin' ? Rombel::where('is_active',true)->get() : $request->user()->teachingRombels()->where('is_active',true)->get();
        return view('learning.package-manage', compact('module','rombels'));
    }

    public function assign(Request $request, Module $module)
    {
        $this->authorizePackage($request, $module);
        abort_unless(in_array($request->user()->role, ['admin','guru'], true), 403);
        $input=$request->validate(['rombel_ids'=>'sometimes|array|max:100','rombel_ids.*'=>'integer|distinct|exists:rombels,id','status'=>'required|in:draft,published,unpublished']) + ['rombel_ids'=>[]];
        DB::transaction(function () use ($request,$module,$input) {
            $module=Module::whereKey($module->id)->lockForUpdate()->firstOrFail();
            $query=$request->user()->role==='admin'?Rombel::query():$request->user()->teachingRombels();
            $allowed=$query->where('is_active',true)->where('grade',$module->grade)->pluck('rombels.id')->all();
            abort_if(array_diff($input['rombel_ids'],$allowed),403);
            $ids=$input['rombel_ids'];
            if($request->user()->role==='guru') {
                abort_unless($input['status']===$module->status,403);
                $ids=array_values(array_unique(array_merge($ids,$module->rombels()->whereNotIn('rombels.id',$allowed)->pluck('rombels.id')->all())));
            }
            if($input['status']==='published'&&!$ids)throw ValidationException::withMessages(['rombel_ids'=>'Pilih minimal satu kelas untuk menerbitkan materi.']);
            $module->rombels()->sync($ids);
            if($request->user()->role==='admin')$module->update(['status'=>$input['status'],'published_at'=>$input['status']==='published'?($module->published_at??now()):$module->published_at]);
            if($module->status==='published')foreach(Rombel::whereIn('id',$ids)->get() as $class)app(\App\Services\PackageAssignments::class)->includePrerequisites($class,[$module->id]);
            app(\App\Services\AuditService::class)->record('module.updated',$request->user()->id,['module_id'=>$module->id,'status'=>$module->status]);
        });
        return back()->with('status','Penugasan materi tersimpan.');
    }

    private function authorizePackage(Request $request, Module $module): void
    {
        abort_unless($module->package_slug, 404);
        Gate::authorize($request->user()->role === 'siswa' ? 'view' : 'preview', $module);
    }

    public function launch(Request $request, Module $module, LearningPackage $packages)
    {
        $this->authorizePackage($request, $module);
        $entry = $packages->entry($module);
        $preview=$request->user()->role!=='siswa';$snapshot=$preview?null:$packages->snapshot($request->user(),$module);
        $config=['native'=>true,'learnerName'=>$request->user()->name,'user'=>$request->user()->id,'slug'=>$entry['id'],'module'=>$module->id,'version'=>$module->package_version,'key'=>$entry['key'],'stages'=>$entry['stages'],'preview'=>$preview,'revision'=>$snapshot?->revision??0,'data'=>$snapshot?json_decode($snapshot->data,true):new \stdClass,'sync'=>route('packages.sync',$module),'csrf'=>csrf_token(),'back'=>$preview?route('learning.modules.index'):route('student.modules.index')];
        $configJson=json_encode($config,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_THROW_ON_ERROR);
        $lesson=app(\App\Services\NativeLessonRenderer::class)->render($module,$entry,$config['back']);
        return response()->view('learning.package-lesson',compact('module','lesson','config','configJson'))->header('Cache-Control','private, no-store')->header('X-Frame-Options','SAMEORIGIN');
    }

    public function legacy(Request $request,Module $module)
    {
        $this->authorizePackage($request,$module);
        return redirect()->route('packages.launch',$module);
    }

    public function file(Request $request, Module $module, string $path, LearningPackage $packages)
    {
        $this->authorizePackage($request, $module);
        $entry = $packages->entry($module);
        abort_if(str_contains($path,'\\')||str_contains($path,"\0")||array_intersect(explode('/',$path),['','..','.']),404);
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $types = ['js'=>'text/javascript', 'css'=>'text/css', 'json'=>'application/json', 'svg'=>'image/svg+xml', 'png'=>'image/png', 'jpg'=>'image/jpeg', 'webp'=>'image/webp', 'woff2'=>'font/woff2', 'html'=>'text/html'];
        abort_unless(isset($types[$extension]), 404);
        abort_unless(str_starts_with($path, 'assets/') || str_starts_with($path, 'data/') || $path === $entry['path'].'index.html', 404);
        $bytes=$packages->asset($entry,$path);
        if($path==='assets/js/foundation-check.js'){
            $bytes='import { selectFinalQuestions } from '.json_encode(asset('assets/assessment-coverage.js')).';'."\n".$bytes;
            $bytes=str_replace('bank.slice(0,10)','selectFinalQuestions(course.chapters,10)',$bytes);
        }
        if($extension==='html')return redirect()->route('packages.launch',$module);
        if($extension==='css'&&$path!=='assets/css/tjkt-certificate.css')$bytes=app(\App\Services\ScopedLessonStyles::class)->scope($bytes);
        if ($extension !== 'html') return response($bytes,200,['Content-Type'=>$types[$extension], 'Cache-Control'=>'private, no-cache', 'X-Content-Type-Options'=>'nosniff']);
    }

    public function sync(Request $request, Module $module, LearningPackage $packages)
    {
        abort_unless($request->user()->role === 'siswa', 403);
        $this->authorizePackage($request, $module);
        $input = $request->validate(['owner'=>'required|integer', 'revision'=>'required|integer|min:0', 'version'=>'required|string|max:64', 'source'=>'required|in:browser,legacy-import', 'data'=>'present|array|max:80', 'data.*'=>'string|max:200000']);
        abort_unless($input['owner'] === $request->user()->id, 403);
        abort_unless($input['version'] === $module->package_version, 409, 'Versi materi berubah. Hubungi guru sebelum melanjutkan.');
        $entry = $packages->entry($module);
        if (strlen(json_encode($input['data'])) > 800000) throw ValidationException::withMessages(['data'=>'Catatan terlalu besar. Ekspor salinan dan hubungi guru.']);
        foreach ($input['data'] as $key=>$value) {
            if (!$packages->acceptsKey($entry, $key)) throw ValidationException::withMessages(['data'=>'Kunci data tidak sesuai modul.']);
            try { json_decode($value, true, 512, JSON_THROW_ON_ERROR); } catch (\Throwable) { throw ValidationException::withMessages(['data'=>'Format catatan tidak valid.']); }
        }
        return DB::transaction(function () use ($request, $module, $packages, $input) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $current = $packages->snapshot($request->user(), $module);
            if (($current?->revision ?? 0) !== $input['revision']) {
                // A lost response can cause the same upload to be retried.
                if ($current && json_decode($current->data,true) == $input['data']) {
                    $progress=$packages->recalculate($request->user(),$module);
                    return response()->json(['revision'=>$current->revision,'percent'=>$progress->completion_percent,'complete'=>$progress->status==='completed']);
                }
                return response()->json(['message'=>'Data berubah di perangkat lain. Unduh cadangan lokal lalu muat ulang untuk mengambil data server.'], 409);
            }
            $revision = ($current?->revision ?? 0)+1;
            DB::table('package_snapshots')->updateOrInsert(['user_id'=>$request->user()->id,'module_id'=>$module->id,'version'=>$module->package_version], ['data'=>json_encode($input['data']), 'revision'=>$revision, 'source'=>$current?->source === 'legacy-import' ? 'legacy-import' : $input['source'], 'created_at'=>$current?->created_at ?? now(), 'updated_at'=>now()]);
            $progress = $packages->recalculate($request->user(), $module, true);
            if (!$current || $current->data !== json_encode($input['data'])) {
                app(\App\Services\ProgressService::class)->event($request->user(), $module, 'package.synced', ['completed_items'=>$progress->completed_items, 'reported_by_client'=>true]);
            }
            return response()->json(['revision'=>$revision, 'percent'=>$progress->completion_percent, 'complete'=>$progress->status==='completed']);
        });
    }
}
