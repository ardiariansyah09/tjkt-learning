#!/bin/sh
set -eu
cd /home/adminnazh/tjkt-lms-review-20261028
touch database/testing-review.sqlite
DB_DATABASE="$PWD/database/testing-review.sqlite" php -d extension="$PWD/runtime/extracted/usr/lib/php/20240924/pdo_sqlite.so" artisan migrate --force
php artisan view:cache
find app routes database/migrations -name '*.php' -exec php -l {} \; > storage/logs/review-php-lint.txt
DB_DATABASE="$PWD/database/testing-review.sqlite" php -d extension="$PWD/runtime/extracted/usr/lib/php/20240924/pdo_sqlite.so" vendor/bin/phpunit --testsuite Feature --log-junit storage/logs/review-tests.xml
