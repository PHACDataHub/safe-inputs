# 1. For build React app
FROM node:lts AS build

# Set working directory
WORKDIR /app

 
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# Same as npm install
RUN npm ci

COPY . /app

RUN npm run build

# 2. For Nginx setup
FROM docker.io/library/nginx:alpine

RUN chown -R nginx:nginx /var/cache/nginx /var/run/ 

# Copy config nginx
COPY --from=build /app/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=build /app/dist .

USER nginx
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]