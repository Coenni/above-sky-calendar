#!/bin/bash

# Stop All Docker Services
# This script stops and removes all Docker containers, networks, and volumes

set -e

echo "🛑 Stopping Above Sky Calendar Services"
echo "========================================"

# Stop and remove containers, networks, images, and volumes
docker-compose -f docker-compose.yml down

echo ""
echo "✅ All services stopped successfully!"
echo ""
echo "💡 To remove volumes (database data), run:"
echo "   docker-compose -f docker-compose.yml down -v"
echo ""
echo "💡 To start services again:"
echo "   ./scripts/start-local.sh    (for local development)"
echo "   ./scripts/start-stage.sh    (for staging)"
echo ""
