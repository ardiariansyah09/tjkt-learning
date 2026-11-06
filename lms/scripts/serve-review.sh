#!/bin/sh
set -eu
cd /home/adminnazh/tjkt-lms-review-20261028
extension="$PWD/runtime/extracted/usr/lib/php/20240924/pdo_sqlite.so"
cd public
exec php -d extension="$extension" -S 127.0.0.1:18087 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
