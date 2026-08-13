FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
        libpq-dev \
        libzip-dev \
        unzip \
        git \
        $PHPIZE_DEPS \
        libssl-dev \
        libbrotli-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip pcntl \
    && pecl install swoole \
    && docker-php-ext-enable swoole \
    && rm -rf /var/lib/apt/lists/*

# Kampanya görsel/video yüklemeleri için varsayılan PHP limitleri (2M) yetersiz
RUN { \
        echo 'upload_max_filesize=100M'; \
        echo 'post_max_size=110M'; \
        echo 'memory_limit=256M'; \
    } > /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 8000
