param([int]$Port = 9342, [string]$SiteUrl = 'http://localhost/tjkt-learning/')
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
 Call-CDP 'Page.navigate' @{url=$SiteUrl} | Out-Null
 Evaluate 'new Promise((resolve,reject)=>{let n=0;const tick=()=>{if(document.querySelectorAll(".module-card").length===53)return resolve(true);if(++n>100)return reject(Error("Catalog did not initialize"));setTimeout(tick,100)};tick()})' | Out-Null
 $result=Evaluate '(()=>{
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const headings=[...document.querySelectorAll(".class-heading")].map(e=>e.textContent);
 assert(headings.length===2&&headings[0].includes("XI · 576")&&headings[1].includes("XII · 180"),"Class headings/JP");
 const cards=[...document.querySelectorAll(".module-card")];
 const f=cards.filter(c=>c.closest("[data-phase=F]"));assert(f.length===37,"Phase F count");
 assert(document.querySelectorAll(".element-allocation").length===5,"Five ATP elements");
 cards.forEach(c=>{const group=c.closest(".module-group");assert(c.querySelector(".module-position").textContent.includes("Kelas "+group.dataset.classLevel),"Wrong card class");});
 assert(document.querySelector("[data-module-id=server-dmz]").closest(".module-group").dataset.classLevel==="XII","DMZ class");
 assert(document.querySelector("[data-module-id=switching-vlan]").closest(".module-group").dataset.classLevel==="XI","VLAN class");
 assert(document.querySelector("[data-module-id=mail-server]").dataset.curriculumRole==="pengayaan","Mail enrichment");
 assert(document.querySelector("[data-module-id=virtualisasi-server]").dataset.curriculumRole==="pendukung","Virtualization support");
 assert(cards.filter(c=>c.classList.contains("is-published")).length===26,"Published status preservation");
 const ids=[...document.querySelectorAll("[id]")].map(e=>e.id);assert(ids.length===new Set(ids).size,"Duplicate IDs");
 return {cards:cards.length,phaseF:f.length,headings,allocations:5,published:26};
 })()'
 foreach($width in @(1280,390)){
  Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=$width;height=900;deviceScaleFactor=1;mobile=($width -lt 600)} | Out-Null
  foreach($theme in @('light','dark')){
   Evaluate ('document.body.classList.toggle("dark",'+($theme -eq 'dark').ToString().ToLower()+');new Promise(resolve=>setTimeout(()=>resolve(true),350))') | Out-Null
   if(Evaluate 'document.documentElement.scrollWidth>innerWidth'){throw "Catalog overflow: $width $theme"}
  }
 }
 Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=1280;height=900;deviceScaleFactor=1;mobile=$false} | Out-Null
 Evaluate 'document.body.classList.remove("dark");document.getElementById("fase-f-kelas-xi").scrollIntoView({block:"start"});new Promise(resolve=>setTimeout(()=>resolve(true),200))' | Out-Null
 $capture=Call-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
 [IO.File]::WriteAllBytes((Join-Path ([IO.Path]::GetTempPath()) 'tjkt-atp-kelas-xi.png'),[Convert]::FromBase64String($capture.data))
 Navigate ($SiteUrl+'modules/konfigurasi-jaringan/switching-vlan/')
 if(!(Evaluate 'document.querySelector(".eyebrow-dark").textContent.includes("KELAS XI ·")')){throw 'Published VLAN class mismatch'}
 if($script:errors.Count){throw ($script:errors -join '; ')}
 $result | Add-Member -NotePropertyName javascriptErrors -NotePropertyValue 0
 $result | Add-Member -NotePropertyName responsiveThemes -NotePropertyValue $true
 $result | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $root 'docs/atp-validation-browser.json') -Encoding UTF8
 Write-Output ($result | ConvertTo-Json -Compress -Depth 5)
} finally {
 if($socket){$socket.Dispose()}
 if($browser -and !$browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}
}
