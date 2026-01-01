# Stage 1: Build the React frontend
FROM node:20 AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the frontend source code and build
COPY . .
RUN npm run build

# Stage 2: Setup PHP, Apache, and Python
FROM php:8.2-apache

# Install Python inside the same container
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite so React's frontend routing works flawlessly
RUN a2enmod rewrite && a2enmod headers

# Enable AllowOverride so .htaccess rules are respected
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Set working directory to Apache document root
WORKDIR /var/www/html

# Copy the compiled React static files from the build stage
COPY --from=build /app/dist/ ./

# Copy the PHP backend code
COPY backend/ ./backend/

# Install your Python AI dependencies if you have a requirements.txt file
RUN if [ -f /var/www/html/requirements.txt ]; then \
    pip3 install --no-cache-dir --break-system-packages -r /var/www/html/requirements.txt; \
    fi

# Set correct permissions for Apache
RUN chown -R www-data:www-data /var/www/html

# Use a startup script to set the PORT at runtime before starting Apache
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]