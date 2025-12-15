#!/bin/bash

# Backup Verification Script
# This script verifies the integrity and restorability of database backups

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_CONTAINER="${DB_CONTAINER:-db}"
TEST_DB_NAME="backup_verification_test_$(date +%s)"
DB_USER="${DB_USER:-admin}"

echo -e "${GREEN}=== Backup Verification Script ===${NC}"

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}No specific backup file provided. Will verify the most recent backup.${NC}"
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | head -1)
    
    if [ -z "$BACKUP_FILE" ]; then
        echo -e "${RED}Error: No backup files found in ${BACKUP_DIR}${NC}"
        exit 1
    fi
else
    BACKUP_FILE="$1"
    
    # If only filename provided, assume it's in BACKUP_DIR
    if [ ! -f "$BACKUP_FILE" ]; then
        BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILE}"
    fi
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

echo -e "${BLUE}Verifying backup: $(basename "$BACKUP_FILE")${NC}"
echo ""

# Test 1: Check file integrity (not empty, valid gzip)
echo -e "${YELLOW}[1/5] Checking file integrity...${NC}"

if [ ! -s "$BACKUP_FILE" ]; then
    echo -e "${RED}✗ FAIL: Backup file is empty${NC}"
    exit 1
fi

if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${RED}✗ FAIL: Backup file is corrupted (invalid gzip)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ PASS: File is valid and not corrupted${NC}"

# Test 2: Verify checksum if available
echo -e "${YELLOW}[2/5] Verifying checksum...${NC}"

CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "$CHECKSUM_FILE" ]; then
    if sha256sum -c "$CHECKSUM_FILE" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS: Checksum verification successful${NC}"
    else
        echo -e "${RED}✗ FAIL: Checksum verification failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ WARN: No checksum file found${NC}"
fi

# Test 3: Check backup content (valid SQL)
echo -e "${YELLOW}[3/5] Checking SQL content...${NC}"

CONTENT_SAMPLE=$(gunzip -c "$BACKUP_FILE" | head -20)

if echo "$CONTENT_SAMPLE" | grep -q "PostgreSQL database dump"; then
    echo -e "${GREEN}✓ PASS: Valid PostgreSQL dump format${NC}"
else
    echo -e "${RED}✗ FAIL: Invalid SQL dump format${NC}"
    exit 1
fi

# Test 4: Check for critical schema elements
echo -e "${YELLOW}[4/5] Checking for schema elements...${NC}"

FULL_CONTENT=$(gunzip -c "$BACKUP_FILE")

FOUND_ISSUES=0

# Check for CREATE TABLE statements
if ! echo "$FULL_CONTENT" | grep -q "CREATE TABLE"; then
    echo -e "${YELLOW}⚠ WARN: No CREATE TABLE statements found${NC}"
    ((FOUND_ISSUES++))
fi

# Check for data INSERT statements or COPY commands
if ! echo "$FULL_CONTENT" | grep -qE "(INSERT INTO|COPY .* FROM stdin)"; then
    echo -e "${YELLOW}⚠ WARN: No data INSERT/COPY statements found${NC}"
    ((FOUND_ISSUES++))
fi

if [ $FOUND_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ PASS: Schema and data present${NC}"
else
    echo -e "${YELLOW}⚠ WARN: Some schema elements missing (${FOUND_ISSUES} issues)${NC}"
fi

# Test 5: Test restore to temporary database
echo -e "${YELLOW}[5/5] Testing restore to temporary database...${NC}"

# Check if database container is running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo -e "${YELLOW}⚠ WARN: Database container not running, skipping restore test${NC}"
else
    # Create temporary test database
    echo -e "${YELLOW}Creating temporary test database: ${TEST_DB_NAME}${NC}"
    
    if docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c \
        "CREATE DATABASE ${TEST_DB_NAME};" > /dev/null 2>&1; then
        
        # Try to restore backup to test database
        echo -e "${YELLOW}Attempting restore...${NC}"
        
        if gunzip -c "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" \
            psql -U "$DB_USER" -d "$TEST_DB_NAME" > /dev/null 2>&1; then
            
            echo -e "${GREEN}✓ PASS: Backup can be restored successfully${NC}"
            
            # Count tables in restored database
            TABLE_COUNT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$TEST_DB_NAME" -t -c \
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
            
            echo -e "${BLUE}  Restored ${TABLE_COUNT} tables${NC}"
        else
            echo -e "${RED}✗ FAIL: Restore failed${NC}"
            FOUND_ISSUES=$((FOUND_ISSUES + 1))
        fi
        
        # Clean up test database
        echo -e "${YELLOW}Cleaning up test database...${NC}"
        docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c \
            "DROP DATABASE IF EXISTS ${TEST_DB_NAME};" > /dev/null 2>&1
        
        echo -e "${GREEN}Test database removed${NC}"
    else
        echo -e "${YELLOW}⚠ WARN: Could not create test database${NC}"
    fi
fi

# Summary
echo ""
echo -e "${GREEN}=== Verification Summary ===${NC}"
echo -e "${BLUE}Backup file: $(basename "$BACKUP_FILE")${NC}"
echo -e "${BLUE}File size: $(du -h "$BACKUP_FILE" | cut -f1)${NC}"

if [ -f "$CHECKSUM_FILE" ]; then
    CHECKSUM=$(cat "$CHECKSUM_FILE" | cut -d' ' -f1)
    echo -e "${BLUE}Checksum: ${CHECKSUM}${NC}"
fi

echo ""

if [ $FOUND_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All verification tests passed!${NC}"
    echo -e "${GREEN}This backup is valid and can be used for restoration.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Verification completed with ${FOUND_ISSUES} warnings${NC}"
    echo -e "${YELLOW}The backup may still be usable, but review the warnings above.${NC}"
    exit 1
fi
