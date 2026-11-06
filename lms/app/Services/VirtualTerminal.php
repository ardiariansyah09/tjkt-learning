<?php

namespace App\Services;

/** A closed virtual machine model. No process, host filesystem, socket or eval access. */
class VirtualTerminal
{
    public const CONFIG = '/etc/ssh/sshd_config';

    public const DEFAULT_CONFIG = "# Debian 12 — konfigurasi virtual\nPort 22\nPermitRootLogin prohibit-password\nPubkeyAuthentication yes\nPasswordAuthentication yes\nKbdInteractiveAuthentication no\nUsePAM yes\n";

    public function initial(string $scenario): array
    {
        $installed = $scenario !== 'guided';
        $config = self::DEFAULT_CONFIG;
        if ($scenario === 'troubleshooting') {
            $config = str_replace('Port 22', 'Port 2222', $config);
        }

        return ['cwd' => '/root', 'updated' => false, 'installed' => $installed, 'running' => $installed, 'enabled' => $installed, 'files' => [self::CONFIG => $config, '/etc/os-release' => "PRETTY_NAME=Debian GNU/Linux 12 (bookworm)\n", '/home/siswa/.ssh/authorized_keys' => ''], 'permissions' => [], 'active_config' => $installed ? $this->parse($config)['config'] : null, 'firewall' => $scenario === 'troubleshooting', 'allowed_ports' => [22], 'key_generated' => false, 'tested' => false, 'logs' => ['Debian 12 virtual siap.']];
    }

    public function parse(string $text): array
    {
        $config = ['port' => 22, 'permitrootlogin' => 'prohibit-password', 'pubkeyauthentication' => 'yes', 'passwordauthentication' => 'yes', 'kbdinteractiveauthentication' => 'no', 'usepam' => 'yes'];
        $seen = [];
        foreach (preg_split('/\R/', $text) as $n => $line) {
            $line = trim(explode('#', $line, 2)[0]);
            if ($line === '') {
                continue;
            }
            $parts = preg_split('/\s+/', $line);
            $key = strtolower(array_shift($parts));
            if (count($parts) !== 1 || ! array_key_exists($key, $config)) {
                return ['error' => 'Baris '.($n + 1).': direktif atau jumlah argumen tidak didukung simulator.'];
            }
            $v = $parts[0];
            if ($key === 'port') {
                if (isset($seen[$key])) {
                    return ['error' => 'Simulator mendukung satu direktif Port. Multi-port OpenSSH tidak dimodelkan.'];
                }
                if (! ctype_digit($v) || (int) $v < 1 || (int) $v > 65535) {
                    return ['error' => 'Port harus 1–65535.'];
                } $v = (int) $v;
            } elseif (! in_array($v, $key === 'permitrootlogin' ? ['yes', 'no', 'prohibit-password'] : ['yes', 'no'], true)) {
                return ['error' => 'Nilai '.$key.' tidak valid.'];
            }
            if (! isset($seen[$key])) {
                $config[$key] = $v;
                $seen[$key] = true;
            }
        }

        return ['config' => $config];
    }

