#!/bin/bash

# Reset Local Database
# WARNING: This will delete all data in the local database!

set -e

echo "⚠️  WARNING: This will delete all data in the local database!"
echo "============================================================"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "🗑️  Stopping database container..."
docker compose stop db

echo "🗑️  Removing database volume..."
docker volume rm above-sky-calendar_postgres_data 2>/dev/null || true

echo "🚀 Starting database container..."
docker compose up -d db

echo ""
echo "✅ Database reset successfully!"
echo ""
echo "💡 The backend will automatically create tables on next startup"
echo "💡 Start the backend with: docker compose up -d backend"
echo ""
