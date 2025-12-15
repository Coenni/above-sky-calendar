#!/bin/bash

# Deployment Script for Above Sky Calendar
# This script handles zero-downtime deployment with health checks

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
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=5

echo -e "${GREEN}=== Above Sky Calendar Deployment ===${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Timestamp: $(date)${NC}"
echo ""

# Function to check health
check_health() {
    local service=$1
    local url=$2
    local max_retries=${3:-30}
    
    echo -e "${YELLOW}Checking health of ${service}...${NC}"
    
    for i in $(seq 1 $max_retries); do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ ${service} is healthy${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}Attempt $i/$max_retries: Waiting for ${service}...${NC}"
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    echo -e "${RED}✗ ${service} failed health check${NC}"
    return 1
}

# Pre-deployment checks
echo -e "${YELLOW}[1/8] Running pre-deployment checks...${NC}"

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check if required files exist
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found${NC}"
    exit 1
fi

if [ ! -f "docker-compose.${ENVIRONMENT}.yml" ]; then
    echo -e "${RED}Error: docker-compose.${ENVIRONMENT}.yml not found${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env.${ENVIRONMENT}" ] && [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

echo -e "${GREEN}Pre-deployment checks passed${NC}"

# Backup current deployment state
echo -e "${YELLOW}[2/8] Saving current deployment state...${NC}"

BACKUP_STATE_FILE=".deployment_state_$(date +%Y%m%d_%H%M%S).json"
docker-compose $COMPOSE_FILES ps --format json > "$BACKUP_STATE_FILE" 2>/dev/null || true
echo -e "${GREEN}Deployment state saved to ${BACKUP_STATE_FILE}${NC}"

# Pull latest code
echo -e "${YELLOW}[3/8] Pulling latest code...${NC}"
git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}Current branch: ${CURRENT_BRANCH}${NC}"

if [ "$ENVIRONMENT" = "prod" ]; then
    git pull origin main
elif [ "$ENVIRONMENT" = "stage" ]; then
    git pull origin develop
else
    git pull origin "$CURRENT_BRANCH"
fi

CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo -e "${GREEN}Updated to commit: ${CURRENT_COMMIT}${NC}"

# Pull latest Docker images
echo -e "${YELLOW}[4/8] Pulling Docker images...${NC}"
docker-compose $COMPOSE_FILES pull
echo -e "${GREEN}Docker images pulled${NC}"

# Run database migrations
echo -e "${YELLOW}[5/8] Running database migrations...${NC}"

if docker-compose $COMPOSE_FILES run --rm backend ./mvnw flyway:migrate; then
    echo -e "${GREEN}Database migrations completed${NC}"
else
    echo -e "${YELLOW}Warning: Database migration failed or no migrations to run${NC}"
fi

# Build and start services with zero-downtime
echo -e "${YELLOW}[6/8] Deploying services...${NC}"

# Deploy backend first
echo -e "${YELLOW}Deploying backend...${NC}"
docker-compose $COMPOSE_FILES up -d --no-deps --build backend

# Wait for backend health check
sleep 10
if check_health "Backend" "http://localhost:8080/api/actuator/health" 30; then
    echo -e "${GREEN}Backend deployed successfully${NC}"
else
    echo -e "${RED}Backend deployment failed${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    ./scripts/rollback.sh
    exit 1
fi

# Deploy frontend
echo -e "${YELLOW}Deploying frontend...${NC}"
docker-compose $COMPOSE_FILES up -d --no-deps --build frontend

# Deploy nginx
echo -e "${YELLOW}Deploying nginx...${NC}"
docker-compose $COMPOSE_FILES up -d --no-deps --build nginx

# Wait for nginx health check
sleep 5
if check_health "Nginx" "http://localhost/api/actuator/health" 20; then
    echo -e "${GREEN}Nginx deployed successfully${NC}"
else
    echo -e "${RED}Nginx deployment failed${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    ./scripts/rollback.sh
    exit 1
fi

# Ensure all services are running
echo -e "${YELLOW}[7/8] Ensuring all services are up...${NC}"
docker-compose $COMPOSE_FILES up -d

# Run post-deployment health checks
echo -e "${YELLOW}[8/8] Running post-deployment health checks...${NC}"

# Check backend
if ! check_health "Backend" "http://localhost:8080/api/actuator/health" 15; then
    echo -e "${RED}Post-deployment health check failed${NC}"
    exit 1
fi

# Check frontend (via nginx)
if ! check_health "Frontend" "http://localhost" 10; then
    echo -e "${YELLOW}Warning: Frontend health check failed${NC}"
fi

# Display service status
echo ""
echo -e "${BLUE}Service Status:${NC}"
docker-compose $COMPOSE_FILES ps

# Clean up old images
echo ""
echo -e "${YELLOW}Cleaning up old Docker images...${NC}"
docker image prune -f

# Deployment summary
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Commit: ${CURRENT_COMMIT}${NC}"
echo -e "${BLUE}Time: $(date)${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Monitor application logs: ./scripts/logs.sh"
echo "2. Run smoke tests to verify functionality"
echo "3. Check Grafana dashboard for metrics"
echo "4. If issues occur, run: ./scripts/rollback.sh"
echo ""
echo -e "${GREEN}Deployment succeeded!${NC}"

# Save deployment info
cat > ".last_deployment.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "environment": "${ENVIRONMENT}",
  "commit": "${CURRENT_COMMIT}",
  "branch": "${CURRENT_BRANCH}",
  "status": "success"
}
EOF
