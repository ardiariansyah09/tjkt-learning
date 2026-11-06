<?php
// Review-only SQLite configuration. No production configuration is read.
$root=realpath(__DIR__.'/..');
if ($root !== '/home/adminnazh/tjkt-lms-review-20261028') throw new RuntimeException('Direktori review tidak sesuai.');
$database=$root.'/database/review.sqlite';
if(!file_exists($database))touch($database);
chmod($database,0600);
if(!file_exists($root.'/.env')){
 $lines=['APP_NAME="TJKT Learning Review"','APP_ENV=local','APP_DEBUG=false','APP_KEY=base64:'.base64_encode(random_bytes(32)),'APP_URL=http://127.0.0.1:18087','DB_CONNECTION=sqlite','DB_DATABASE='.$database,'SESSION_DRIVER=file','CACHE_STORE=file','QUEUE_CONNECTION=sync','SESSION_COOKIE=tjkt_review_session'];
 file_put_contents($root.'/.env',implode("\n",$lines)."\n");chmod($root.'/.env',0600);
}
echo "Review uses isolated SQLite; production configuration is untouched.\n";
