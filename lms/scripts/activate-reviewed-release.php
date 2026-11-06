<?php
// Server-only activation: verifies baseline, backs up DB/code, retains old courses,
// registers new packages as drafts, and restores code automatically on failure.
if (($argv[1]??'')!=='--activate') throw new RuntimeException('Explicit --activate required.');
$review='/home/adminnazh/tjkt-lms-review-20261028';$production='/var/www/tjkt-learning';
if(realpath(__DIR__.'/..')!==$review)throw new RuntimeException('Review path mismatch.');
require $review.'/vendor/autoload.php';
$manifest=json_decode(file_get_contents($review.'/storage/app/review-artifacts/release-manifest.json'),true,512,JSON_THROW_ON_ERROR);
if($manifest['productionConflicts'])throw new RuntimeException('Release has production conflicts.');
foreach($manifest['changes'] as $change){
 $path=$change['path'];
 if(str_contains($path,'..')||!preg_match('~^(app/|routes/|resources/|database/migrations/|storage/app/learning-pack/)~',$path))throw new RuntimeException('Invalid release path.');
 if(hash_file('sha256',$review.'/'.$path)!==$change['after'])throw new RuntimeException('Review file changed: '.$path);
 $target=$production.'/'.$path;$current=is_file($target)?hash_file('sha256',$target):null;
 if($current!==$change['before'])throw new RuntimeException('Production file changed: '.$path);
 $ancestor=dirname($target);while(!file_exists($ancestor))$ancestor=dirname($ancestor);
 if(realpath($ancestor)!==$production&&!str_starts_with(realpath($ancestor),$production.'/'))throw new RuntimeException('Target outside application.');
}
$env=Dotenv\Dotenv::parse(file_get_contents($production.'/.env'));
$database=$env['DB_DATABASE']??'';
if(!$database||str_contains($database,'test')||str_contains($database,'review')||!preg_match('/^[a-zA-Z0-9_]+$/',$database))throw new RuntimeException('Unexpected production database.');
$pdo=new PDO('mysql:host='.($env['DB_HOST']??'127.0.0.1').';port='.($env['DB_PORT']??3306).';dbname='.$database,$env['DB_USERNAME'],$env['DB_PASSWORD'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$author=$pdo->query("SELECT id FROM users WHERE role='admin' AND is_active=1 AND deleted_at IS NULL ORDER BY id LIMIT 1")->fetchColumn();
if(!$author)throw new RuntimeException('Active admin required.');
umask(0077);$backup='/home/adminnazh/tjkt-lms-backups/'.date('Ymd-His');mkdir($backup,0700,true);
$log=$backup.'/activation.log';
$run=function(array $args,bool $required=true)use($production,$log){
 $pipes=[];$process=proc_open($args,[0=>['pipe','r'],1=>['file',$log,'a'],2=>['file',$log,'a']],$pipes,$production);
 if(!is_resource($process))throw new RuntimeException('Cannot start command.');fclose($pipes[0]);$code=proc_close($process);
 if($required&&$code!==0)throw new RuntimeException('Activation command failed. See private server backup log.');
 return $code;
};
$copied=[];$down=false;
try{
 $run(['php8.3','artisan','down','--retry=60']);$down=true;
 $quote=fn($value)=>'"'.str_replace(['\\','"',"\n","\r"],['\\\\','\\"','\\n','\\r'],(string)$value).'"';
 $client="[client]\n";
 foreach(['host'=>'DB_HOST','port'=>'DB_PORT','user'=>'DB_USERNAME','password'=>'DB_PASSWORD'] as $key=>$setting)$client.=$key.'='.$quote($env[$setting]??($key==='port'?3306:'127.0.0.1'))."\n";
 $config=$backup.'/dump-client.cnf';file_put_contents($config,$client);chmod($config,0600);
 $pipes=[];$process=proc_open(['mysqldump','--defaults-extra-file='.$config,'--single-transaction','--no-tablespaces',$database],[0=>['pipe','r'],1=>['file',$backup.'/database.sql','w'],2=>['file',$log,'a']],$pipes,$production);
 if(!is_resource($process))throw new RuntimeException('Database backup could not start.');fclose($pipes[0]);$dumpCode=proc_close($process);unlink($config);
 if($dumpCode!==0||filesize($backup.'/database.sql')<100)throw new RuntimeException('Database backup failed; no code changes applied.');
 foreach($manifest['changes'] as $change){
  $path=$change['path'];$target=$production.'/'.$path;
  if(is_file($target)){$saved=$backup.'/code/'.$path;if(!is_dir(dirname($saved)))mkdir(dirname($saved),0700,true);copy($target,$saved);}
 }
 file_put_contents($backup.'/release-manifest.json',json_encode($manifest,JSON_PRETTY_PRINT));
 umask(0022);
 foreach($manifest['changes'] as $change){
  $target=$production.'/'.$change['path'];if(!is_dir(dirname($target)))mkdir(dirname($target),0755,true);
  if(!copy($review.'/'.$change['path'],$target))throw new RuntimeException('Copy failed.');chmod($target,0644);$copied[]=$change;
 }
 $run(['php8.3','artisan','migrate','--force','--path=database/migrations/2026_10_28_000001_add_learning_packages.php']);
 $run(['php8.3','artisan','learning:import-packages','--author='.(int)$author]);
 $run(['php8.3','artisan','optimize:clear']);$run(['php8.3','artisan','view:cache']);
 $run(['php8.3','artisan','up']);$down=false;
 $result=['activated'=>true,'backup'=>$backup,'changedFiles'=>count($copied),'packagesRegistered'=>(int)$pdo->query('SELECT COUNT(*) FROM modules WHERE package_slug IS NOT NULL')->fetchColumn(),'newPackagesPublished'=>(int)$pdo->query("SELECT COUNT(*) FROM modules WHERE package_slug IS NOT NULL AND status='published'")->fetchColumn(),'reviewAccountsCopied'=>false];
 file_put_contents($review.'/storage/app/review-artifacts/activation-result.json',json_encode($result,JSON_PRETTY_PRINT));
 echo json_encode($result,JSON_PRETTY_PRINT)."\n";
}catch(Throwable $error){
 foreach(array_reverse($copied) as $change){$target=$production.'/'.$change['path'];$saved=$backup.'/code/'.$change['path'];if(is_file($saved))copy($saved,$target);elseif(is_file($target)&&hash_file('sha256',$target)===$change['after'])unlink($target);}
 if($copied)$run(['php8.3','artisan','optimize:clear'],false);
 if($down)$run(['php8.3','artisan','up'],false);
 throw new RuntimeException('Activation stopped; code restored where needed. Database additions retained to protect results. Backup: '.$backup,0,$error);
}
