FROM wordpress:php8.2-apache

RUN a2enmod rewrite proxy proxy_http proxy_wstunnel

COPY ./apache-pantry-proxy.conf /etc/apache2/conf-available/pantry-proxy.conf
RUN a2enconf pantry-proxy

COPY ./apache-uhub-proxy.conf /etc/apache2/conf-available/uhub-proxy.conf
RUN a2enconf uhub-proxy

# Copy the Astra child theme from the local project directory (kept up to date by git pull)
COPY ./wp-content/themes/astra-child /var/www/html/wp-content/themes/astra-child

COPY ./includes/pantry-finder/dist /var/www/html/pantry-finder/dist

COPY ./includes/uhub/dist /var/www/html/uhub/dist

