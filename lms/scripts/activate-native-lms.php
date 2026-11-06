<?php
if(($argv[1]??'')!=='--apply')throw new RuntimeException('Explicit --apply required.');
$review='/home/adminnazh/tjkt-lms-review-20261028';$production='/var/www/tjkt-learning';
if(realpath(__DIR__.'/..')!==$review)throw new RuntimeException('Review path required.');
require $production.'/vendor/autoload.php';$env=Dotenv\Dotenv::parse(file_get_contents($production.'/.env'));
$files=['app/Services/ScopedLessonStyles.php','app/Services/NativeLessonRenderer.php','app/Http/Controllers/Learning/PackageController.php','resources/views/layouts/app.blade.php','resources/views/learning/package-lesson.blade.php','routes/web.php','public/assets/lms-course.css','public/assets/lms-course-bridge.js'];
$pdo=new PDO('mysql:host='.($env['DB_HOST']??'127.0.0.1').';port='.($env['DB_PORT']??3306).';dbname='.$env['DB_DATABASE'],$env['DB_USERNAME'],$env['DB_PASSWORD'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$digest=function()use($pdo){$out=[];foreach(['package_snapshots','module_progress','module_assignments','learning_package_definitions'] as $table){$rows=$pdo->query('SELECT * FROM '.$table.' ORDER BY '.($table==='learning_package_definitions'?'version':'id'))->fetchAll(PDO::FETCH_ASSOC);$out[$table]=['rows'=>count($rows),'sha256'=>hash('sha256',json_encode($rows))];}return $out;};
umask(0077);$backup='/home/adminnazh/tjkt-lms-backups/native-lms-'.date('Ymd-His');mkdir($backup,0700,true);$log=$backup.'/activation.log';
$run=function(array $args,bool $required=true)use($production,$log){$pipes=[];$p=proc_open($args,[0=>['pipe','r'],1=>['file',$log,'a'],2=>['file',$log,'a']],$pipes,$production);if(!is_resource($p))throw new RuntimeException('Command could not start.');fclose($pipes[0]);$code=proc_close($p);if($required&&$code!==0)throw new RuntimeException('Command failed; see private backup log.');};
$copied=[];$down=false;
try{
 $run(['php8.3','artisan','down','--retry=30']);$down=true;$before=$digest();
 $quote=fn($v)=>'"'.str_replace(['\\','"',"\n","\r"],['\\\\','\\"','\\n','\\r'],(string)$v).'"';$client="[client]\n";
 foreach(['host'=>'DB_HOST','port'=>'DB_PORT','user'=>'DB_USERNAME','password'=>'DB_PASSWORD'] as $key=>$setting)$client.=$key.'='.$quote($env[$setting]??($key==='port'?3306:'127.0.0.1'))."\n";
 $config=$backup.'/dump-client.cnf';file_put_contents($config,$client);$pipes=[];$p=proc_open(['mysqldump','--defaults-file='.$config,'--single-transaction','--no-tablespaces',$env['DB_DATABASE']],[0=>['pipe','r'],1=>['file',$backup.'/database.sql','w'],2=>['file',$log,'a']],$pipes,$production);if(!is_resource($p))throw new RuntimeException('Backup could not start.');fclose($pipes[0]);$exit=proc_close($p);unlink($config);if($exit||filesize($backup.'/database.sql')<100)throw new RuntimeException('Database backup failed.');
 foreach($files as $file){if(is_file($production.'/'.$file)){$saved=$backup.'/code/'.$file;if(!is_dir(dirname($saved)))mkdir(dirname($saved),0700,true);copy($production.'/'.$file,$saved);}}
 umask(0022);
 foreach($files as $file){$target=$production.'/'.$file;if(!is_dir(dirname($target)))mkdir(dirname($target),0755,true);if(!copy($review.'/'.$file,$target))throw new RuntimeException('Copy failed.');chmod($target,0644);$copied[]=$file;}
 $run(['php8.3','artisan','optimize:clear']);$run(['php8.3','artisan','view:cache']);$after=$digest();if($before!==$after)throw new RuntimeException('Learning records changed unexpectedly.');
 $run(['php8.3','artisan','up']);$down=false;
 $result=['nativeLmsActivated'=>true,'backup'=>$backup,'files'=>count($files),'learningDataUnchanged'=>true,'records'=>$after];file_put_contents($review.'/storage/app/review-artifacts/native-lms-activation.json',json_encode($result,JSON_PRETTY_PRINT));echo json_encode($result,JSON_PRETTY_PRINT)."\n";
}catch(Throwable $error){foreach(array_reverse($copied) as $file){$saved=$backup.'/code/'.$file;if(is_file($saved))copy($saved,$production.'/'.$file);elseif(is_file($production.'/'.$file))unlink($production.'/'.$file);}if($copied)$run(['php8.3','artisan','optimize:clear'],false);if($down)$run(['php8.3','artisan','up'],false);throw new RuntimeException('Native LMS activation stopped; previous code restored. Backup: '.$backup,0,$error);}
