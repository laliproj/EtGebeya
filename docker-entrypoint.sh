#!/bin/bash
set -e

# Render provides a dynamic PORT environment variable.
# Apache needs to be configured to listen on it at runtime.
PORT="${PORT:-80}"

# Update Apache to listen on the correct port
sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf
sed -i "s/:80>/:$PORT>/" /etc/apache2/sites-available/000-default.conf

echo "Starting Apache on port $PORT..."

# Start Apache in the foreground
exec apache2-foreground
