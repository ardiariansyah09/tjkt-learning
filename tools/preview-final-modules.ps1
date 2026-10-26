param([int]$Port = 9337, [string[]]$OnlyModules = @(), [string]$SiteUrl = 'http://localhost/tjkt-learning/')
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
 Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=1280;height=900;deviceScaleFactor=1;mobile=$false} | Out-Null
 $examples=@(
 @{id='autentikasi-kriptografi';path='modules/keamanan-jaringan/autentikasi-kriptografi/';stage=8;selector='.crypto-bench';file='pratinjau-kriptografi.png'},
 @{id='server-dmz';path='modules/keamanan-jaringan/server-dmz/';stage=8;selector='.zone-board';file='pratinjau-dmz.png'},
 @{id='proyek-integrasi-jaringan';path='modules/proyek-integrasi/proyek-integrasi-jaringan/';stage=9;selector='.mission-board';file='pratinjau-campus-launch.png'}
 )
 foreach($example in $examples){
  Navigate ($SiteUrl+$example.path)
  Evaluate ('(()=>{const ids=["orientasi","konsep-1","konsep-2","konsep-3","konsep-4","konsep-5","konsep-6","kasus","laboratorium","game","refleksi","evaluasi"];const passed=Object.fromEntries(ids.map(id=>[id,100]));localStorage.setItem("tjkt:MODULE:course:v2",JSON.stringify({passed,scores:passed}));return true})()'.Replace('MODULE',$example.id)) | Out-Null
  Navigate ($SiteUrl+$example.path)
  Evaluate (('document.querySelectorAll(".lesson-nav>button")[STAGE].click();new Promise(r=>setTimeout(r,300))').Replace('STAGE',[string]$example.stage)) | Out-Null
  if($example.id -eq 'server-dmz'){
   Evaluate '(()=>{const b=document.querySelector("[data-topic-activity]");for(const [name,v] of [["zone-web","dmz"],["allowDB","true"],["blockLateral","true"],["publishDB","false"]]){const n=b.querySelector(`[name="${name}"]`);n.value=v;n.dispatchEvent(new Event("change",{bubbles:true}));}b.querySelector("[data-final-lab-action=test]").click();return true})()' | Out-Null
  }
  Evaluate (('document.querySelector("SELECTOR").scrollIntoView({block:"start"});window.scrollBy(0,-100);true').Replace('SELECTOR',$example.selector)) | Out-Null
  $capture=Call-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
  [IO.File]::WriteAllBytes((Join-Path $root ('docs/'+$example.file)),[Convert]::FromBase64String($capture.data))
 }
 Write-Output 'PASS: three review screenshots generated.'
} finally {
 if($socket){$socket.Dispose()}
 if($browser -and !$browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}
}