#!/bin/bash

# Rollback Script for Above Sky Calendar
# This script quickly reverts to the previous deployment state

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT="${ENVIRONMENT:-prod}"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml"

echo -e "${RED}=== Above Sky Calendar Rollback ===${NC}"
echo -e "${YELLOW}⚠️  WARNING: This will revert to the previous deployment ⚠️${NC}"
echo ""

# Check if last deployment info exists
if [ ! -f ".last_deployment.json" ]; then
    echo -e "${YELLOW}No deployment information found${NC}"
    echo "Manual rollback required"
    exit 1
fi

# Display last deployment info
echo -e "${BLUE}Last successful deployment:${NC}"
cat ".last_deployment.json"
echo ""

# Confirmation
read -p "Do you want to proceed with rollback? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}[1/6] Starting rollback process...${NC}"

# Check for previous git commit
CURRENT_COMMIT=$(git rev-parse HEAD)
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

echo -e "${BLUE}Current commit: ${CURRENT_COMMIT:0:8}${NC}"
echo -e "${BLUE}Rolling back to: ${PREVIOUS_COMMIT:0:8}${NC}"

# Create emergency backup of current database
echo -e "${YELLOW}[2/6] Creating emergency database backup...${NC}"
EMERGENCY_BACKUP="./backups/emergency_pre_rollback_$(date +%Y%m%d_%H%M%S).sql.gz"

if docker-compose $COMPOSE_FILES exec -T db pg_dump -U "${DB_USER:-admin}" -d "${DB_NAME:-aboveskycalendar}" | gzip > "$EMERGENCY_BACKUP"; then
    echo -e "${GREEN}Emergency backup created: ${EMERGENCY_BACKUP}${NC}"
else
    echo -e "${YELLOW}Warning: Could not create emergency backup${NC}"
    read -p "Continue rollback anyway? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Rollback cancelled${NC}"
        exit 0
    fi
fi

# Revert git repository
echo -e "${YELLOW}[3/6] Reverting code to previous commit...${NC}"
git reset --hard "$PREVIOUS_COMMIT"
echo -e "${GREEN}Code reverted to ${PREVIOUS_COMMIT:0:8}${NC}"

# Pull Docker images for previous version
echo -e "${YELLOW}[4/6] Pulling previous Docker images...${NC}"
docker-compose $COMPOSE_FILES pull
echo -e "${GREEN}Previous images pulled${NC}"

# Check for database restore
echo -e "${YELLOW}[5/6] Checking for database rollback...${NC}"

# Find most recent backup before current deployment
LATEST_BACKUP=$(find ./backups -name "backup_*.sql.gz" -type f -not -name "emergency_*" | sort -r | head -1)

if [ -n "$LATEST_BACKUP" ]; then
    echo -e "${BLUE}Found backup: $(basename "$LATEST_BACKUP")${NC}"
    read -p "Do you want to restore this database backup? (yes/no): " restore_db
    
    if [ "$restore_db" = "yes" ]; then
        echo -e "${YELLOW}Restoring database...${NC}"
        
        # Terminate connections
        docker-compose $COMPOSE_FILES exec -T db psql -U "${DB_USER:-admin}" -d postgres -c \
            "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME:-aboveskycalendar}' AND pid <> pg_backend_pid();" \
            > /dev/null 2>&1 || true
        
        # Restore database
        if gunzip -c "$LATEST_BACKUP" | docker-compose $COMPOSE_FILES exec -T db psql -U "${DB_USER:-admin}" -d "${DB_NAME:-aboveskycalendar}" > /dev/null 2>&1; then
            echo -e "${GREEN}Database restored successfully${NC}"
        else
            echo -e "${RED}Database restore failed${NC}"
            echo -e "${YELLOW}You may need to manually restore from: ${LATEST_BACKUP}${NC}"
        fi
    else
        echo -e "${YELLOW}Skipping database restore${NC}"
    fi
else
    echo -e "${YELLOW}No previous database backup found${NC}"
fi

# Restart services
echo -e "${YELLOW}[6/6] Restarting services...${NC}"

# Stop all services
docker-compose $COMPOSE_FILES down

# Start services in order
echo -e "${YELLOW}Starting database...${NC}"
docker-compose $COMPOSE_FILES up -d db

echo -e "${YELLOW}Waiting for database...${NC}"
sleep 10

echo -e "${YELLOW}Starting backend...${NC}"
docker-compose $COMPOSE_FILES up -d backend

echo -e "${YELLOW}Waiting for backend...${NC}"
sleep 15

# Check backend health
HEALTH_CHECK_URL="http://localhost:8080/api/actuator/health"
echo -e "${YELLOW}Checking backend health...${NC}"

for i in {1..30}; do
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Backend health check failed${NC}"
        echo -e "${RED}Rollback may have failed${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Attempt $i/30: Waiting for backend...${NC}"
    sleep 5
done

# Start remaining services
echo -e "${YELLOW}Starting remaining services...${NC}"
docker-compose $COMPOSE_FILES up -d

# Display service status
echo ""
echo -e "${BLUE}Service Status:${NC}"
docker-compose $COMPOSE_FILES ps

# Rollback summary
echo ""
echo -e "${GREEN}=== Rollback Complete ===${NC}"
echo -e "${BLUE}Reverted to commit: ${PREVIOUS_COMMIT:0:8}${NC}"
echo -e "${BLUE}Emergency backup: ${EMERGENCY_BACKUP}${NC}"
echo -e "${BLUE}Time: $(date)${NC}"
echo ""
echo -e "${YELLOW}Post-Rollback Actions:${NC}"
echo "1. Verify application functionality"
echo "2. Check application logs: ./scripts/logs.sh"
echo "3. Monitor Grafana dashboard"
echo "4. If issues persist:"
echo "   - Check emergency backup: ${EMERGENCY_BACKUP}"
echo "   - Review container logs: docker-compose logs"
echo ""
echo -e "${YELLOW}To move forward again:${NC}"
echo "git reset --hard ${CURRENT_COMMIT:0:8}"
echo "./scripts/deploy.sh"

# Save rollback info
cat > ".last_rollback.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "environment": "${ENVIRONMENT}",
  "from_commit": "${CURRENT_COMMIT}",
  "to_commit": "${PREVIOUS_COMMIT}",
  "emergency_backup": "${EMERGENCY_BACKUP}"
}
EOF

echo ""
echo -e "${GREEN}Rollback completed!${NC}"
