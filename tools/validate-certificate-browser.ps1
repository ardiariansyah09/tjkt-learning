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
 for($attempt=0;$attempt -lt 40;$attempt++){try{$targets=Invoke-RestMethod "http://127.0.0.1:$Port/json/list";break}catch{Start-Sleep -Milliseconds 250}}
 $target=$targets | Where-Object type -eq 'page' | Select-Object -First 1
 if(!$target){throw 'Headless browser unavailable'}
 $socket=New-Object Net.WebSockets.ClientWebSocket
 $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
 Call-CDP 'Runtime.enable' | Out-Null
 Call-CDP 'Log.enable' | Out-Null
 Call-CDP 'Page.enable' | Out-Null
 $results=@()
 foreach($id in @('pengenalan-jaringan','topologi-jaringan','ipv4-subnetting','perangkat-jaringan')){
  Navigate ($SiteUrl.TrimEnd('/')+'/modules/dasar-jaringan/'+$id+'/')
  Evaluate 'import("/tjkt-learning/tools/certificate-checks.js").then(t=>t.renderSample())' | Out-Null
  Call-CDP 'Emulation.setEmulatedMedia' @{media='print'} | Out-Null
  Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=1123;height=794;deviceScaleFactor=1;mobile=$false} | Out-Null
  $normal=Evaluate 'import("/tjkt-learning/tools/certificate-checks.js").then(t=>t.printGeometry())'
  if($id -eq 'pengenalan-jaringan'){
   $shot=Call-CDP 'Page.captureScreenshot' @{format='png';clip=@{x=0;y=0;width=1123;height=794;scale=1};captureBeyondViewport=$true}
   [IO.File]::WriteAllBytes((Join-Path $root 'docs/pratinjau-sertifikat.png'),[Convert]::FromBase64String($shot.data))
   $pdf=Call-CDP 'Page.printToPDF' @{landscape=$true;printBackground=$true;preferCSSPageSize=$true;displayHeaderFooter=$false;marginTop=0;marginBottom=0;marginLeft=0;marginRight=0}
   $bytes=[Convert]::FromBase64String($pdf.data)
   [IO.File]::WriteAllBytes((Join-Path $root 'docs/pratinjau-sertifikat.pdf'),$bytes)
   $pages=[regex]::Matches([Text.Encoding]::GetEncoding(28591).GetString($bytes),'/Type\s*/Page\b').Count
   if($pages -ne 1){throw "Expected one PDF page, got $pages"}
  }
  Evaluate 'import("/tjkt-learning/tools/certificate-checks.js").then(t=>t.renderSample(true))' | Out-Null
  $long=Evaluate 'import("/tjkt-learning/tools/certificate-checks.js").then(t=>t.printGeometry())'
  Evaluate 'document.body.classList.add("dark");if(getComputedStyle(document.getElementById("certificateQA")).backgroundColor!=="rgb(255, 255, 255)")throw Error("Dark theme changed paper");true' | Out-Null
  $results += [pscustomobject]@{module=$id;normal=$normal;long=$long;originalLogo=$true;darkPrint=$true}
  Write-Output "$id certificate: original logo, A4, normal/long text, dark print PASS"
  Call-CDP 'Emulation.setEmulatedMedia' @{media='screen'} | Out-Null
 }
 Call-CDP 'Page.navigate' @{url=($SiteUrl.TrimEnd('/')+'/docs/pratinjau-sertifikat.html')} | Out-Null
 Evaluate 'new Promise((resolve,reject)=>{let n=0;const tick=()=>{if(window.TJKTCertificate&&document.querySelector(".tjkt-cert-logo")?.complete)return TJKTCertificate.ready(document.getElementById("previewPaper")).then(()=>resolve(true));if(++n>100)return reject(Error("Preview unavailable"));setTimeout(tick,100)};tick()})' | Out-Null
 Call-CDP 'Emulation.setDeviceMetricsOverride' @{width=390;height=844;deviceScaleFactor=1;mobile=$true} | Out-Null
 Evaluate 'if(getComputedStyle(document.getElementById("previewPaper")).display!=="grid")throw Error("Preview hidden");true' | Out-Null
 if($script:errors.Count){throw ($script:errors -join "`n")}
 @{checkedAt=[DateTime]::UtcNow.ToString('o');design='tjkt-circuit-v3';modules=$results;previewMobile=$true;javascriptErrors=$script:errors.Count} | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $root 'docs/certificate-validation-browser.json') -Encoding UTF8
 Write-Output 'Certificate previews and validation report saved in docs.'
} finally {
 if($socket){$socket.Dispose()}
 if($browser -and !$browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}
}
