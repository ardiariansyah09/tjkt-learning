param([int]$Port = 9337, [string[]]$OnlyModules = @())
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$profile=Join-Path ([IO.Path]::GetTempPath()) ('tjkt-module-qa-'+[guid]::NewGuid().ToString('N'))
$edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
$browser=Start-Process -FilePath $edge -ArgumentList @('--headless','--disable-gpu','--no-first-run','--no-default-browser-check',"--remote-debugging-port=$Port",('--user-data-dir="'+$profile+'"'),'about:blank') -WindowStyle Hidden -PassThru
$socket=$null
$script:requestId=0
$script:errors=New-Object System.Collections.Generic.List[string]
function Call-CDP($method,$parameters=@{}) {
 $script:requestId++
 $id=$script:requestId
 $payload=@{id=$id;method=$method;params=$parameters} | ConvertTo-Json -Depth 30 -Compress
 $bytes=[Text.Encoding]::UTF8.GetBytes($payload)
 $segment=New-Object 'ArraySegment[byte]' -ArgumentList @(,$bytes)
 $socket.SendAsync($segment,[Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
 while($true) {
  $stream=New-Object IO.MemoryStream
  do {
   $buffer=New-Object byte[] 262144
   $part=New-Object 'ArraySegment[byte]' -ArgumentList @(,$buffer)
   $received=$socket.ReceiveAsync($part,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
   $stream.Write($buffer,0,$received.Count)
  } while(!$received.EndOfMessage)
  $message=[Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
  $stream.Dispose()
  if($message.method -eq 'Runtime.exceptionThrown') {$script:errors.Add(($message.params.exceptionDetails | ConvertTo-Json -Depth 10 -Compress))}
  if($message.method -eq 'Log.entryAdded' -and $message.params.entry.level -eq 'error') {$script:errors.Add($message.params.entry.text)}
  if($message.id -eq $id) {
   if($message.error){throw ($message.error | ConvertTo-Json -Compress)}
   return $message.result
  }
 }
}
function Evaluate($expression) {
 $result=Call-CDP 'Runtime.evaluate' @{expression=$expression;returnByValue=$true;awaitPromise=$true}
 if($result.exceptionDetails){throw ($result.exceptionDetails | ConvertTo-Json -Compress -Depth 8)}
 return $result.result.value
}
function Navigate($url) {
 Call-CDP 'Page.navigate' @{url=$url} | Out-Null
 Evaluate 'new Promise((resolve,reject)=>{let n=0;const tick=()=>{if(document.readyState==="complete"&&document.querySelector(".lesson-nav button"))return setTimeout(()=>resolve(true),250);if(++n>100)return reject(new Error("Module did not initialize"));setTimeout(tick,100)};tick()})' | Out-Null
}
try {
 for($attempt=0;$attempt -lt 40;$attempt++) {
  try {$targets=Invoke-RestMethod "http://127.0.0.1:$Port/json/list";break} catch {Start-Sleep -Milliseconds 250}
 }
 $target=$targets | Where-Object type -eq 'page' | Select-Object -First 1
 if(!$target){throw 'Headless browser unavailable'}
 $socket=New-Object Net.WebSockets.ClientWebSocket
 $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
 Call-CDP 'Runtime.enable' | Out-Null
 Call-CDP 'Log.enable' | Out-Null
 Call-CDP 'Page.enable' | Out-Null
 $modules=Get-Content (Join-Path $root 'data/modules.json') -Raw -Encoding UTF8 | ConvertFrom-Json
 $results=@()
 $snapshot=@'
(()=>{
 const selectors=['.module-topbar','.module-brand','.back-button','.theme-button','.module-layout','.lesson-sidebar','.sidebar-heading h2','.progress-widget','.progress-track','.lesson-nav > button','.lesson-main','.breadcrumbs','.lesson-hero','.lesson-hero h1','.lesson-hero p','.lesson-content','.lesson-actions','.save-note'];
 const properties=['fontFamily','fontSize','lineHeight','paddingTop','paddingRight','paddingBottom','paddingLeft','borderRadius','backgroundColor','color'];
 const styles=Object.fromEntries(selectors.map(s=>{const e=document.querySelector(s);if(!e)throw Error('Missing '+s);const c=getComputedStyle(e);return[s,Object.fromEntries(properties.map(p=>[p,c[p]]))]}));
 const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
 const stage=document.querySelector('.lesson-nav button.active');
 return {styles,stageCount:document.querySelectorAll('.lesson-nav button').length,active:stage?.textContent,title:document.querySelector('.lesson-hero h1').textContent,duplicateIds:ids.filter((id,i)=>ids.indexOf(id)!==i),overflow:document.documentElement.scrollWidth>innerWidth,bodyDark:document.body.classList.contains('dark'),contentLength:document.querySelector('.lesson-content').textContent.trim().length};
})()
'@
 foreach($module in $modules | Where-Object { $_.status -eq 'published' -and (!$OnlyModules.Count -or $_.id -in $OnlyModules) }) {
  $script:errors.Clear()
  Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=1280;height=900;deviceScaleFactor=1;mobile=$false} | Out-Null
  Navigate ('http://localhost/tjkt-learning/'+$module.path)
  $desktop=Evaluate $snapshot
  if($module.id -in @('k3-budaya-kerja','pengenalan-jaringan','osi-tcpip')){
   $capture=Call-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
   [IO.File]::WriteAllBytes((Join-Path ([IO.Path]::GetTempPath()) ("tjkt-preview-$($module.id).png")),[Convert]::FromBase64String($capture.data))
  }
  if($desktop.duplicateIds.Count){throw "Duplicate IDs in $($module.id): $($desktop.duplicateIds -join ',')"}
  if($desktop.overflow){throw "Desktop overflow: $($module.id)"}
  if($desktop.contentLength -lt 50){throw "Empty content: $($module.id)"}
  $theme=Evaluate 'document.querySelector(".theme-button").click(); document.body.classList.contains("dark")'
  Evaluate 'new Promise(resolve=>setTimeout(()=>resolve(true),400))' | Out-Null
  $dark=Evaluate $snapshot
  Evaluate 'document.querySelector(".theme-button").click()' | Out-Null
  Evaluate 'new Promise(resolve=>setTimeout(()=>resolve(true),400))' | Out-Null
  Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=390;height=844;deviceScaleFactor=1;mobile=$true} | Out-Null
  $mobile=Evaluate $snapshot
  if($mobile.overflow){throw "Mobile overflow: $($module.id)"}
  $studioCheck=Evaluate 'import("/tjkt-learning/tools/studio-checks.js").then(async tests=>({core:tests.checkStudioCore(),ui:await tests.checkStudioUI()}))'
  $expanded=Evaluate $snapshot
  if($expanded.overflow){throw "Studio overflow: $($module.id)"}

  if(Test-Path (Join-Path $root ("data/$($module.id).json"))) {
   $answer=if($module.id -eq 'ipv6-dasar'){2}else{0}
   $grading='(()=>{const f=document.querySelector(".chapter-check-form");[...f.querySelectorAll("input")].find(input=>input.value===String(ANSWER)).checked=true;f.requestSubmit();if(document.getElementById("nextChapter").disabled)throw Error("Correct answer did not unlock");document.getElementById("nextChapter").click();return true})()'
   Evaluate ($grading.Replace('ANSWER',[string]$answer)) | Out-Null
   Navigate ('http://localhost/tjkt-learning/'+$module.path)
   Evaluate '(()=>{const b=[...document.querySelectorAll(".lesson-nav button")];if(!b[1].classList.contains("active"))throw Error("Progress did not persist");window.confirm=()=>true;document.getElementById("resetProgress").click();if(!document.getElementById("nextChapter").disabled)throw Error("Reset did not lock next stage");if(document.querySelector(".chapter-check-form input").disabled)throw Error("Reset left questions disabled");return true})()' | Out-Null
  }
  # Unlock only this disposable browser profile to inspect every existing stage.
  $source=Get-Content (Join-Path $root ($module.path+'index.html')) -Raw -Encoding UTF8
  $engine=if($module.id -eq 'ipv4-subnetting'){'module'}else{$module.id}
  $enginePath=Join-Path $root ("assets/js/$engine.js")
  if(Test-Path $enginePath){$source += Get-Content $enginePath -Raw -Encoding UTF8}
  $ids=@([regex]::Matches($source,"\bid\s*:\s*['"" ]([^'"" ]+)['""]") | ForEach-Object {$_.Groups[1].Value} | Select-Object -Unique)
  $foundationPath=Join-Path $root ("data/$($module.id).json")
  if(Test-Path $foundationPath){$ids=@((Get-Content $foundationPath -Raw -Encoding UTF8 | ConvertFrom-Json).chapters.id)}
  if($module.id -eq 'topologi-jaringan'){$ids=@(0..8 | ForEach-Object {"$_"})}
  if($module.id -eq 'perangkat-jaringan'){$ids+=@('selection','builder','fault')}
  $key=switch($module.id){
   'pengenalan-jaringan' {'tjkt:intro-network:v1'}
   'topologi-jaringan' {'tjkt:topology:v1'}
   'perangkat-jaringan' {'tjkt:perangkat-jaringan:progress:v1'}
   'ipv4-subnetting' {'tjkt:ipv4-subnetting:sequential:v2'}
   default {if(Test-Path $foundationPath){"tjkt:$($module.id):course:v2"}else{"tjkt:$($module.id):course:v1"}}
  }
  $idsJson=ConvertTo-Json -InputObject $ids -Compress
  Evaluate "(()=>{const ids=$idsJson;const passed=Object.fromEntries(ids.map(id=>[id,100]));localStorage.setItem('$key',JSON.stringify({passed,scores:passed}));return true})()" | Out-Null
  Navigate ('http://localhost/tjkt-learning/'+$module.path)
  $stages=@()
  for($stage=0;$stage -lt $desktop.stageCount;$stage++){
   Evaluate "(()=>{const b=document.querySelectorAll('.lesson-nav > button')[$stage];if(b.disabled)throw Error('Stage still locked: $stage');b.click();return true})()" | Out-Null
   Evaluate 'new Promise(resolve=>setTimeout(()=>resolve(true),100))' | Out-Null
   $stageMobile=Evaluate $snapshot
   if($stageMobile.overflow -or $stageMobile.duplicateIds.Count -or $stageMobile.contentLength -lt 50){throw "Invalid mobile stage $($module.id) $stage"}
   Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=1280;height=900;deviceScaleFactor=1;mobile=$false} | Out-Null
   $stageDesktop=Evaluate $snapshot
   if($stageDesktop.overflow){throw "Invalid desktop stage $($module.id) $stage"}
   Evaluate 'import("/tjkt-learning/tools/studio-checks.js").then(async tests=>({topic:await tests.checkTopicStage(),game:await tests.checkGameStage()}))' | Out-Null
   if($OnlyModules.Count -and $stageDesktop.title -and (Evaluate 'Boolean(document.querySelector(".chapter-unit:not([hidden]) [data-topic-activity]"))')) {
    Evaluate 'document.querySelector(".chapter-unit:not([hidden]) [data-topic-activity]").scrollIntoView({block:"start"});new Promise(resolve=>setTimeout(()=>resolve(true),150))' | Out-Null
    $capture=Call-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
    [IO.File]::WriteAllBytes((Join-Path ([IO.Path]::GetTempPath()) ("tjkt-topic-$($module.id).png")),[Convert]::FromBase64String($capture.data))
   }
   if($module.id -eq 'media-transmisi' -and $stage -eq 5){Evaluate 'document.querySelector("[data-medium=fiber]").click();document.getElementById("mediaInterference").checked=true;document.getElementById("mediaInterference").dispatchEvent(new Event("input"));if(document.getElementById("qualityValue").textContent!=="Belum diukur")throw Error("Fake quality score remains");document.getElementById("sendMediaPacket").click();new Promise(resolve=>setTimeout(()=>{if(!document.getElementById("mediaFeedback").textContent.includes("bukan hasil uji"))throw Error("Misleading signal animation");resolve(true)},1500))' | Out-Null}
   if($module.id -eq 'media-transmisi' -and $stage -eq 6){Evaluate 'document.querySelector("[data-cable-fault=open]").click();document.getElementById("runCableTest").click();if(!document.getElementById("cableTesterFeedback").textContent.includes("Pin 4"))throw Error("Cable tester failed");true' | Out-Null}
   if($module.id -eq 'osi-tcpip' -and $stage -eq 4){Evaluate 'document.getElementById("nextPacketStep").click();if(!document.getElementById("packetStatus").textContent.trim())throw Error("Packet simulator failed");true' | Out-Null}
   if($module.id -eq 'protokol-layanan' -and $stage -eq 5){Evaluate 'document.getElementById("serviceStep").click();if(!document.getElementById("serviceStatus").textContent.trim())throw Error("Service simulator failed");true' | Out-Null}
   if($module.id -eq 'troubleshooting' -and $stage -eq 6){Evaluate 'document.querySelectorAll("#diagnosticTools button")[0].click();document.querySelectorAll("#diagnosticTools button")[1].click();document.getElementById("repairSelect").value="reseat-cable";document.getElementById("applyRepair").click();if(!document.getElementById("labStatus").textContent.includes("dipulihkan"))throw Error("Troubleshooting repair failed");true' | Out-Null}
   if($module.id -eq 'switching-vlan' -and $stage -eq 6){Evaluate 'document.getElementById("resetVlanLab").click();document.getElementById("sendFrame").click();if(!document.getElementById("frameStatus").textContent.trim())throw Error("VLAN lab failed");true' | Out-Null}
   if($module.id -eq 'pengenalan-jaringan' -and $stage -eq 4){Evaluate 'if(!document.getElementById("client-server-lab"))throw Error("Client-server lab missing");true' | Out-Null}
   Evaluate 'document.querySelector(".theme-button").click();new Promise(resolve=>setTimeout(()=>resolve(true),300))' | Out-Null
   $stageDark=Evaluate $snapshot
   if(!$stageDark.bodyDark -or $stageDark.overflow){throw "Invalid dark stage $($module.id) $stage"}
   Evaluate 'document.querySelector(".theme-button").click();new Promise(resolve=>setTimeout(()=>resolve(true),300))' | Out-Null
   $stages += $stageDesktop.title
   Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=390;height=844;deviceScaleFactor=1;mobile=$true} | Out-Null
  }
  $results += [pscustomobject]@{id=$module.id;desktop=$desktop;dark=$dark;mobile=$mobile;stages=$stages;studio=$studioCheck;themeToggled=$theme;errors=@($script:errors.ToArray())}
  Write-Output "$($module.id): $($stages.Count) stages; desktop/mobile/theme checked; $($script:errors.Count) errors"
 }
 foreach($mode in @('desktop','dark','mobile')) {
  $baseline=$results[0].$mode.styles | ConvertTo-Json -Depth 6 -Compress
  foreach($result in $results) {
   $actual=$result.$mode.styles | ConvertTo-Json -Depth 6 -Compress
   if($baseline -ne $actual){throw "STYLE MISMATCH $mode $($result.id)"}
  }
 }
 $report=Join-Path $root $(if($OnlyModules.Count){'docs/module-validation-browser-focused.json'}else{'docs/module-validation-browser.json'})
 $summary=@{checkedAt=[DateTime]::UtcNow.ToString('o');viewports=@('1280x900','390x844');themes=@('light','dark');styleParity=$true;modules=@($results | ForEach-Object {[pscustomobject]@{id=$_.id;stageCount=$_.stages.Count;stages=$_.stages;studio=$_.studio;themeToggled=$_.themeToggled;errors=$_.errors}})}
 $summary | ConvertTo-Json -Depth 8 | Set-Content $report -Encoding UTF8
 Write-Output "Report: $report"
 $failures=@($results | Where-Object {$_.errors.Count -gt 0 -or !$_.themeToggled})
 if($failures.Count){throw "Browser errors or theme failures: $($failures.id -join ', ')"}
} finally {
 if($socket){$socket.Dispose()}
 if($browser -and !$browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}
}
