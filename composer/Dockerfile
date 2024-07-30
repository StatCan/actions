FROM php:8.3-fpm-alpine3.17

LABEL "name"="Composer action"
LABEL "maintainer"="William Hearn <william.hearn@canada.ca>"
LABEL "version"="1.0.4"

LABEL "com.github.actions.icon"="package"
LABEL "com.github.actions.color"="green"
LABEL "com.github.actions.name"="Composer"
LABEL "com.github.actions.description"="This is an Action to execute composer commands."

RUN set -xe && \
    apk add --no-cache \
        patch \
        git \
        libzip \
    && \
    apk add --no-cache --virtual .build-deps \
        libzip-dev \
        zlib-dev \
    && \
    docker-php-ext-install -j "$(getconf _NPROCESSORS_ONLN)" \
        zip \
    && \
    apk del --no-cache .build-deps \
    && \
    php -m

RUN set -xe && \
    apk add --no-cache \
        freetype \
        libpng \
        libjpeg-turbo \
        freetype-dev \
        libpng-dev \
        libjpeg-turbo-dev \
    && \
    docker-php-ext-configure gd \
        --with-freetype=/usr/include/ \
        --with-jpeg=/usr/include/ \
    && \
    docker-php-ext-install -j "$(getconf _NPROCESSORS_ONLN)" \
        gd \
    && \
    apk del --no-cache \
        freetype-dev \
        libpng-dev \
        libjpeg-turbo-dev \
    && \
    php -m

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MEMORY_LIMIT=-1 \
    COMPOSER_HOME=/tmp \
    COMPOSER_PATH=/usr/local/bin/composer \
    COMPOSER_VERSION=2.4.4

COPY --from=composer:2.4.4 /usr/bin/composer /usr/local/bin/composer

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

WORKDIR /app

USER 1001

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["--version"]
