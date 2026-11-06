<?php
namespace App\Services;

use App\Models\Module;
use App\Models\Rombel;

class PackageAssignments
{
    public function includePrerequisites(Rombel $class,array $moduleIds): array
    {
        $seen=[];$pending=array_map('intval',$moduleIds);
        while($pending){
            $id=array_pop($pending);if(isset($seen[$id]))continue;
            $module=Module::whereKey($id)->firstOrFail();
            if($module->status!=='published')throw \Illuminate\Validation\ValidationException::withMessages(['module_ids'=>'Terbitkan materi prasyarat terlebih dahulu: '.$module->title.'.']);
            $seen[$id]=true;
            foreach($module->prerequisites()->pluck('required_module_id') as $parent)$pending[]=(int)$parent;
        }
        foreach(array_keys($seen) as $id)Module::findOrFail($id)->rombels()->syncWithoutDetaching([$class->id]);
        return array_keys($seen);
    }
}
