## Issue Found: OpenAPI Generator Requires Java

The build is failing because `@openapitools/openapi-generator-cli` requires Java to run:

```
Error: /bin/sh: java: not found
    at /app/node_modules/@openapitools/openapi-generator-cli/main.js
```

## Required Fix:

Both Dockerfiles need to use `timbru31/java-node:17-jre-18` instead of `node:18-alpine`.

### 1. Revert `frontend/Dockerfile` (production)
```dockerfile
# Stage 1: Build
FROM timbru31/java-node:17-jre-18 AS build  # ✅ Need Java for openapi-generator-cli
WORKDIR /build
```
(Keep the rest as-is - the two-stage build is correct)

### 2. Fix `frontend/Dockerfile.dev` (local development)
```dockerfile
# Development Dockerfile for frontend with hot-reload support
FROM timbru31/java-node:17-jre-18  # ✅ Need Java for openapi-generator-cli
WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy OpenAPI spec
COPY spec.yaml /spec.yaml

# Generate API clients (requires Java!)
RUN npm run generate-api

# Copy frontend source
COPY frontend/ .

# Expose port for development server
EXPOSE 4200

# Start development server with host binding for Docker
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
```

The original assumption that "Java is not needed for frontend" was incorrect - the OpenAPI generator CLI tool is a Java application wrapped in an npm package.