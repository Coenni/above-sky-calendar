#!/bin/bash

# Database Restore Script for PostgreSQL
# This script restores a database from a compressed backup file

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DB_CONTAINER="${DB_CONTAINER:-db}"
DB_NAME="${DB_NAME:-aboveskycalendar}"
DB_USER="${DB_USER:-admin}"
DB_PASSWORD="${DB_PASSWORD}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

echo -e "${GREEN}=== Database Restore Script ===${NC}"

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -1h "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# If only filename provided, assume it's in BACKUP_DIR
if [ ! -f "$BACKUP_FILE" ]; then
    BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILE}"
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

echo -e "${YELLOW}Backup file: ${BACKUP_FILE}${NC}"

# Verify checksum if available
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "$CHECKSUM_FILE" ]; then
    echo -e "${YELLOW}Verifying backup checksum...${NC}"
    
    if sha256sum -c "$CHECKSUM_FILE" > /dev/null 2>&1; then
        echo -e "${GREEN}Checksum verification passed${NC}"
    else
        echo -e "${RED}Error: Checksum verification failed!${NC}"
        echo -e "${RED}The backup file may be corrupted.${NC}"
        read -p "Do you want to continue anyway? (yes/no): " response
        if [ "$response" != "yes" ]; then
            echo -e "${YELLOW}Restore cancelled${NC}"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}Warning: No checksum file found, skipping verification${NC}"
fi

# Check if database container is running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo -e "${RED}Error: Database container '$DB_CONTAINER' is not running${NC}"
    exit 1
fi

# Warning and confirmation
echo -e "${RED}WARNING: This will completely replace the current database!${NC}"
echo -e "${YELLOW}Database: ${DB_NAME}${NC}"
echo -e "${YELLOW}Container: ${DB_CONTAINER}${NC}"
echo ""
read -p "Are you sure you want to continue? Type 'yes' to proceed: " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Create a safety backup before restore
echo -e "${YELLOW}Creating safety backup before restore...${NC}"
SAFETY_BACKUP="${BACKUP_DIR}/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"

if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$SAFETY_BACKUP"; then
    echo -e "${GREEN}Safety backup created: ${SAFETY_BACKUP}${NC}"
else
    echo -e "${YELLOW}Warning: Could not create safety backup${NC}"
    read -p "Continue with restore? (yes/no): " response
    if [ "$response" != "yes" ]; then
        echo -e "${YELLOW}Restore cancelled${NC}"
        exit 1
    fi
fi

# Decompress and restore
echo -e "${YELLOW}Restoring database from backup...${NC}"

# Drop existing connections to the database
echo -e "${YELLOW}Terminating existing database connections...${NC}"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" \
    > /dev/null 2>&1 || true

# Restore the database
if gunzip -c "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}Database restored successfully!${NC}"
    
    # Verify restore
    echo -e "${YELLOW}Verifying database...${NC}"
    TABLE_COUNT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    echo -e "${GREEN}Database contains ${TABLE_COUNT} tables${NC}"
    
    # Clean up safety backup if restore was successful
    if [ -f "$SAFETY_BACKUP" ]; then
        echo -e "${YELLOW}Keeping safety backup: ${SAFETY_BACKUP}${NC}"
    fi
    
    echo -e "${GREEN}=== Restore Complete ===${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Verify application functionality"
    echo "2. Check application logs"
    echo "3. Test critical features"
    echo "4. If issues occur, restore from safety backup:"
    echo "   $0 $(basename "$SAFETY_BACKUP")"
else
    echo -e "${RED}Error: Database restore failed!${NC}"
    
    if [ -f "$SAFETY_BACKUP" ]; then
        echo -e "${YELLOW}Restoring from safety backup...${NC}"
        gunzip -c "$SAFETY_BACKUP" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1
        echo -e "${GREEN}Rollback to safety backup complete${NC}"
    fi
    
    exit 1
fi
