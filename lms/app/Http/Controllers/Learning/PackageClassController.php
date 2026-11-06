<?php

namespace App\Http\Controllers\Learning;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Rombel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PackageClassController extends Controller
{
    private function classes(Request $request)
    {
        return ($request->user()->role==='admin'?Rombel::query():$request->user()->teachingRombels())->where('is_active',true)->orderBy('name');
    }

    private function modules(Request $request, Rombel $rombel)
    {
        $query=Module::whereNotNull('package_slug')->where('grade',$rombel->grade)->where('status','!=','archived');
        if($request->user()->role!=='admin')$query->where('status','published');
        return $query->orderBy('sort_order')->get();
    }

    public function index(Request $request)
    {
        $request->validate(['rombel_id'=>'nullable|integer']);
        $rombels=$this->classes($request)->get();
        $rombel=$request->filled('rombel_id')?$rombels->firstWhere('id',(int)$request->rombel_id):$rombels->first();
        abort_if($request->filled('rombel_id')&&!$rombel,403);
        $modules=$rombel?$this->modules($request,$rombel):collect();
        return view('learning.package-class',compact('rombels','rombel','modules'));
    }

    public function store(Request $request)
    {
        $input=$request->validate(['rombel_id'=>'required|integer','module_ids'=>'sometimes|array|max:100','module_ids.*'=>'integer|distinct'])+['module_ids'=>[]];
        $rombel=$this->classes($request)->where('rombels.id',$input['rombel_id'])->firstOrFail();
        $modules=$this->modules($request,$rombel);
        abort_if(array_diff($input['module_ids'],$modules->modelKeys()),403);
        $selected=array_map('intval',$input['module_ids']);
        foreach($modules->whereIn('id',$selected) as $module){
            $missing=$module->prerequisites()->whereHas('requiredModule',fn($q)=>$q->where('grade',$rombel->grade))->whereNotIn('required_module_id',$selected)->with('requiredModule')->first();
            if($missing)throw ValidationException::withMessages(['module_ids'=>'Pilih juga materi prasyarat: '.$missing->requiredModule->title.'.']);
        }
        DB::transaction(function()use($request,$rombel,$modules,$selected){
            Rombel::whereKey($rombel->id)->lockForUpdate()->firstOrFail();
            foreach($modules->sortBy('id') as $original){
                $module=Module::whereKey($original->id)->lockForUpdate()->firstOrFail();
                if(in_array($module->id,$selected,true)){
                    $module->rombels()->syncWithoutDetaching([$rombel->id]);
                    if($request->user()->role==='admin')$module->update(['status'=>'published','published_at'=>$module->published_at??now()]);
                }else $module->rombels()->detach($rombel->id);
            }
            app(\App\Services\PackageAssignments::class)->includePrerequisites($rombel,$selected);
            app(\App\Services\AuditService::class)->record('module.assignments_changed',$request->user()->id,['rombel_id'=>$rombel->id,'module_ids'=>$selected]);
        });
        return back()->with('status','Materi kelas tersimpan. Hasil belajar yang sudah ada tetap disimpan.');
    }
}
