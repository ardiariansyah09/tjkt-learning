<?php
if(($argv[1]??'')!=='--apply')throw new RuntimeException('Explicit --apply required.');
$review='/home/adminnazh/tjkt-lms-review-20261028';$production='/var/www/tjkt-learning';
if(realpath(__DIR__.'/..')!==$review)throw new RuntimeException('Review checkout required.');
if(hash_file('sha256',$production.'/app/Services/LearningPackage.php')!=='50d37bca48309b5a8a7fe0e624b63d5bc73d0a5de9d8883e4e37c340566b2669')throw new RuntimeException('Production service changed since review.');
require $production.'/vendor/autoload.php';$env=Dotenv\Dotenv::parse(file_get_contents($production.'/.env'));
$manifest=json_decode(file_get_contents($review.'/storage/app/learning-pack/manifest.json'),true,512,JSON_THROW_ON_ERROR);$release=$manifest[0]['contentVersion'];if(!preg_match('/^[a-f0-9]{64}$/',$release))throw new RuntimeException('Invalid release.');
if(hash_file('sha256',$production.'/storage/app/learning-pack/manifest.json')!=='deabb3cc6f738f772c139a25bb29d22401c1266db27460d04597b825a2cbc289')throw new RuntimeException('Production content changed since review.');
$files=['storage/app/learning-pack/manifest.json'];
umask(0077);$backup='/home/adminnazh/tjkt-lms-backups/hypervisor-20261030-'.date('Ymd-His');mkdir($backup,0700,true);$log=$backup.'/activation.log';
$run=function(array $args,bool $required=true)use($production,$log){$pipes=[];$p=proc_open($args,[0=>['pipe','r'],1=>['file',$log,'a'],2=>['file',$log,'a']],$pipes,$production);if(!is_resource($p))throw new RuntimeException('Command could not start.');fclose($pipes[0]);$code=proc_close($p);if($required&&$code)throw new RuntimeException('Command failed. Inspect private activation log.');};
$down=false;$copied=[];
try{
 $run(['php8.3','artisan','down','--retry=30']);$down=true;
 $quote=fn($v)=>'"'.str_replace(['\\','"',"\n","\r"],['\\\\','\\"','\\n','\\r'],(string)$v).'"';$config=$backup.'/client.cnf';$ini="[client]\n";foreach(['host'=>'DB_HOST','port'=>'DB_PORT','user'=>'DB_USERNAME','password'=>'DB_PASSWORD'] as $key=>$setting)$ini.=$key.'='.$quote($env[$setting]??($key==='port'?3306:'127.0.0.1'))."\n";file_put_contents($config,$ini);
 $pipes=[];$p=proc_open(['mysqldump','--defaults-file='.$config,'--single-transaction','--no-tablespaces',$env['DB_DATABASE']],[0=>['pipe','r'],1=>['file',$backup.'/database.sql','w'],2=>['file',$log,'a']],$pipes,$production);if(!is_resource($p))throw new RuntimeException('Backup failed.');fclose($pipes[0]);$exit=proc_close($p);unlink($config);if($exit||filesize($backup.'/database.sql')<100)throw new RuntimeException('Backup incomplete.');
 foreach($files as $file){$saved=$backup.'/code/'.$file;if(is_file($production.'/'.$file)){if(!is_dir(dirname($saved)))mkdir(dirname($saved),0700,true);copy($production.'/'.$file,$saved);}}
 umask(0022);
 $destination=$production.'/storage/app/learning-pack/releases/'.$release.'/site';$source=$review.'/storage/app/learning-pack/releases/'.$release.'/site';
 foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($source,FilesystemIterator::SKIP_DOTS)) as $file){if(!$file->isFile()||$file->isLink())continue;$relative=substr($file->getPathname(),strlen($source)+1);$target=$destination.'/'.$relative;if(is_file($target)){if(hash_file('sha256',$target)!==hash_file('sha256',$file->getPathname()))throw new RuntimeException('Existing immutable release differs.');continue;}if(!is_dir(dirname($target)))mkdir(dirname($target),0755,true);if(!copy($file->getPathname(),$target))throw new RuntimeException('Release copy failed.');chmod($target,0644);}
 foreach($files as $file){$target=$production.'/'.$file;if(!is_dir(dirname($target)))mkdir(dirname($target),0755,true);if(!copy($review.'/'.$file,$target))throw new RuntimeException('Code copy failed.');chmod($target,0644);$copied[]=$file;}
 $run(['php8.3',$review.'/scripts/update-curriculum-release.php',$production,'--apply']);
 $run(['php8.3','artisan','optimize:clear']);$run(['php8.3','artisan','view:cache']);$run(['php8.3','artisan','up']);$down=false;
 $result=['activated'=>true,'backup'=>$backup,'release'=>$release,'learnerRecordsPreserved'=>true,'strategy'=>'Compatible content revision; prior assessment versions and snapshots unchanged.'];file_put_contents($review.'/storage/app/review-artifacts/hypervisor-20261030-activation.json',json_encode($result,JSON_PRETTY_PRINT));echo json_encode($result,JSON_PRETTY_PRINT)."\n";
}catch(Throwable $error){foreach(array_reverse($copied) as $file){$saved=$backup.'/code/'.$file;if(is_file($saved))copy($saved,$production.'/'.$file);elseif(is_file($production.'/'.$file))unlink($production.'/'.$file);}if($copied)$run(['php8.3','artisan','optimize:clear'],false);if($down)$run(['php8.3','artisan','up'],false);throw new RuntimeException('Activation stopped; code pointer restored. Private backup: '.$backup,0,$error);}
