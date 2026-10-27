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
 Start-Sleep -Milliseconds 300
 Evaluate 'new Promise((resolve,reject)=>{let n=0;const tick=()=>{if(document.readyState==="complete"&&document.querySelector(".lesson-nav button"))return setTimeout(()=>resolve(true),250);if(++n>100)return reject(new Error("Module did not initialize"));setTimeout(tick,100)};tick()})' | Out-Null
}
try {
 for($attempt=0;$attempt -lt 40;$attempt++){try{$targets=Invoke-RestMethod "http://127.0.0.1:$Port/json/list";break}catch{Start-Sleep -Milliseconds 250}}
 $target=$targets|Where-Object type -eq 'page'|Select-Object -First 1
 $socket=New-Object Net.WebSockets.ClientWebSocket
 $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult()|Out-Null
 Call-CDP 'Runtime.enable'|Out-Null
 Call-CDP 'Log.enable'|Out-Null
 Call-CDP 'Page.enable'|Out-Null
 $catalog=Get-Content (Join-Path $root 'data/modules.json') -Raw -Encoding UTF8|ConvertFrom-Json
 $results=@()
 foreach($mode in @('instructor','student','public')){
  $pref=if($mode -eq 'student'){'off'}else{'on'}
  $inject=Call-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source=("localStorage.clear();localStorage.setItem('tjkt:local-instructor:v1','"+$pref+"');")}
  $base=if($mode -eq 'public'){$SiteUrl.Replace('127.0.0.1','127.0.0.2')}else{$SiteUrl}
  foreach($m in $catalog){
   Navigate ($base+$m.path)
   if($mode -eq 'instructor'){
    $result=Evaluate @'
(async()=>{
 const buttons=()=>[...document.querySelectorAll('.lesson-nav > button')];
 if(!window.TJKTLocalInstructor.isActive()||buttons().some(b=>b.disabled))throw Error('Instructor stages locked');
 const next=document.querySelector('.lesson-forward-actions button:last-child');
 if(!next||next.disabled)throw Error('Instructor next disabled');next.click();await new Promise(r=>setTimeout(r,40));
 if(!buttons()[1].classList.contains('active'))throw Error('Instructor next did not navigate');
 for(let i=0;i<buttons().length;i++){buttons()[i].click();await new Promise(r=>requestAnimationFrame(r));if(!buttons()[i].classList.contains('active'))throw Error('Cannot open stage '+i);}
 const c=await import('/tjkt-learning/assets/js/module-certificate.js');
 if(c.completionSnapshot().complete||document.querySelector('[data-certificate-action=print]'))throw Error('Preview granted certificate');
 if(!document.querySelector('[data-progress-count]').textContent.startsWith('0 '))throw Error('Preview granted completion');
 return {stages:buttons().length,allAccessible:true,noFakeCompletion:true};
})()
'@
   }else{
    $result=Evaluate '(()=>{const b=[...document.querySelectorAll(".lesson-nav > button")];if(window.TJKTLocalInstructor.isActive()||b[0].disabled||b.slice(1).some(n=>!n.disabled))throw Error("Student/public lock bypass");if(!document.querySelector(".lesson-forward-actions button:last-child").disabled)throw Error("Student next unlocked");if(location.hostname==="127.0.0.2"&&document.querySelector(".local-instructor-tools"))throw Error("Public instructor control visible");return {stages:b.length,locksRetained:true};})()'
   }
   if($script:errors.Count){throw ($script:errors -join '; ')}
   $results+=@{id=$m.id;mode=$mode;result=$result}
  }
  Call-CDP 'Page.removeScriptToEvaluateOnNewDocument' @{identifier=$inject.identifier}|Out-Null
  Write-Output ('PASS '+$mode+': '+$catalog.Count+' modules')
 }
 @{checkedAt=[DateTime]::UtcNow.ToString('o');modules=$catalog.Count;results=$results}|ConvertTo-Json -Depth 8|Set-Content (Join-Path $root 'docs/local-instructor-validation.json') -Encoding UTF8
 Write-Output 'COMPLETE: instructor navigation, student locks, public host guard, unchanged completion.'
} finally {if($socket){$socket.Dispose()};if($browser -and !$browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}}
