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

