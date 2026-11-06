<?php
require __DIR__.'/../vendor/autoload.php';
if(realpath(__DIR__.'/..')!=='/home/adminnazh/tjkt-lms-review-20261028')throw new RuntimeException('Review only.');
$env=Dotenv\Dotenv::parse(file_get_contents('/var/www/tjkt-learning/.env'));
$pdo=new PDO('mysql:host='.($env['DB_HOST']??'127.0.0.1').';port='.($env['DB_PORT']??3306).';dbname=tjkt_learning_testing',$env['DB_USERNAME'],$env['DB_PASSWORD'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
if($pdo->query('SELECT DATABASE()')->fetchColumn()!=='tjkt_learning_testing')throw new RuntimeException('Test database mismatch.');
$lines=['APP_NAME="TJKT Test"','APP_ENV=testing','APP_DEBUG=false','APP_KEY=base64:'.base64_encode(random_bytes(32)),'APP_URL=http://127.0.0.1:18087','DB_CONNECTION=mysql','DB_DATABASE=tjkt_learning_testing','SESSION_DRIVER=array','CACHE_STORE=array','QUEUE_CONNECTION=sync'];
foreach(['DB_HOST','DB_PORT','DB_USERNAME','DB_PASSWORD'] as $key)$lines[]=$key.'="'.str_replace(['\\','"'],['\\\\','\\"'],$env[$key]??'').'"';
file_put_contents(__DIR__.'/../.env.testing',implode("\n",$lines)."\n");chmod(__DIR__.'/../.env.testing',0600);
echo "Test configuration targets only tjkt_learning_testing on application database instance. No production table read or changed.\n";
