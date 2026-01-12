#!/bin/sh
set -e

# Replace placeholder with actual environment variable
if [ -n "$API_BASE_URL" ]; then
    echo "Setting API_BASE_URL to: $API_BASE_URL"
    find /usr/share/nginx/html -type f -name '*.js' -exec sed -i "s|__API_BASE_URL__|$API_BASE_URL|g" {} +
fi

# Start nginx
exec nginx -g 'daemon off;'