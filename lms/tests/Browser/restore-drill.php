<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (getenv('TJKT_ALLOW_RESTORE_DRILL') !== '1') {
    throw new RuntimeException('Explicit restore-drill authorization required.');
}
if (config('database.connections.mysql.database') !== 'tjkt_learning') {
    throw new RuntimeException('Expected dedicated TJKT source database.');
}
$context = json_decode(file_get_contents($argv[1]), true, flags: JSON_THROW_ON_ERROR);
if (! str_starts_with($context['tag'], 'UAT-')) {
    throw new RuntimeException('UAT marker required.');
}
$socket = '/home/adminnazh/.local/mysql-pkl/mysql.sock';
$target = 'tjkt_learning_restore_'.date('Ymd_His');
$directory = '/tmp/'.$target;
umask(0077);
mkdir($directory, 0700);
mkdir($directory.'/evidence', 0700);
$dump = $directory.'/database.sql';
$output = fopen($dump, 'wb');
$errors = '';
$process = new Process(['mariadb-dump', '--socket='.$socket, '-uroot', '--single-transaction', '--skip-lock-tables', '--no-tablespaces', '--hex-blob', '--skip-comments', 'tjkt_learning']);
$process->setTimeout(120);
try {
    $process->run(function ($type, $text) use ($output, &$errors) {
        if ($type === Process::OUT) {
            fwrite($output, $text);
        } else {
            $errors .= $text;
        }
    });
} finally {
    fclose($output);
}
if (! $process->isSuccessful()) {
    throw new RuntimeException('Dump failed: '.$errors);
}
if (preg_match('/^(?:USE\s|CREATE\s+DATABASE)/mi', file_get_contents($dump))) {
    throw new RuntimeException('Refusing dump containing database-selection statements.');
}
$root = new PDO('mysql:unix_socket='.$socket.';charset=utf8mb4', 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$root->exec('CREATE DATABASE `'.$target.'` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
$input = fopen($dump, 'rb');
$restore = new Process(['mariadb', '--socket='.$socket, '-uroot', '--database='.$target]);
$restore->setInput($input);
$restore->setTimeout(120);
try {
    $restore->mustRun();
} finally {
    fclose($input);
}
$tables = ['users', 'rombels', 'modules', 'module_sections', 'activities', 'activity_versions', 'quiz_attempts', 'quiz_answers', 'interactive_attempts', 'interactive_events', 'lab_submissions', 'lab_submission_files', 'lab_assessments'];
$counts = [];
foreach ($tables as $table) {
    $source = (int) $root->query('SELECT COUNT(*) FROM `tjkt_learning`.`'.$table.'`')->fetchColumn();
    $restored = (int) $root->query('SELECT COUNT(*) FROM `'.$target.'`.`'.$table.'`')->fetchColumn();
    if ($source !== $restored) {
        throw new RuntimeException('Count mismatch: '.$table);
    }$counts[$table] = $restored;
}
$files = $root->query('SELECT f.*,s.user_id FROM `'.$target.'`.lab_submission_files f JOIN `'.$target.'`.lab_submissions s ON s.id=f.lab_submission_id')->fetchAll(PDO::FETCH_ASSOC);
foreach ($files as $file) {
    if (! preg_match('/^[a-f0-9]{48}\.(pdf|png|jpg|webp)$/', $file['path'])) {
        throw new RuntimeException('Unexpected evidence path.');
    }
    $source = (int) $file['user_id'] === (int) $context['accounts']['student']['id'] ? '/tmp/tjkt-uat-artifacts/bukti-uat.pdf' : storage_path('app/private/lab-evidence/'.$file['path']);
    if (! is_readable($source)) {
        throw new RuntimeException('Operator access is needed to back up evidence #'.$file['id']);
    }
    if (! hash_equals($file['sha256'], hash_file('sha256', $source))) {
        throw new RuntimeException('Evidence backup hash mismatch.');
    }
    copy($source, $directory.'/evidence/'.$file['path']);
    chmod($directory.'/evidence/'.$file['path'], 0600);
}
config(['database.connections.restore' => array_merge(config('database.connections.mysql'), ['database' => $target, 'username' => 'root', 'password' => '', 'unix_socket' => $socket]), 'filesystems.disks.evidence.root' => $directory.'/evidence']);
DB::setDefaultConnection('restore');
Storage::forgetDisk('evidence');
$code = Artisan::call('learning:check-evidence', ['--hash' => true]);
if ($code !== 0) {
    throw new RuntimeException('Restored evidence integrity check failed.');
}
$manifest = ['created_at' => gmdate('c'), 'source_database' => 'tjkt_learning', 'restore_database' => $target, 'dump_sha256' => hash_file('sha256', $dump), 'tables_verified' => $counts, 'evidence_verified' => count($files), 'integrity_output' => trim(Artisan::output()), 'runtime_configuration_changed' => false];
file_put_contents($directory.'/manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo json_encode($manifest,JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n";
echo 'Private backup and manifest: '.$directory."\n";
