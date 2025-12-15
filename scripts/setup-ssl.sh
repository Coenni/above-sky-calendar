#!/bin/bash

# SSL Certificate Setup Script for Let's Encrypt
# This script automates the SSL certificate generation and renewal setup

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${DOMAIN_NAME:-example.com}"
EMAIL="${SSL_EMAIL:-admin@${DOMAIN}}"
STAGING="${STAGING:-0}"
WEBROOT="/var/www/certbot"

echo -e "${GREEN}=== SSL Certificate Setup for ${DOMAIN} ===${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Check if domain is set
if [ "$DOMAIN" == "example.com" ]; then
    echo -e "${RED}Error: DOMAIN_NAME environment variable not set${NC}"
    echo "Usage: DOMAIN_NAME=yourdomain.com SSL_EMAIL=admin@yourdomain.com ./setup-ssl.sh"
    exit 1
fi

# Install certbot if not present
echo -e "${YELLOW}Checking for certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing certbot...${NC}"
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        yum install -y certbot
    else
        echo -e "${RED}Could not install certbot. Please install manually.${NC}"
        exit 1
    fi
fi

# Create webroot directory for ACME challenges
mkdir -p "$WEBROOT"
chmod 755 "$WEBROOT"

echo -e "${YELLOW}Requesting SSL certificate for ${DOMAIN}...${NC}"

# Build certbot command
CERTBOT_CMD="certbot certonly --webroot -w $WEBROOT -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-eff-email"

# Add staging flag if in test mode
if [ "$STAGING" -eq 1 ]; then
    echo -e "${YELLOW}Using Let's Encrypt staging environment (test mode)${NC}"
    CERTBOT_CMD="$CERTBOT_CMD --staging"
fi

# Request certificate
if $CERTBOT_CMD; then
    echo -e "${GREEN}Certificate obtained successfully!${NC}"
else
    echo -e "${RED}Failed to obtain certificate${NC}"
    exit 1
fi

# Set up automatic renewal
echo -e "${YELLOW}Setting up automatic renewal...${NC}"

# Create renewal script
cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --webroot -w /var/www/certbot --quiet --deploy-hook "docker exec nginx nginx -s reload"
EOF

chmod +x /usr/local/bin/renew-ssl.sh

# Add to crontab (run twice daily as recommended by Let's Encrypt)
CRON_JOB="0 0,12 * * * /usr/local/bin/renew-ssl.sh >> /var/log/certbot-renew.log 2>&1"

# Check if cron job already exists
if ! crontab -l 2>/dev/null | grep -q "renew-ssl.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}Added renewal cron job${NC}"
else
    echo -e "${YELLOW}Renewal cron job already exists${NC}"
fi

# Test renewal (dry run)
echo -e "${YELLOW}Testing certificate renewal (dry run)...${NC}"
if certbot renew --dry-run --webroot -w "$WEBROOT"; then
    echo -e "${GREEN}Renewal test successful!${NC}"
else
    echo -e "${YELLOW}Warning: Renewal test failed. Please check configuration.${NC}"
fi

# Create nginx reload hook for certbot
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOF'
#!/bin/bash
# Reload nginx after certificate renewal
docker exec nginx nginx -s reload || systemctl reload nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

echo -e "${GREEN}=== SSL Setup Complete ===${NC}"
echo -e "${GREEN}Certificate location: /etc/letsencrypt/live/${DOMAIN}/${NC}"
echo -e "${GREEN}Automatic renewal: Configured (runs twice daily)${NC}"
echo -e "${GREEN}Renewal logs: /var/log/certbot-renew.log${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your nginx configuration to use the SSL certificates"
echo "2. Restart nginx: docker-compose restart nginx"
echo "3. Verify HTTPS is working: https://${DOMAIN}"
echo "4. Test SSL configuration: https://www.ssllabs.com/ssltest/"
echo ""
echo -e "${YELLOW}Manual renewal test:${NC}"
echo "certbot renew --dry-run"
echo ""
echo -e "${YELLOW}Force renewal (if needed):${NC}"
echo "certbot renew --force-renewal"
