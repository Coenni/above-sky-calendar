#!/bin/bash

# Database Backup Script for PostgreSQL
# This script creates compressed backups and optionally uploads to S3

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration from environment variables or defaults
DB_CONTAINER="${DB_CONTAINER:-db}"
DB_NAME="${DB_NAME:-aboveskycalendar}"
DB_USER="${DB_USER:-admin}"
DB_PASSWORD="${DB_PASSWORD}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_${DB_NAME}_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
COMPRESSED_PATH="${BACKUP_DIR}/${COMPRESSED_FILE}"

echo -e "${GREEN}=== Database Backup Script ===${NC}"
echo -e "${YELLOW}Starting backup of database: ${DB_NAME}${NC}"
echo -e "${YELLOW}Timestamp: ${TIMESTAMP}${NC}"

# Check if database container is running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo -e "${RED}Error: Database container '$DB_CONTAINER' is not running${NC}"
    exit 1
fi

# Create backup using pg_dump
echo -e "${YELLOW}Creating database dump...${NC}"
if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists > "$BACKUP_PATH"; then
    echo -e "${GREEN}Database dump created: ${BACKUP_PATH}${NC}"
else
    echo -e "${RED}Failed to create database dump${NC}"
    exit 1
fi

# Compress the backup
echo -e "${YELLOW}Compressing backup...${NC}"
if gzip -9 "$BACKUP_PATH"; then
    BACKUP_SIZE=$(du -h "$COMPRESSED_PATH" | cut -f1)
    echo -e "${GREEN}Backup compressed: ${COMPRESSED_PATH} (${BACKUP_SIZE})${NC}"
else
    echo -e "${RED}Failed to compress backup${NC}"
    exit 1
fi

# Calculate checksum
CHECKSUM=$(sha256sum "$COMPRESSED_PATH" | cut -d' ' -f1)
echo "$CHECKSUM  $COMPRESSED_FILE" > "${COMPRESSED_PATH}.sha256"
echo -e "${GREEN}Checksum saved: ${CHECKSUM}${NC}"

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ]; then
    echo -e "${YELLOW}Uploading backup to S3...${NC}"
    
    if command -v aws &> /dev/null; then
        S3_PATH="s3://${S3_BUCKET}/backups/${COMPRESSED_FILE}"
        
        if aws s3 cp "$COMPRESSED_PATH" "$S3_PATH" --region "$AWS_REGION"; then
            echo -e "${GREEN}Backup uploaded to S3: ${S3_PATH}${NC}"
            
            # Upload checksum file
            aws s3 cp "${COMPRESSED_PATH}.sha256" "${S3_PATH}.sha256" --region "$AWS_REGION"
            echo -e "${GREEN}Checksum uploaded to S3${NC}"
        else
            echo -e "${YELLOW}Warning: Failed to upload to S3, but local backup is complete${NC}"
        fi
    else
        echo -e "${YELLOW}Warning: AWS CLI not installed, skipping S3 upload${NC}"
    fi
fi

# Clean up old backups (older than RETENTION_DAYS)
echo -e "${YELLOW}Cleaning up old backups (keeping last ${RETENTION_DAYS} days)...${NC}"
DELETED_COUNT=0

if [ -d "$BACKUP_DIR" ]; then
    while IFS= read -r -d '' old_backup; do
        rm -f "$old_backup"
        ((DELETED_COUNT++))
        echo -e "${YELLOW}Deleted: $(basename "$old_backup")${NC}"
    done < <(find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -print0)
fi

if [ $DELETED_COUNT -eq 0 ]; then
    echo -e "${GREEN}No old backups to delete${NC}"
else
    echo -e "${GREEN}Deleted ${DELETED_COUNT} old backup(s)${NC}"
fi

# List recent backups
echo -e "${YELLOW}Recent backups:${NC}"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | tail -5 || echo "No backups found"

# Create backup metadata
METADATA_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.json"
cat > "$METADATA_FILE" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "database": "${DB_NAME}",
  "filename": "${COMPRESSED_FILE}",
  "size": "${BACKUP_SIZE}",
  "checksum": "${CHECKSUM}",
  "retention_days": ${RETENTION_DAYS}
}
EOF

echo -e "${GREEN}=== Backup Complete ===${NC}"
echo -e "${GREEN}Backup file: ${COMPRESSED_PATH}${NC}"
echo -e "${GREEN}Backup size: ${BACKUP_SIZE}${NC}"
echo -e "${GREEN}Checksum: ${CHECKSUM}${NC}"
echo ""
echo -e "${YELLOW}To restore this backup, run:${NC}"
echo "./scripts/restore-database.sh ${COMPRESSED_FILE}"
