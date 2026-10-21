$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$modules=Get-Content (Join-Path $root 'data/modules.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$ids=@{}
foreach($module in $modules){
 if($ids.ContainsKey($module.id)){throw "Duplicate module ID: $($module.id)"}
 $ids[$module.id]=$module
}
function Visit($id,$trail){
 if($trail -contains $id){throw "Prerequisite cycle: $id"}
 foreach($prerequisite in $ids[$id].prerequisites){
  if(!$ids.ContainsKey($prerequisite)){throw "Unknown prerequisite: $prerequisite"}
  Visit $prerequisite ($trail+@($id))
 }
}
foreach($module in $modules){Visit $module.id @()}
$required=@('module-topbar','module-brand','topbar-actions','lesson-sidebar','sidebar-heading','progress-widget','progress-label','progress-track','lesson-nav','sidebar-tip','stage9-reset','lesson-main','breadcrumbs','lesson-hero','lesson-kicker','lesson-content','gate-message','lesson-actions','lesson-forward-actions','save-note')
$pageCount=0
foreach($module in $modules | Where-Object status -eq 'published'){
 $file=Join-Path $root ($module.path+'index.html')
 if(!(Test-Path -LiteralPath $file)){throw "Missing page: $file"}
 $html=Get-Content -LiteralPath $file -Raw -Encoding UTF8
 foreach($class in $required){if($html -notmatch ('class="[^"]*\b'+$class+'\b')){throw "Missing $class in $($module.id)"}}
 if($html -notmatch 'data-standard-shell="1"'){throw "Nonstandard module: $($module.id)"}
 $styles=@([regex]::Matches($html,'<link[^>]*href="([^"]+)"') | ForEach-Object {$_.Groups[1].Value})
 if($styles[-1] -notmatch '/module-standard.css'){throw "Shared styles must load last: $($module.id)"}
 foreach($reference in [regex]::Matches($html,'(?:href|src)="([^"#]+)(?:#[^"]*)?"')){
  $url=$reference.Groups[1].Value
  if($url -match '^(https?:|data:|mailto:)'){continue}
  $path=($url -split '[?#]')[0]
  if(!(Test-Path -LiteralPath (Join-Path (Split-Path $file -Parent) $path))){throw "Broken asset/link: $($module.id) $url"}
 }
 $pageCount++
}
foreach($file in Get-ChildItem (Join-Path $root 'assets/js') -Filter '*.js'){
 $source=Get-Content $file.FullName -Raw -Encoding UTF8
 foreach($reference in [regex]::Matches($source,'(?:from\s*|import\s*\()[''"" ](\./[^''"" ]+)')){
  $path=($reference.Groups[1].Value -split '\?')[0]
  if(!(Test-Path -LiteralPath (Join-Path $file.DirectoryName $path))){throw "Broken JS import: $($file.Name) $path"}
 }
}
Write-Output "PASS: $pageCount published module shells, local assets/imports, and prerequisite graph."
