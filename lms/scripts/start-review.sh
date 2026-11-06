#!/bin/sh
set -eu
cd /home/adminnazh/tjkt-lms-review-20261028
if test -f review.pid && kill -0 "$(cat review.pid)" 2>/dev/null; then
 echo 'Review already running.'
else
 nohup sh scripts/serve-review.sh >storage/logs/review-server.log 2>&1 &
 echo $! >review.pid
 echo 'Review bound to 127.0.0.1:18087.'
fi
