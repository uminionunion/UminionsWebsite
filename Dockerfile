FROM wordpress:php8.2-apache

RUN a2enmod rewrite

# Copy the Astra child theme from the local project directory (kept up to date by git pull)
COPY ./wp-content/themes/astra-child /var/www/html/wp-content/themes/astra-child
