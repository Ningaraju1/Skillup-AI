#!/bin/bash

# Exit on error
set -e

# Run Django migrations
echo "Running Django Migrations..."
python manage.py migrate

# Collect static files
echo "Collecting Django Static Files..."
python manage.py collectstatic --noinput

# Start Gunicorn server (binding to localhost on port 8000)
echo "Starting Gunicorn WSGI server..."
gunicorn backend.wsgi:application --bind 127.0.0.1:8000 --workers 2 --timeout 120 &

# Start Nginx (listening on Hugging Face port 7860)
echo "Starting Nginx Reverse Proxy..."
nginx -g "daemon off;"
