#!/usr/bin/env bash
set -e

# Railway provides $PORT; default fallback for local testing
export PORT=${PORT:-8000}

# Apply DB migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --log-file -
