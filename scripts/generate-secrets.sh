#!/bin/bash

# Secure Secrets Generation Script
# Generates secure random strings for application secrets

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=== Secure Secrets Generator ===${NC}"
echo ""

# Function to generate a secure random string
generate_secret() {
    local length=${1:-64}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to generate hex secret
generate_hex() {
    local length=${1:-32}
    openssl rand -hex $length
}

# Generate secrets
echo -e "${YELLOW}Generating secure secrets...${NC}"
echo ""

JWT_SECRET=$(generate_secret 64)
DB_PASSWORD=$(generate_secret 32)
REDIS_PASSWORD=$(generate_secret 32)
GRAFANA_ADMIN_PASSWORD=$(generate_secret 24)
POSTGRES_PASSWORD=$(generate_secret 32)

echo -e "${BLUE}=== Database Secrets ===${NC}"
echo "DB_PASSWORD=$DB_PASSWORD"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo ""

echo -e "${BLUE}=== Application Secrets ===${NC}"
echo "JWT_SECRET=$JWT_SECRET"
echo ""

echo -e "${BLUE}=== Redis Secret ===${NC}"
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo ""

echo -e "${BLUE}=== Monitoring Secrets ===${NC}"
echo "GRAFANA_ADMIN_PASSWORD=$GRAFANA_ADMIN_PASSWORD"
echo ""

# Create .env.secrets file
ENV_FILE="${ENV_FILE:-.env.secrets}"

echo -e "${YELLOW}Writing secrets to ${ENV_FILE}...${NC}"

cat > "$ENV_FILE" << EOF
# Auto-generated secrets - DO NOT COMMIT TO VERSION CONTROL
# Generated on $(date)

# Database
DB_PASSWORD=$DB_PASSWORD
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# Application
JWT_SECRET=$JWT_SECRET

# Redis
REDIS_PASSWORD=$REDIS_PASSWORD

# Monitoring
GRAFANA_ADMIN_PASSWORD=$GRAFANA_ADMIN_PASSWORD

# Additional secrets to configure manually:
# MAIL_PASSWORD=your-email-password
# SENDGRID_API_KEY=your-sendgrid-api-key
# SLACK_WEBHOOK_URL=your-slack-webhook-url
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# DOCKER_HUB_USERNAME=your-docker-username
# DOCKER_HUB_TOKEN=your-docker-token
EOF

chmod 600 "$ENV_FILE"

echo -e "${GREEN}Secrets generated successfully!${NC}"
echo ""
echo -e "${YELLOW}Important Security Notes:${NC}"
echo "1. The secrets have been saved to: $ENV_FILE"
echo "2. This file has been set to read-only for owner (chmod 600)"
echo "3. Add $ENV_FILE to .gitignore if not already present"
echo "4. Store secrets in a secure password manager"
echo "5. For production, consider using Docker secrets or a secrets manager"
echo "6. Never commit secrets to version control"
echo "7. Rotate secrets regularly (every 90 days recommended)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the generated secrets in $ENV_FILE"
echo "2. Add any additional secrets that need manual configuration"
echo "3. Copy secrets to your production environment securely"
echo "4. Set up GitHub Secrets for CI/CD pipeline"
echo ""
echo -e "${BLUE}To use these secrets:${NC}"
echo "source $ENV_FILE"
echo "# or"
echo "docker-compose --env-file $ENV_FILE up"
