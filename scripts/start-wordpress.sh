#!/bin/sh
set -eu

# Refresh only application assets; retain WordPress configuration and uploads.
cp -a /opt/uminion-assets/. /var/www/html/
exec docker-entrypoint.sh "$@"