    public function command(array $s, string $command): array
    {
        $command = trim($command);
        $out = '';
        if (preg_match('/[;&|`$<>\r\n\\\\]/', $command)) {
            return [$s, 'Operator shell tidak didukung. Jalankan satu perintah virtual.'];
        }
        $parts = preg_split('/\s+/', $command);
        if (($parts[0] ?? '') === 'sudo') {
            array_shift($parts);
            $command = implode(' ', $parts);
        }
        if ($command === 'help') {
            $out = 'Perintah: help, pwd, whoami, hostname, ls, cd /root, cat PATH, nano /etc/ssh/sshd_config (editor di bawah), apt update, apt install openssh-server, systemctl start|stop|restart|reload|enable|status ssh, sshd -t, sshd -T, ss -tlnp, ip a, ping 192.168.10.2, ufw status|enable|allow PORT/tcp, ssh-keygen, ssh-copy-id siswa@192.168.10.2, ssh [-p PORT] [-i ~/.ssh/id_ed25519] siswa@192.168.10.2, journalctl -u ssh. Semua keluaran merupakan simulasi.';
        } elseif ($command === 'pwd') {
            $out = $s['cwd'];
        } elseif ($command === 'whoami') {
            $out = 'root (konsol lokal virtual)';
        } elseif ($command === 'hostname') {
            $out = 'debian12-lab';
        } elseif ($command === 'ip a' || $command === 'ip addr') {
            $out = 'eth0: inet 192.168.10.2/24 — klien 192.168.10.10';
        } elseif ($command === 'ping 192.168.10.2' || $command === 'ping -c 4 192.168.10.2') {
            $out = '4 paket terkirim, 4 diterima. ICMP tersambung; layanan SSH belum tentu tersedia.';
        } elseif (preg_match('/^cd (\/root|\/etc\/ssh|\/home\/siswa)$/', $command, $m)) {
            $s['cwd'] = $m[1];
            $out = 'Direktori virtual: '.$s['cwd'];
        } elseif ($command === 'ls' || $command === 'ls /etc/ssh') {
            $out = $s['cwd'] === '/etc/ssh' || str_contains($command, '/etc/ssh') ? 'sshd_config' : '/etc /home /root';
        } elseif (preg_match('/^cat (\S+)$/', $command, $m)) {
            $path = $this->path($s, $m[1]);
            $out = $s['files'][$path] ?? 'Berkas virtual tidak ditemukan.';
        } elseif ($command === 'nano '.self::CONFIG) {
            $out = 'Gunakan editor konfigurasi virtual di bawah terminal, lalu simpan dan jalankan sshd -t.';
        } elseif (in_array($command, ['apt update', 'apt-get update'], true)) {
            $s['updated'] = true;
            $out = 'Indeks paket Debian virtual diperbarui.';
        } elseif (preg_match('/^apt(?:-get)? (?:-y )?install (?:-y )?openssh-server(?: -y)?$/', $command)) {
            if (! $s['updated'] && ! $s['installed']) {
                $out = 'Jalankan apt update terlebih dahulu.';
            } else {
                $s['installed'] = true;
                $s['enabled'] = true;
                $s['tested'] = false;
                $parsed = $this->parse($s['files'][self::CONFIG]);
                $s['running'] = isset($parsed['config']);
                $s['active_config'] = $parsed['config'] ?? null;
                $out = $s['running'] ? 'openssh-server terpasang; ssh.service aktif dan enabled (model lab).' : 'Paket terpasang, tetapi service gagal start: '.$parsed['error'];
            }
        } elseif (preg_match('/^systemctl (start|stop|restart|reload|enable|status) ssh(?:\.service)?$/', $command, $m)) {
            if (! $s['installed']) {
                $out = 'Unit ssh.service tidak ditemukan. Instal openssh-server.';
            } elseif ($m[1] === 'status') {
                $out = 'ssh.service: '.($s['running'] ? 'active (running)' : 'inactive (dead)').'; '.($s['enabled'] ? 'enabled' : 'disabled');
            } elseif ($m[1] === 'enable') {
                $s['enabled'] = true;
                $out = 'ssh.service enabled.';
            } elseif ($m[1] === 'stop') {
                $s['running'] = false;
                $s['tested'] = false;
                $out = 'ssh.service stopped.';
            } else {
                $p = $this->parse($s['files'][self::CONFIG]);
                if (isset($p['error'])) {
                    $out = 'Konfigurasi tidak diterapkan: '.$p['error'];
                } elseif ($m[1] === 'reload' && ! $s['running']) {
                    $out = 'Service belum aktif; gunakan start.';
                } else {
                    $s['running'] = true;
                    $s['active_config'] = $p['config'];
                    $s['tested'] = false;
                    $out = 'ssh.service: konfigurasi diterapkan.';
                }
            }
        } elseif (in_array($command, ['sshd -t', '/usr/sbin/sshd -t', 'sshd -T', '/usr/sbin/sshd -T'], true)) {
            if (! $s['installed']) {
                $out = 'sshd: command not found';
            } else {
                $p = $this->parse($s['files'][self::CONFIG]);
                $out = $p['error'] ?? (str_ends_with($command, '-T') ? implode("\n", array_map(fn ($k, $v) => $k.' '.$v, array_keys($p['config']), $p['config'])) : 'Konfigurasi valid (sshd -t berhasil tanpa error).');
            }
        } elseif (in_array($command, ['ss -tlnp', 'ss -tulpn', 'ss -lntp'], true)) {
            $out = $s['running'] ? 'LISTEN 0 128 0.0.0.0:'.$s['active_config']['port'].' users: sshd' : 'Tidak ada listener SSH.';
        } elseif ($command === 'ufw enable') {
            $s['firewall'] = true;
            $out = 'Firewall virtual aktif.';
        } elseif ($command === 'ufw status' || $command === 'ufw status verbose') {
            $out = 'Status: '.($s['firewall'] ? 'active' : 'inactive').'; allow TCP: '.implode(', ', $s['allowed_ports']);
        } elseif (preg_match('/^ufw allow ([0-9]{1,5})(?:\/tcp)?$/', $command, $m) && (int) $m[1] > 0 && (int) $m[1] <= 65535) {
            $s['allowed_ports'] = array_values(array_unique([...$s['allowed_ports'], (int) $m[1]]));
            $out = 'Aturan TCP virtual ditambahkan.';
        } elseif (in_array($command, ['ssh-keygen', 'ssh-keygen -t ed25519'], true)) {
            $s['key_generated'] = true;
            $out = 'Pasangan kunci Ed25519 virtual dibuat pada klien. Tidak ada kunci nyata yang dihasilkan.';
        } elseif ($command === 'ssh-copy-id siswa@192.168.10.2' || $command === 'ssh-copy-id -p 2222 siswa@192.168.10.2') {
            $port = str_contains($command, '2222') ? 2222 : 22;
            $err = $this->connectionError($s, $port, false);
            if (! $s['key_generated']) {
                $out = 'Buat kunci virtual dengan ssh-keygen -t ed25519 dahulu.';
            } elseif ($err) {
                $out = $err;
            } else {
                $s['files']['/home/siswa/.ssh/authorized_keys'] = 'ssh-ed25519 KUNCI_VIRTUAL_SISWA';
                $s['permissions'] = ['directory' => '700', 'authorized_keys' => '600'];
                $out = 'Kunci publik virtual dipasang untuk siswa. Jangan menyalin private key.';
            }
        } elseif (preg_match('/^ssh (?:-p ([0-9]{1,5}) )?(?:(-i ~\/\.ssh\/id_ed25519) )?siswa@192\.168\.10\.2$/', $command, $m)) {
            $port = ($m[1] ?? '') !== '' ? (int) $m[1] : 22;
            $key = ($m[2] ?? '') !== '';
            $err = $this->connectionError($s, $port, $key);
            if ($err) {
                $out = $err;
            } else {
                $s['tested'] = true;
                $out = 'Koneksi SSH virtual berhasil sebagai siswa menggunakan '.($key ? 'public key' : 'password akun lab tersimulasi').'.';
            }
        } elseif ($command === 'journalctl -u ssh' || $command === 'journalctl -u ssh --no-pager') {
            $out = implode("\n", $s['logs']);
        } else {
            $out = 'Perintah belum didukung simulator. Ketik help untuk daftar perintah.';
        }
        $s['logs'] = array_slice([...$s['logs'], $command.' → '.$out], -30);

        return [$s, $out];
    }

