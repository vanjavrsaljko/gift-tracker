#!/bin/sh

# Replace placeholder with actual environment variable
if [ -n "$REACT_APP_API_URL" ]; then
  echo "Setting API URL to: $REACT_APP_API_URL"
  sed -i "s|REACT_APP_API_URL_PLACEHOLDER|$REACT_APP_API_URL|g" /usr/share/nginx/html/config.js
else
  echo "Warning: REACT_APP_API_URL not set, using default"
  sed -i "s|REACT_APP_API_URL_PLACEHOLDER|http://localhost:5000/api|g" /usr/share/nginx/html/config.js
fi

# Start nginx
exec nginx -g 'daemon off;'
