<?php
require __DIR__.'/../vendor/autoload.php';
if(realpath(__DIR__.'/..')!=='/home/adminnazh/tjkt-lms-review-20261028')throw new RuntimeException('Review only.');
$env=Dotenv\Dotenv::parse(file_get_contents('/var/www/tjkt-learning/.env'));
$pdo=new PDO('mysql:host='.($env['DB_HOST']??'127.0.0.1').';port='.($env['DB_PORT']??3306),$env['DB_USERNAME'],$env['DB_PASSWORD'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
echo 'Application database connection port: '.($env['DB_PORT']??3306)."\n";
$names=$pdo->query('SHOW DATABASES')->fetchAll(PDO::FETCH_COLUMN);
echo 'Existing test database available: '.(in_array('tjkt_learning_testing',$names,true)?'yes':'no')."\n";
echo 'Review database available: '.(in_array('tjkt_learning_review_20261028',$names,true)?'yes':'no')."\n";
