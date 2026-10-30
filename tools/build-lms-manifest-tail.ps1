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
