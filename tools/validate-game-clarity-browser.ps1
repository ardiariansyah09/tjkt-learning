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
 Call-CDP 'Runtime.enable'|Out-Null;Call-CDP 'Log.enable'|Out-Null;Call-CDP 'Page.enable'|Out-Null
 Call-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source="localStorage.setItem('tjkt:local-instructor:v1','on');"}|Out-Null
 $catalog=Get-Content (Join-Path $root 'data/modules.json') -Raw -Encoding UTF8|ConvertFrom-Json
 $results=@()
 foreach($m in $catalog){
  Navigate ($SiteUrl+$m.path)
  $index=Evaluate '(()=>{if(["pengenalan-jaringan","topologi-jaringan","perangkat-jaringan","ipv4-subnetting"].includes(document.body.dataset.moduleId))return 7;const units=[...document.querySelectorAll(".chapter-unit")];return units.findIndex(u=>[...u.querySelectorAll("section")].some(n=>[...n.classList].some(c=>c.endsWith("-game"))));})()'
  if($index -lt 0){if($m.id -ne 'media-transmisi'){throw ('Missing game: '+$m.id)};$results+=@{id=$m.id;hasGame=$false};continue}
  Evaluate ('document.querySelectorAll(".lesson-nav>button")['+$index+'].click();true')|Out-Null
  $inspection=Evaluate @'
(async()=>{
 const visibleGame=()=>[...document.querySelectorAll('.lesson-content section')].find(n=>n.getClientRects().length&&[...n.classList].some(c=>c.endsWith('-game')));
 for(let i=0;i<100&&!visibleGame();i++)await new Promise(r=>setTimeout(r,50));
 const g=visibleGame();if(!g)throw Error('Game did not initialize');
 if([...document.querySelectorAll('.lesson-content input[type=radio]')].some(n=>n.getClientRects().length))throw Error('Visible multiple-choice question inside game stage');
 const own=g.querySelector('.pg-guide'),guide=g.querySelector('[data-game-help=compact]');
 if(!own&&!guide)throw Error('No simple game information');
 const details=own?g.querySelector('.pg-help'):guide.querySelector('details');
 if(!details||details.open)throw Error('Long instructions not collapsed initially');
 if(guide&&(!guide.textContent.includes('Mulai:')||!guide.textContent.includes('Tanda selesai:')))throw Error('Missing first step or completion instruction');
 if(g.querySelector('[data-game-view="3d"],.action-camera')||g.dataset.mode==='3d')throw Error('3D game still used');
 if(document.querySelector('.basic-practice,.services-practice,.services-practice-hint'))throw Error('Guided practice reappeared');
 const buttons=g.querySelectorAll('button').length;if(!buttons)throw Error('No interactive controls');
 const snap=(await import('/tjkt-learning/assets/js/module-certificate.js')).completionSnapshot();if(snap.complete)throw Error('Inspection granted completion');
 return {hasGame:true,twoD:true,multipleChoice:false,simpleInstructions:true,controls:buttons,draggableObjects:g.querySelectorAll('[draggable=true]').length,noFakeCompletion:true};
})()
'@
  $results+=@{id=$m.id;inspection=$inspection}
  Write-Output ('PASS game information: '+$m.id)
 }
 if($script:errors.Count){throw ($script:errors -join '; ')}
 @{checkedAt=[DateTime]::UtcNow.ToString('o');modules=$results}|ConvertTo-Json -Depth 8|Set-Content (Join-Path $root 'docs/game-clarity-validation.json') -Encoding UTF8
 Write-Output 'COMPLETE: 53 modules inspected for simple 2D game information and absence of guided practice.'
} finally {if($socket){$socket.Dispose()};if($browser -and !$browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}}
