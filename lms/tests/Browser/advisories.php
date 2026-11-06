<?php

use Composer\Semver\Semver;

// Official anonymous Packagist API fallback for a broken system DNS resolver.
// TLS hostname/certificate verification remains enabled; no system resolver is changed.
$composer = getenv('TJKT_COMPOSER_PHAR') ?: '/home/adminnazh/.local/bin/composer';
if (! str_ends_with($composer, '.phar')) {
    copy($composer, '/tmp/tjkt-composer-audit.phar');
    $composer = '/tmp/tjkt-composer-audit.phar';
}
require 'phar://'.$composer.'/vendor/autoload.php';
$address = getenv('TJKT_PACKAGIST_ADDRESS');
if (! filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
    throw new RuntimeException('Resolve a current Packagist IPv4 address before running.');
}
$lock = json_decode(file_get_contents(dirname(__DIR__, 2).'/composer.lock'), true, flags: JSON_THROW_ON_ERROR);
$packages = array_merge($lock['packages'], $lock['packages-dev'] ?? []);
$all = [];
foreach (array_chunk(array_column($packages, 'name'), 20) as $names) {
    $url = 'https://packagist.org/api/security-advisories/?'.http_build_query(['packages' => $names]);
    $curl = curl_init($url);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 30, CURLOPT_RESOLVE => ['packagist.org:443:'.$address], CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2]);
    $body = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    if ($body === false || $status !== 200) {
        throw new RuntimeException('Advisory API failed: HTTP '.$status.' '.curl_error($curl));
    }
    $response = json_decode($body, true, flags: JSON_THROW_ON_ERROR);
    $all = array_merge($all, $response['advisories'] ?? []);
}
$affected = [];
$unknown = [];
foreach ($packages as $p) {
    if (! array_key_exists($p['name'], $all)) {
        $unknown[] = $p['name'];

        continue;
    }
    foreach ($all[$p['name']] as $advisory) {
        if (Semver::satisfies($p['version'], $advisory['affectedVersions'])) {
            $affected[] = ['package' => $p['name'], 'version' => $p['version'], 'id' => $advisory['advisoryId'], 'title' => $advisory['title'], 'link' => $advisory['link'], 'affected' => $advisory['affectedVersions']];
        }
    }
}
$result = ['checked_at' => gmdate('c'), 'method' => 'Packagist official API with TLS verification and Composer Semver', 'packages' => count($packages), 'affected' => $affected, 'unknown' => $unknown];
file_put_contents('/tmp/tjkt-advisory-result.json', json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
chmod('/tmp/tjkt-advisory-result.json', 0600);
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n";
exit($affected ? 1 : ($unknown ? 2 : 0));
