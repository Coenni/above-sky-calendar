#!/bin/bash

# View Logs for Specific Service
# Usage: ./scripts/logs.sh [service-name] [options]
# Example: ./scripts/logs.sh backend -f --tail=100

set -e

SERVICE=$1
shift # Remove first argument

if [ -z "$SERVICE" ]; then
    echo "📋 Available services:"
    echo "   - backend"
    echo "   - frontend"
    echo "   - nginx"
    echo "   - db"
    echo "   - elasticsearch"
    echo "   - logstash"
    echo "   - kibana"
    echo "   - mailhog"
    echo ""
    echo "Usage: ./scripts/logs.sh [service-name] [options]"
    echo ""
    echo "Examples:"
    echo "   ./scripts/logs.sh backend -f              # Follow backend logs"
    echo "   ./scripts/logs.sh backend --tail=100      # Show last 100 lines"
    echo "   ./scripts/logs.sh backend -f --tail=50    # Follow with last 50 lines"
    echo ""
    exit 0
fi

echo "📊 Showing logs for: $SERVICE"
echo "================================"
docker compose logs "$@" "$SERVICE"
