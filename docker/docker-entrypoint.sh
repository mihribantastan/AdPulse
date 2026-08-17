#!/bin/sh
set -e

# Render "PORT" ortam değişkenini dinamik atar (build zamanında bilinmiyor).
# Worker (Python) ve backend (Laravel) aynı konteynerde çalıştığı için
# birbirlerine Docker içi bir hostname yerine 127.0.0.1 üzerinden ulaşıyor.
export PORT="${PORT:-8000}"
export INTERNAL_APP_URL="http://127.0.0.1:${PORT}"
export LARAVEL_URL="http://127.0.0.1:${PORT}/api/campaigns/complete"
export LARAVEL_PUBLISH_URL="http://127.0.0.1:${PORT}/api/campaigns/publish-complete"

cd /var/www/html
php artisan migrate --force
php artisan storage:link || true

exec supervisord -c /etc/supervisor/supervisord.conf
