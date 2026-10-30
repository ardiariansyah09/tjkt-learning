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
 Start-Sleep -Milliseconds 1000
 Evaluate 'new Promise((resolve,reject)=>{let n=0;const tick=()=>{if(document.readyState==="complete"&&document.querySelector(".lesson-nav button"))return setTimeout(()=>resolve(true),250);if(++n>100)return reject(new Error("Module did not initialize"));setTimeout(tick,100)};tick()})' | Out-Null
}
try {
 for($attempt=0;$attempt -lt 40;$attempt++){try{$targets=Invoke-RestMethod "http://127.0.0.1:$Port/json/list";break}catch{Start-Sleep -Milliseconds 250}}
 $target=$targets|Where-Object type -eq 'page'|Select-Object -First 1
 $socket=New-Object Net.WebSockets.ClientWebSocket
 $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult()|Out-Null
 Call-CDP 'Runtime.enable'|Out-Null
 Call-CDP 'Page.enable'|Out-Null
 Call-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source="localStorage.clear();localStorage.setItem('tjkt:local-instructor:v1','off');"}|Out-Null
 $catalog=Get-Content (Join-Path $root 'data/modules.json') -Raw -Encoding UTF8|ConvertFrom-Json
 $results=@()
 foreach($m in $catalog){
  Navigate ($SiteUrl+$m.path)
  $snap=Evaluate "(async()=>{const {completionSnapshot}=await import(new URL('../../../assets/js/module-certificate.js',location.href));const s=completionSnapshot();return {key:s.key,stages:s.missing.map(x=>({id:x.id,title:x.title,threshold:x.threshold}))}})()"
  if(!$snap.stages.Count){throw "No stages: $($m.id)"}
  $results+=@{id=$m.id;title=$m.title;description=$m.description;phase=$m.phase;grade=@{X=10;XI=11;XII=12}[$m.classLevel];category=$m.category;path=$m.path;prerequisites=$m.prerequisites;key=$snap.key;stages=$snap.stages}
 }
 New-Item -ItemType Directory -Path (Join-Path $root 'lms/storage/app/learning-pack') -Force|Out-Null
 $json=ConvertTo-Json -InputObject $results -Depth 12
 [IO.File]::WriteAllText((Join-Path $root 'lms/storage/app/learning-pack/manifest.json'),$json,(New-Object Text.UTF8Encoding($false)))
 Write-Output ('PASS manifest: '+$results.Count+' modules, '+(($results|ForEach-Object {$_.stages.Count}|Measure-Object -Sum).Sum)+' stages')
} finally {if($socket){$socket.Dispose()};if($browser -and !$browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}}
