$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$modules=Get-Content (Join-Path $root 'data/modules.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$atp=Get-Content (Join-Path $root 'data/atp-fase-f.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$byId=@{};foreach($m in $modules){$byId[$m.id]=$m}
foreach($plan in $atp.classes){
 $sum=($atp.elements | Where-Object classLevel -eq $plan.classLevel | Measure-Object jp -Sum).Sum
 if($sum -ne $plan.totalJP){throw "JP mismatch: $($plan.classLevel)"}
}
foreach($m in $modules | Where-Object phase -eq F){
 if($m.classLevel -notin @('XI','XII')){throw "Ambiguous class: $($m.id)"}
 if($m.curriculumRole -notin @('inti','pendukung','pengayaan')){throw "Unknown role: $($m.id)"}
 $element=$atp.elements | Where-Object {$_.classLevel -eq $m.classLevel -and $_.category -eq $m.category}
 if($m.curriculumRole -eq 'inti' -and !$element){throw "Core material outside ATP element: $($m.id)"}
 foreach($id in $m.prerequisites){if($m.classLevel -eq 'XI' -and $byId[$id].classLevel -eq 'XII'){throw "XI depends on XII: $($m.id) -> $id"}}
}
foreach($group in $modules | Where-Object phase -eq F | Group-Object classLevel,category){
 if(@($group.Group.order | Select-Object -Unique).Count -ne $group.Count){throw "Duplicate sequence in $($group.Name)"}
}
foreach($id in @('server-dmz','pengujian-keamanan','ids-hardening')){if($byId[$id].classLevel -ne 'XII' -or $byId[$id].curriculumRole -ne 'inti'){throw "Missing XII core: $id"}}
if($byId['switching-vlan'].classLevel -ne 'XI'){throw 'VLAN must be in XI'}
if(@($modules | Where-Object phase -eq E).Count -ne 16){throw 'Unexpected Phase E changes'}
& (Join-Path $PSScriptRoot 'validate-modules.ps1')
Write-Output 'PASS: ATP classes, five elements, JP totals, sequence, roles, and prerequisite class boundaries.'
