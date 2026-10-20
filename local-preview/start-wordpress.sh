#!/bin/sh
set -eu

# Refresh only application assets; retain WordPress configuration and uploads.
cp -a /opt/uminion-preview/. /var/www/html/
exec docker-entrypoint.sh "$@"