    private function path(array $s, string $p): string
    {
        return str_starts_with($p, '/') ? $p : rtrim($s['cwd'], '/').'/'.$p;
    }

    private function connectionError(array $s, int $port, bool $key): ?string
    {
        if (! $s['running'] || $port !== ($s['active_config']['port'] ?? 0)) {
            return 'Connection refused: periksa service dan port listener.';
        }
        if ($s['firewall'] && ! in_array($port, $s['allowed_ports'], true)) {
            return 'Connection timed out: firewall memblokir port tujuan.';
        }
        if ($key && (! $s['key_generated'] || ! $s['files']['/home/siswa/.ssh/authorized_keys'] || $s['active_config']['pubkeyauthentication'] !== 'yes')) {
            return 'Permission denied (publickey): periksa kunci dan PubkeyAuthentication.';
        }
        if (! $key && $s['active_config']['passwordauthentication'] !== 'yes') {
            return 'Permission denied: autentikasi password dinonaktifkan. Gunakan public key.';
        }

        return null;
    }

    public function validateState(array $s, string $scenario): array
    {
        $config = $s['active_config'] ?? [];
        $parsed = $this->parse($s['files'][self::CONFIG]);
        $checks = ['Paket OpenSSH Server terpasang' => $s['installed'], 'Konfigurasi berkas valid' => ! isset($parsed['error']), 'Service SSH aktif' => $s['running'], 'Service aktif saat boot' => $s['enabled'], 'Konfigurasi terbaru diterapkan' => isset($parsed['config']) && $config === $parsed['config']];
        if ($scenario !== 'guided') {
            $checks['Port SSH 2222'] = ($config['port'] ?? 0) === 2222;
            $checks['Firewall mengizinkan TCP 2222'] = $s['firewall'] && in_array(2222, $s['allowed_ports'], true);
        }
        if ($scenario === 'hardening') {
            $checks['Login root dilarang'] = ($config['permitrootlogin'] ?? '') === 'no';
            $checks['Autentikasi password dimatikan'] = ($config['passwordauthentication'] ?? '') === 'no' && ($config['kbdinteractiveauthentication'] ?? '') === 'no';
            $checks['Autentikasi public key tersedia'] = ($config['pubkeyauthentication'] ?? '') === 'yes' && $s['key_generated'] && $s['files']['/home/siswa/.ssh/authorized_keys'] !== '';
        }
        $checks['Koneksi klien berhasil diuji'] = $s['tested'];

        return $checks;
    }
}
