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
 Start-Sleep -Milliseconds 200
 Evaluate 'new Promise((resolve,reject)=>{let n=0;const tick=()=>{if(document.readyState==="complete"&&document.querySelector(".lesson-nav button"))return setTimeout(()=>resolve(true),250);if(++n>100)return reject(new Error("Module did not initialize"));setTimeout(tick,100)};tick()})' | Out-Null
}
try {
 for($attempt=0;$attempt -lt 40;$attempt++){try{$targets=Invoke-RestMethod "http://127.0.0.1:$Port/json/list";break}catch{Start-Sleep -Milliseconds 250}}
 $target=$targets | Where-Object type -eq 'page' | Select-Object -First 1
 $socket=New-Object Net.WebSockets.ClientWebSocket
 $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
 Call-CDP 'Runtime.enable' | Out-Null
 Call-CDP 'Log.enable' | Out-Null
 Call-CDP 'Page.enable' | Out-Null
 $catalog=Get-Content (Join-Path $root 'data/modules.json') -Raw -Encoding UTF8 | ConvertFrom-Json
 $results=@()
 foreach($module in $catalog | Where-Object {$_.status -eq 'published' -and (!$OnlyModules.Count -or $_.id -in $OnlyModules)}) {
  $script:errors.Clear()
  Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=1280;height=900;deviceScaleFactor=1;mobile=$false} | Out-Null
  Navigate ($SiteUrl+$module.path)
  Evaluate 'import("/tjkt-learning/tools/completion-checks.js").then(t=>t.resetTestProfile())' | Out-Null
  Navigate ($SiteUrl+$module.path)
  $initial=Evaluate 'import("/tjkt-learning/tools/completion-checks.js").then(t=>t.currentCompletion())'
  if($initial.complete){throw 'Fresh profile already completed'}
  Write-Output "START $($module.id) ($($initial.stages) stages)"
  for($i=0;$i -lt $initial.stages;$i++) {
   Evaluate ('import("/tjkt-learning/tools/completion-checks.js").then(t=>t.completeCurrentStage('+$i+'))') | Out-Null
   Write-Output "  PASS stage $($i+1)"
  }
  $certificate=Evaluate 'import("/tjkt-learning/tools/completion-checks.js").then(t=>t.buildAndPrintCertificate())'
  $pdf=Call-CDP 'Page.printToPDF' @{landscape=$true;printBackground=$true;preferCSSPageSize=$true;displayHeaderFooter=$false;marginTop=0;marginBottom=0;marginLeft=0;marginRight=0}
  $bytes=[Convert]::FromBase64String($pdf.data)
  $pages=[regex]::Matches([Text.Encoding]::GetEncoding(28591).GetString($bytes),'/Type\s*/Page\b').Count
  if($pages -ne 1){throw "Certificate PDF pages: $pages"}
  Navigate ($SiteUrl+$module.path)
  Evaluate 'import("/tjkt-learning/tools/completion-checks.js").then(t=>t.finalStage())' | Out-Null
  $reprint=Evaluate 'import("/tjkt-learning/tools/completion-checks.js").then(t=>t.buildAndPrintCertificate())'
  $blocked=Evaluate @'
import('/tjkt-learning/assets/js/module-certificate.js').then(t=>{const s=t.completionSnapshot(),backup=localStorage.getItem(s.key),state=JSON.parse(backup),id=s.ids.at(-1);state.passed[id]=70;if(state.scores)state.scores[id]=70;localStorage.setItem(s.key,JSON.stringify(state));t.refreshModuleCertificate();const blocked=!t.completionSnapshot().complete&&!document.querySelector('[data-certificate-action=print]')&&!document.getElementById('tjktPrintableCertificate');localStorage.setItem(s.key,backup);t.refreshModuleCertificate();if(!blocked)throw Error('Nonpassing final score allowed certificate');return blocked;})
'@
  if($script:errors.Count){throw ($script:errors -join '; ')}
  $results+=@{id=$module.id;stages=$initial.stages;freshSequential=$true;certificate=$certificate;pdfPages=$pages;pdfBytes=$bytes.Length;existingProgressReprint=$reprint.print;belowThresholdBlocked=$blocked}
  $report=Join-Path $root $(if($OnlyModules.Count){'docs/completion-validation-focused.json'}else{'docs/completion-validation-browser.json'})
  @{checkedAt=[DateTime]::UtcNow.ToString('o');modules=$results} | ConvertTo-Json -Depth 10 | Set-Content $report -Encoding UTF8
  Write-Output "PASS $($module.id): certificate, PDF, reprint, threshold"
 }
 Write-Output "COMPLETE: $($results.Count) modules"
} finally {
 if($socket){$socket.Dispose()}
 if($browser -and !$browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}
}
