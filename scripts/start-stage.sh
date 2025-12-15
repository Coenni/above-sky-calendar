#!/bin/bash

# Start Staging Environment
# This script starts all services for the staging environment

set -e

echo "🚀 Starting Above Sky Calendar - Staging Environment"
echo "===================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required configuration."
    echo "You can use .env.example as a template."
    exit 1
fi

# Validate required environment variables
required_vars=("DB_USER" "DB_PASSWORD" "MAIL_HOST" "MAIL_PORT" "JWT_SECRET")
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        echo "❌ Error: ${var} not found in .env file"
        exit 1
    fi
done

# Start services
echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.yml -f docker-compose.stage.yml up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "🌐 Access URLs:"
echo "   Application:     https://stage.aboveskycalendar.com"
echo "   Kibana:          http://[server-ip]:5601"
echo ""
echo "📊 View logs:"
echo "   docker compose logs -f [service-name]"
echo ""
echo "🛑 Stop all services:"
echo "   ./scripts/stop-all.sh"
echo ""
