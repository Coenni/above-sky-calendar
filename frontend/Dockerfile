# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /build

# Copy OpenAPI spec
COPY spec.yaml .

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Generate API clients
RUN npm run generate-api

# Copy frontend source and build
COPY frontend/ .
RUN npm run build -- --configuration production

# Stage 2: Runtime with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx config and static files
RUN rm -rf ./* /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /build/dist/above-sky-calendar-frontend/browser ./

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
