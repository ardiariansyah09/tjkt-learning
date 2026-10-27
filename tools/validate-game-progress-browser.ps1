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
 Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=1280;height=900;deviceScaleFactor=1;mobile=$false}|Out-Null
 Call-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source="localStorage.setItem('tjkt:local-instructor:v1','off');"}|Out-Null
 Navigate ($SiteUrl+'modules/dasar-jaringan/proses-bisnis-tjkt/')
 $ids=Evaluate 'import("/tjkt-learning/assets/js/topic-games-model.js").then(m=>Object.keys(m.topicGameDefinitions))'
 $catalog=Get-Content (Join-Path $root 'data/modules.json') -Raw -Encoding UTF8|ConvertFrom-Json
 $results=@()
 foreach($m in $catalog|Where-Object {$_.id -in $ids -and (!$OnlyModules.Count -or $_.id -in $OnlyModules)}){
  Navigate ($SiteUrl+$m.path)
  Evaluate @'
import('/tjkt-learning/assets/js/module-certificate.js').then(m=>{
 const snap=m.completionSnapshot(),passed=Object.fromEntries(snap.ids.map(id=>[id,85])),scores={...passed};
 localStorage.clear();localStorage.setItem('tjkt:local-instructor:v1','off');
 const hasScores=snap.moduleId!=='ipv4-subnetting';localStorage.setItem(snap.key,JSON.stringify({version:2,passed,...(hasScores?{scores}:{}),current:snap.ids.at(-1)}));
 const journalKey=`tjkt:${snap.moduleId}:studio:v1`,journal=JSON.stringify({experiments:[{inputs:{fixture:'old'},result:{ok:true}}],journal:{evidence:'Catatan lama siswa uji'}});
 localStorage.setItem(journalKey,journal);
 const oldGameKey='tjkt:ipv4-subnetting:stage8:games',oldGame=JSON.stringify({attempts:4,best:85,last:85,details:{game:'Subnet Courier',levels:3}});localStorage.setItem(oldGameKey,oldGame);
 localStorage.setItem('__qa_game_compat',JSON.stringify({key:snap.key,passed,scores:hasScores?scores:null,journalKey,journal,oldGameKey,oldGame}));return true;
})
'@ | Out-Null
  Navigate ($SiteUrl+$m.path)
  Evaluate @'
import('/tjkt-learning/assets/js/module-certificate.js').then(m=>{
 const snap=m.completionSnapshot();if(!snap.complete)throw Error('Old passing progress no longer complete');
 const gameIndex=['pengenalan-jaringan','perangkat-jaringan','topologi-jaringan','ipv4-subnetting'].includes(snap.moduleId)?7:snap.ids.indexOf('game');
 if(gameIndex<0)throw Error('Game chapter not found');document.querySelectorAll('.lesson-nav > button')[gameIndex].click();
 return new Promise((resolve,reject)=>{let tries=0;const tick=()=>{const game=document.querySelector('.topic-2d-game');if(game?.getClientRects().length){game.querySelector('[data-pg-control=reset]').click();return resolve(true);}if(++tries>100)return reject(Error('Replacement game failed to mount'));setTimeout(tick,50);};tick();});
})
'@ | Out-Null
  if($m.id -in @('proses-bisnis-tjkt','ipv4-subnetting','osi-tcpip','k3-budaya-kerja','perencanaan-jaringan')){
   Evaluate 'document.querySelector(".topic-2d-game").scrollIntoView({block:"start"});document.fonts.ready.then(()=>new Promise(r=>setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(r)),400)))'|Out-Null
   $capture=Call-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
   [IO.File]::WriteAllBytes((Join-Path $root ("docs/pratinjau-game-$($m.id).png")),[Convert]::FromBase64String($capture.data))
  }
  $preserved=Evaluate @'
(()=>{const e=JSON.parse(localStorage.getItem('__qa_game_compat')),now=JSON.parse(localStorage.getItem(e.key));if(JSON.stringify(now.passed)!==JSON.stringify(e.passed)||e.scores!==null&&JSON.stringify(now.scores)!==JSON.stringify(e.scores))throw Error('Old grades changed');if(localStorage.getItem(e.journalKey)!==e.journal||localStorage.getItem(e.oldGameKey)!==e.oldGame)throw Error('Old journal/game record changed');return true;})()
'@
  Evaluate 'import("/tjkt-learning/tools/completion-checks.js").then(t=>t.finalStage())'|Out-Null
  $print=Evaluate 'import("/tjkt-learning/tools/completion-checks.js").then(t=>t.buildAndPrintCertificate())'
  if(!$print.print){throw 'Old progress certificate reprint failed'}
  $results+=@{id=$m.id;oldGrade85Preserved=$preserved;journalAndGameHistoryPreserved=$true;replacementResetPreservesGrade=$true;existingProgressReprint=$print.print}
  Write-Output ('PASS old progress: '+$m.id)
 }
 @{checkedAt=[DateTime]::UtcNow.ToString('o');modules=$results}|ConvertTo-Json -Depth 8|Set-Content (Join-Path $root $(if($OnlyModules.Count){'docs/game-progress-compatibility-focused.json'}else{'docs/game-progress-compatibility.json'})) -Encoding UTF8
 Write-Output ('COMPLETE: '+$results.Count+' old-progress and reprint checks.')
} finally {if($socket){$socket.Dispose()};if($browser -and !$browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}}
