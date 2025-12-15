# Deployment Guide - Above Sky Calendar

This guide provides detailed instructions for deploying Above Sky Calendar in different environments (local, staging, and production).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Development Deployment](#local-development-deployment)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Database Migration](#database-migration)
- [Monitoring and Logging](#monitoring-and-logging)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Docker** 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ ([Install Docker Compose](https://docs.docker.com/compose/install/))
- **Git** (for cloning the repository)

### System Requirements

#### Development
- 8GB RAM minimum
- 20GB free disk space
- 2 CPU cores

#### Production
- 16GB RAM minimum
- 100GB free disk space (more for database growth)
- 4 CPU cores minimum
- SSD storage recommended

## Environment Configuration

### 1. Create Environment File

Copy the example environment file and configure it for your environment:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and set the following variables:

#### Database Configuration
```bash
DB_HOST=db                      # Use 'db' for Docker, or external host
DB_NAME=aboveskycalendar
DB_USER=admin
DB_PASSWORD=your-secure-password  # Use strong password!
```

#### Email Configuration
```bash
MAIL_HOST=smtp.gmail.com        # Your SMTP server
MAIL_PORT=587                    # SMTP port (587 for TLS, 465 for SSL)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password  # Use app-specific password for Gmail
```

#### Application Configuration
```bash
SPRING_PROFILES_ACTIVE=local    # local, stage, or prod
JWT_SECRET=your-very-long-random-secret-key-here-at-least-64-characters
```

#### CORS Configuration
```bash
CORS_ALLOWED_ORIGINS=http://localhost:4200,https://yourdomain.com
```

### 3. Generate Secure JWT Secret

Generate a secure random string for JWT_SECRET:

```bash
# Linux/Mac
openssl rand -base64 64 | tr -d '\n'

# Or use online generator: https://www.grc.com/passwords.htm
```

## Local Development Deployment

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Coenni/above-sky-calendar.git
   cd above-sky-calendar
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Start all services:**
   ```bash
   ./scripts/start-local.sh
   ```

4. **Access the application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8080/api
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - H2 Console: http://localhost:8080/h2-console
   - Kibana: http://localhost:5601
   - MailHog UI: http://localhost:8025

### Development Features

- **Hot Reload:** Code changes are automatically reflected
- **H2 In-Memory Database:** Data resets on restart
- **MailHog:** All emails are captured locally
- **Debug Port:** Backend available on port 5005

### Stopping Services

```bash
./scripts/stop-all.sh
```

### Viewing Logs

```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
./scripts/logs.sh backend -f

# View last 100 lines
./scripts/logs.sh backend --tail=100
```

## Staging Deployment

### 1. Prepare Server

Ensure Docker and Docker Compose are installed on your staging server.

### 2. Configure Environment

Create `.env` file with staging configuration:

```bash
# Use PostgreSQL for staging
DB_HOST=db
DB_NAME=aboveskycalendar_stage
DB_USER=admin
DB_PASSWORD=<secure-password>

# Configure real SMTP server
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=<sendgrid-api-key>

# Staging profile
SPRING_PROFILES_ACTIVE=stage
JWT_SECRET=<long-random-secret>

# Staging domain
CORS_ALLOWED_ORIGINS=https://stage.aboveskycalendar.com
```

### 3. Deploy

```bash
./scripts/start-stage.sh
```

### 4. Configure Reverse Proxy (Nginx)

The Nginx service in Docker Compose handles internal routing. For external SSL:

```nginx
# /etc/nginx/sites-available/stage.aboveskycalendar.com
server {
    listen 443 ssl http2;
    server_name stage.aboveskycalendar.com;

    ssl_certificate /etc/letsencrypt/live/stage.aboveskycalendar.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stage.aboveskycalendar.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name stage.aboveskycalendar.com;
    return 301 https://$server_name$request_uri;
}
```

## Production Deployment

### 1. Server Setup

#### System Updates
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configure Production Environment

Create `.env` file with production configuration:

```bash
# External PostgreSQL recommended for production
DB_HOST=your-db-server.com
DB_NAME=aboveskycalendar_prod
DB_USER=admin
DB_PASSWORD=<very-secure-password>

# Production SMTP
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=<sendgrid-api-key>

# Production profile
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<very-long-random-secret>

# Production domain
CORS_ALLOWED_ORIGINS=https://aboveskycalendar.com
```

### 3. Deploy Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Configure SSL/TLS (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d aboveskycalendar.com -d www.aboveskycalendar.com

# Auto-renewal (certbot sets this up automatically)
sudo certbot renew --dry-run
```

### 5. Security Hardening

#### Firewall Configuration
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### Automatic Updates
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## Database Migration

### Backup Database

```bash
# PostgreSQL backup
docker exec abovesky-db pg_dump -U admin aboveskycalendar > backup.sql

# Or using docker-compose
docker-compose exec db pg_dump -U admin aboveskycalendar > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker exec -i abovesky-db psql -U admin aboveskycalendar < backup.sql
```

### Migration Best Practices

1. **Always backup before migration**
2. **Test migrations on staging first**
3. **Use Flyway or Liquibase for production** (to be added)
4. **Keep backups for at least 30 days**

### Automated Backups

Create a cron job for daily backups:

```bash
# Add to crontab (crontab -e)
0 2 * * * cd /path/to/above-sky-calendar && docker-compose exec -T db pg_dump -U admin aboveskycalendar | gzip > /backups/db_backup_$(date +\%Y\%m\%d).sql.gz
```

## Monitoring and Logging

### Access Logs

#### Kibana Dashboard
- URL: http://your-server:5601
- Create index pattern: `above-sky-calendar-*`
- View logs in Discover tab

#### Docker Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Save logs to file
docker-compose logs --no-color > logs_$(date +%Y%m%d).txt
```

### Health Checks

#### Backend Health
```bash
curl http://localhost:8080/actuator/health
```

#### Database Health
```bash
docker-compose exec db pg_isready -U admin
```

#### All Services Status
```bash
docker-compose ps
```

### Metrics

Access Spring Boot Actuator metrics:
- Health: http://your-server:8080/actuator/health
- Info: http://your-server:8080/actuator/info
- Metrics: http://your-server:8080/actuator/metrics

## SSL/TLS Configuration

### Development (Self-Signed Certificate)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### Production (Let's Encrypt)

See [Production Deployment](#4-configure-ssltls-lets-encrypt) section above.

### SSL Best Practices

1. Use TLS 1.2 or higher
2. Disable weak ciphers
3. Enable HSTS
4. Regular certificate renewal
5. Use strong key sizes (2048-bit minimum)

## Troubleshooting

### Common Issues

#### 1. Container Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart [service-name]
```

#### 2. Database Connection Issues

```bash
# Verify database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker-compose exec backend psql -h db -U admin -d aboveskycalendar
```

#### 3. Port Already in Use

```bash
# Find process using port
sudo lsof -i :8080

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

#### 4. Out of Memory

```bash
# Check Docker stats
docker stats

# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory

# Or add resource limits in docker-compose.prod.yml
```

#### 5. Elasticsearch Won't Start

```bash
# Increase vm.max_map_count
sudo sysctl -w vm.max_map_count=262144

# Make permanent
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

### Getting Help

1. Check logs: `docker-compose logs -f`
2. Check GitHub Issues: https://github.com/Coenni/above-sky-calendar/issues
3. Review documentation: README.md
4. Contact support team

## Maintenance Tasks

### Regular Maintenance

#### Weekly
- Check disk space: `df -h`
- Review logs for errors
- Check service health

#### Monthly
- Update Docker images: `docker-compose pull`
- Clean old images: `docker system prune -a`
- Review and rotate logs
- Backup database

#### Quarterly
- Security updates
- SSL certificate renewal check
- Performance review
- Capacity planning

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Or use specific compose files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_events_start_date ON events(start_date);
```

### Docker Optimization

1. **Use multi-stage builds** (already implemented)
2. **Enable BuildKit:**
   ```bash
   export DOCKER_BUILDKIT=1
   ```
3. **Clean unused resources:**
   ```bash
   docker system prune -a --volumes
   ```

### Application Optimization

1. **Enable caching** in application-prod.yml
2. **Configure connection pooling** (already configured)
3. **Use CDN** for static assets
4. **Enable Gzip compression** (already configured in Nginx)

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Configure firewall
- [ ] Enable HTTPS
- [ ] Set up automated backups
- [ ] Configure log rotation
- [ ] Enable security headers (already in Nginx)
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Use secrets management (Docker secrets or vault)

## Rollback Procedure

If deployment fails:

```bash
# Stop current version
docker-compose down

# Restore previous version
git checkout <previous-tag>
docker-compose up -d

# Restore database if needed
docker exec -i abovesky-db psql -U admin aboveskycalendar < backup.sql
```

## Support

For deployment assistance:
- GitHub Issues: https://github.com/Coenni/above-sky-calendar/issues
- Documentation: README.md
- Email: support@aboveskycalendar.com
