FROM wordpress:php8.2-apache

RUN a2enmod rewrite

# Install git, clone the repo, and copy only the astra-child theme
RUN apt-get update && apt-get install -y git \
  && git clone https://github.com/uminionunion/UminionsWebsite.git /tmp/UminionsWebsite \
  && cp -r /tmp/UminionsWebsite/wp-content/themes/astra-child /var/www/html/wp-content/themes/ \
  && rm -rf /tmp/UminionsWebsite
