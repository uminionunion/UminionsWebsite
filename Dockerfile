# --- Build Stage for uHub React App ---
FROM node:22-alpine AS uhub-builder
WORKDIR /app
# Copy both apps to resolve cross-imports and install all needed deps
COPY ./includes ./includes
WORKDIR /app/includes/uhub
RUN npm install
# Also install pantry-finder deps because uhub imports from it
RUN cd ../pantry-finder && npm install
WORKDIR /app/includes/uhub
RUN npm run build

# --- Final Production Image ---
FROM wordpress:php8.2-apache

RUN a2enmod rewrite proxy proxy_http proxy_wstunnel

COPY ./apache-pantry-proxy.conf /etc/apache2/conf-available/pantry-proxy.conf
RUN a2enconf pantry-proxy

COPY ./apache-uhub-proxy.conf /etc/apache2/conf-available/uhub-proxy.conf
RUN a2enconf uhub-proxy

# Copy the Astra child theme from the local project directory (kept up to date by git pull)
COPY ./wp-content/themes/astra-child /var/www/html/wp-content/themes/astra-child

COPY ./includes/pantry-finder/dist /var/www/html/pantry-finder/dist

# COPY the freshly compiled assets from the builder stage instead of the local dist folder
COPY --from=uhub-builder /app/dist /var/www/html/uhub/dist

COPY ./includes/uhub/public/EmojisForUminionWebsite /var/www/html/EmojisForUminionWebsite
COPY ./includes/uhub/public/defaultUminionUassets /var/www/html/defaultUminionUassets

