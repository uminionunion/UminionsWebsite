#!/bin/sh
set -eu

# Ensure target directories exist before copying to prevent "No such file or directory" errors
mkdir -p /var/www/html/wp-content/themes/
mkdir -p /var/www/html/includes/pantry-finder/
mkdir -p /var/www/html/includes/uhub/dist
mkdir -p /var/www/html/includes/uhub/public/

# Copy only specific assets to avoid overwriting WordPress core files
cp -a /opt/uminion-assets/wp-content/themes/astra-child /var/www/html/wp-content/themes/
cp -a /opt/uminion-assets/pantry-finder/dist /var/www/html/includes/pantry-finder/dist
cp -a /opt/uminion-assets/uhub/dist /var/www/html/includes/uhub/dist
cp -a /opt/uminion-assets/EmojisForUminionWebsite /var/www/html/includes/uhub/public/
cp -a /opt/uminion-assets/defaultUminionUassets /var/www/html/includes/uhub/public/

exec docker-entrypoint.sh "$@"
