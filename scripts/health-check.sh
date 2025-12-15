#!/bin/bash

# Health Check Script for Above Sky Calendar
# This script checks the health of all services

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost}"
PROMETHEUS_URL="${PROMETHEUS_URL:-http://localhost:9090}"
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"

echo -e "${GREEN}=== Above Sky Calendar Health Check ===${NC}"
echo -e "${BLUE}Timestamp: $(date)${NC}"
echo ""

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n -e "${YELLOW}Checking ${service_name}...${NC} "
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null); then
        if [ "$response" -eq "$expected_status" ]; then
            echo -e "${GREEN}✓ Healthy (HTTP $response)${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ Warning (HTTP $response)${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ Unreachable${NC}"
        return 2
    fi
}

# Function to check Docker container health
check_container() {
    local container_name=$1
    
    echo -n -e "${YELLOW}Checking container ${container_name}...${NC} "
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        local status=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null)
        local health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null)
        
        if [ "$status" = "running" ]; then
            if [ "$health" = "healthy" ] || [ "$health" = "<no value>" ]; then
                echo -e "${GREEN}✓ Running${NC}"
                return 0
            else
                echo -e "${YELLOW}⚠ Running but unhealthy (${health})${NC}"
                return 1
            fi
        else
            echo -e "${RED}✗ Not running (${status})${NC}"
            return 2
        fi
    else
        echo -e "${RED}✗ Not found${NC}"
        return 2
    fi
}

# Track overall health
CRITICAL_FAILURES=0
WARNINGS=0

# Check Docker containers
echo -e "${BLUE}=== Docker Containers ===${NC}"
check_container "backend" || [ $? -eq 1 ] && ((WARNINGS++)) || ((CRITICAL_FAILURES++))
check_container "frontend" || [ $? -eq 1 ] && ((WARNINGS++)) || ((CRITICAL_FAILURES++))
check_container "nginx" || [ $? -eq 1 ] && ((WARNINGS++)) || ((CRITICAL_FAILURES++))
check_container "db" || [ $? -eq 1 ] && ((WARNINGS++)) || ((CRITICAL_FAILURES++))
check_container "redis" || [ $? -eq 1 ] && ((WARNINGS++)) || true
echo ""

# Check application endpoints
echo -e "${BLUE}=== Application Endpoints ===${NC}"
check_service "Backend Health" "${BACKEND_URL}/api/actuator/health" 200 || [ $? -eq 1 ] && ((WARNINGS++)) || ((CRITICAL_FAILURES++))
check_service "Backend Info" "${BACKEND_URL}/api/actuator/info" 200 || [ $? -eq 1 ] && ((WARNINGS++)) || true
check_service "Frontend" "${FRONTEND_URL}" 200 || [ $? -eq 1 ] && ((WARNINGS++)) || ((CRITICAL_FAILURES++))
echo ""

# Check monitoring services
echo -e "${BLUE}=== Monitoring Services ===${NC}"
check_service "Prometheus" "${PROMETHEUS_URL}/-/healthy" 200 || [ $? -eq 1 ] && ((WARNINGS++)) || true
check_service "Grafana" "${GRAFANA_URL}/api/health" 200 || [ $? -eq 1 ] && ((WARNINGS++)) || true
echo ""

# Check system resources
echo -e "${BLUE}=== System Resources ===${NC}"

# Check disk space
echo -n -e "${YELLOW}Checking disk space...${NC} "
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✓ OK (${DISK_USAGE}% used)${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠ Warning (${DISK_USAGE}% used)${NC}"
    ((WARNINGS++))
else
    echo -e "${RED}✗ Critical (${DISK_USAGE}% used)${NC}"
    ((CRITICAL_FAILURES++))
fi

# Check memory usage
echo -n -e "${YELLOW}Checking memory usage...${NC} "
if command -v free &> /dev/null; then
    MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100)}')
    if [ "$MEMORY_USAGE" -lt 80 ]; then
        echo -e "${GREEN}✓ OK (${MEMORY_USAGE}% used)${NC}"
    elif [ "$MEMORY_USAGE" -lt 90 ]; then
        echo -e "${YELLOW}⚠ Warning (${MEMORY_USAGE}% used)${NC}"
        ((WARNINGS++))
    else
        echo -e "${RED}✗ Critical (${MEMORY_USAGE}% used)${NC}"
        ((CRITICAL_FAILURES++))
    fi
else
    echo -e "${YELLOW}⚠ Unable to check${NC}"
fi

# Check database connectivity
echo -n -e "${YELLOW}Checking database connectivity...${NC} "
if docker exec db pg_isready -U "${DB_USER:-admin}" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database accepting connections${NC}"
else
    echo -e "${RED}✗ Database not accepting connections${NC}"
    ((CRITICAL_FAILURES++))
fi

echo ""

# Summary
echo -e "${BLUE}=== Health Check Summary ===${NC}"
echo -e "Timestamp: $(date)"
echo -e "Critical Failures: $CRITICAL_FAILURES"
echo -e "Warnings: $WARNINGS"
echo ""

# Determine exit status
if [ $CRITICAL_FAILURES -gt 0 ]; then
    echo -e "${RED}✗ CRITICAL: System has critical issues${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "1. Check container logs: docker-compose logs"
    echo "2. Check individual service: docker logs <container_name>"
    echo "3. Restart services: docker-compose restart"
    echo "4. Review Grafana dashboard for metrics"
    exit 2
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ WARNING: System has warnings${NC}"
    echo ""
    echo -e "${YELLOW}Recommended Actions:${NC}"
    echo "1. Review warnings above"
    echo "2. Check application logs"
    echo "3. Monitor system resources"
    exit 1
else
    echo -e "${GREEN}✓ ALL SYSTEMS HEALTHY${NC}"
    exit 0
fi
