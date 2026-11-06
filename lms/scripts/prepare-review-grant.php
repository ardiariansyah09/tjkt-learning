<?php
// Only prepares SQL granting access to the separate review database.
require __DIR__.'/../vendor/autoload.php';
if(realpath(__DIR__.'/..')!=='/home/adminnazh/tjkt-lms-review-20261028')throw new RuntimeException('Review path required.');
$env=Dotenv\Dotenv::parse(file_get_contents('/var/www/tjkt-learning/.env'));
$pdo=new PDO('mysql:host='.($env['DB_HOST']??'127.0.0.1').';port='.($env['DB_PORT']??3306),$env['DB_USERNAME'],$env['DB_PASSWORD'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$account=$pdo->query('SELECT CURRENT_USER()')->fetchColumn();
$at=strrpos($account,'@');$user=substr($account,0,$at);$host=substr($account,$at+1);
$sql='CREATE DATABASE IF NOT EXISTS tjkt_learning_review_20261028 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'."\n".'GRANT ALL PRIVILEGES ON tjkt_learning_review_20261028.* TO '.$pdo->quote($user).'@'.$pdo->quote($host).';'."\n";
file_put_contents(__DIR__.'/../review-grant.sql',$sql);chmod(__DIR__.'/../review-grant.sql',0600);
echo 'Prepared review-grant.sql for existing account '.$account.'. No grants executed; no credentials printed.'."\n";
