#!/bin/sh
set -e

if [ -z "$API_BASE_URL" ]; then
    echo "WARNING: API_BASE_URL environment variable is not set"
    echo "Application will show configuration error screen"
else
    echo "Setting API_BASE_URL to: $API_BASE_URL"
    sed -i "s|__API_BASE_URL__|$API_BASE_URL|g" /usr/share/nginx/html/config.js
fi

# Start nginx
exec nginx -g 'daemon off;'