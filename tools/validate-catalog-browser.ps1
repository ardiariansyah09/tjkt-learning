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
 Call-CDP 'Page.navigate' @{url=$SiteUrl} | Out-Null
 Evaluate 'new Promise((resolve,reject)=>{let n=0;const t=()=>{if(document.querySelectorAll(".module-card").length===53)return resolve(true);if(++n>100)return reject(Error("Catalog not loaded"));setTimeout(t,100)};t()})' | Out-Null
 $result=Evaluate '(()=>{const cards=[...document.querySelectorAll(".module-card")];if(cards.length!==53||cards.some(c=>!c.classList.contains("is-published")))throw Error("Unpublished catalog entry");const links=cards.map(c=>c.querySelector(":scope > a")?.getAttribute("href"));if(links.some(l=>!l||!l.includes("modules/")))throw Error("Missing module link");if(document.documentElement.scrollWidth>innerWidth)throw Error("Portal desktop overflow");return {modules:cards.length,published:53,noComingSoon:true}})()'
 Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=390;height=844;deviceScaleFactor=1;mobile=$true} | Out-Null
 Evaluate 'if(document.documentElement.scrollWidth>innerWidth)throw Error("Portal mobile overflow");true' | Out-Null
 @{checkedAt=[DateTime]::UtcNow.ToString('o');catalog=$result;mobile=$true} | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $root 'docs/catalog-validation.json') -Encoding UTF8
 Write-Output 'PASS: 53 published cards, module links, desktop/mobile catalog.'
} finally {
 if($socket){$socket.Dispose()}
 if($browser -and !$browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}
}