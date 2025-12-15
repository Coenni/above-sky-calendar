#!/bin/bash

# Start Local Development Environment
# This script starts all services for local development with hot-reload enabled

set -e

echo "🚀 Starting Above Sky Calendar - Local Development Environment"
echo "=============================================================="

# Check if .env file exists, if not copy from .env.example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration values"
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend:        http://localhost:4200"
echo "   Backend API:     http://localhost:8080/api"
echo "   Swagger UI:      http://localhost:8080/swagger-ui.html"
echo "   H2 Console:      http://localhost:8080/h2-console"
echo "   PostgreSQL:      localhost:5432"
echo "   Kibana:          http://localhost:5601"
echo "   Elasticsearch:   http://localhost:9200"
echo "   MailHog UI:      http://localhost:8025"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🛑 Stop all services:"
echo "   ./scripts/stop-all.sh"
echo ""
