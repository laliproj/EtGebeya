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
