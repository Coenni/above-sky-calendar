#!/bin/bash

# VPS Initial Setup Script
# This script prepares a fresh VPS for running Above Sky Calendar

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=== Above Sky Calendar VPS Setup ===${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install essential packages
echo -e "${YELLOW}[2/10] Installing essential packages...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    fail2ban \
    certbot \
    openssl \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo -e "${YELLOW}[3/10] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Enable Docker to start on boot
    systemctl enable docker
    systemctl start docker
    
    echo -e "${GREEN}Docker installed successfully${NC}"
else
    echo -e "${GREEN}Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "${YELLOW}[4/10] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="v2.23.0"
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    echo -e "${GREEN}Docker Compose installed successfully${NC}"
else
    echo -e "${GREEN}Docker Compose already installed${NC}"
fi

# Configure firewall (UFW)
echo -e "${YELLOW}[5/10] Configuring firewall...${NC}"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow SSH
ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Allow monitoring ports (only from localhost)
ufw allow from 127.0.0.1 to any port 3000 comment 'Grafana'
ufw allow from 127.0.0.1 to any port 9090 comment 'Prometheus'

# Enable firewall
ufw --force enable

echo -e "${GREEN}Firewall configured${NC}"

# Configure fail2ban for SSH protection
echo -e "${YELLOW}[6/10] Configuring fail2ban...${NC}"

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = admin@aboveskycalendar.com
sendername = Fail2Ban

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
EOF

systemctl enable fail2ban
systemctl restart fail2ban

echo -e "${GREEN}fail2ban configured${NC}"

# Create swap space (if not exists)
echo -e "${YELLOW}[7/10] Configuring swap space...${NC}"

if [ ! -f /swapfile ]; then
    # Create 2GB swap file
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Make swap permanent
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    
    # Configure swappiness
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    
    echo -e "${GREEN}Swap space configured (2GB)${NC}"
else
    echo -e "${GREEN}Swap space already exists${NC}"
fi

# Create application directory
echo -e "${YELLOW}[8/10] Creating application directory...${NC}"

APP_DIR="/opt/above-sky-calendar"
mkdir -p "$APP_DIR"

# Create non-root user for running the application
APP_USER="appuser"
if ! id "$APP_USER" &>/dev/null; then
    useradd -r -s /bin/bash -d "$APP_DIR" -m "$APP_USER"
    usermod -aG docker "$APP_USER"
    echo -e "${GREEN}Application user created: ${APP_USER}${NC}"
else
    echo -e "${GREEN}Application user already exists${NC}"
fi

# Set proper permissions
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# Configure log rotation
echo -e "${YELLOW}[9/10] Configuring log rotation...${NC}"

cat > /etc/logrotate.d/above-sky-calendar << 'EOF'
/opt/above-sky-calendar/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 appuser appuser
    sharedscripts
    postrotate
        docker-compose -f /opt/above-sky-calendar/docker-compose.yml \
                      -f /opt/above-sky-calendar/docker-compose.prod.yml \
                      kill -s HUP backend nginx || true
    endscript
}
EOF

echo -e "${GREEN}Log rotation configured${NC}"

# Create backup directory and setup cron for automated backups
echo -e "${YELLOW}[10/10] Setting up automated backups...${NC}"

mkdir -p "$APP_DIR/backups"
chown "$APP_USER:$APP_USER" "$APP_DIR/backups"

# Add backup cron job (run daily at 2 AM)
CRON_JOB="0 2 * * * cd $APP_DIR && ./scripts/backup-database.sh >> /var/log/db-backup.log 2>&1"

# Check if cron job already exists
if ! crontab -u "$APP_USER" -l 2>/dev/null | grep -q "backup-database.sh"; then
    (crontab -u "$APP_USER" -l 2>/dev/null; echo "$CRON_JOB") | crontab -u "$APP_USER" -
    echo -e "${GREEN}Automated backup cron job added${NC}"
else
    echo -e "${GREEN}Backup cron job already exists${NC}"
fi

# Summary
echo -e "${GREEN}=== VPS Setup Complete ===${NC}"
echo ""
echo -e "${BLUE}System Information:${NC}"
echo -e "OS: $(lsb_release -d | cut -f2)"
echo -e "Docker: $(docker --version)"
echo -e "Docker Compose: $(docker-compose --version)"
echo -e "Application directory: ${APP_DIR}"
echo -e "Application user: ${APP_USER}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Clone the repository:"
echo "   cd ${APP_DIR}"
echo "   git clone https://github.com/Coenni/above-sky-calendar.git ."
echo ""
echo "2. Configure environment variables:"
echo "   cp .env.example .env.prod"
echo "   vim .env.prod"
echo ""
echo "3. Generate secrets:"
echo "   ./scripts/generate-secrets.sh"
echo ""
echo "4. Setup SSL certificates:"
echo "   DOMAIN_NAME=yourdomain.com SSL_EMAIL=admin@yourdomain.com ./scripts/setup-ssl.sh"
echo ""
echo "5. Deploy the application:"
echo "   ./scripts/deploy.sh"
echo ""
echo -e "${GREEN}Setup script completed successfully!${NC}"
