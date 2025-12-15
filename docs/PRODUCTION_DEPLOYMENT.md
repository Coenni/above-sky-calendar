# Production Deployment Guide

## Above Sky Calendar - Production Deployment

This guide provides comprehensive instructions for deploying Above Sky Calendar to a production VPS environment.

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04 LTS or later
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 50GB SSD
- **CPU**: 2+ cores recommended
- **Network**: Public IP address and domain name

### Required Accounts
- Domain name with DNS access
- Docker Hub account (for pulling images)
- SendGrid account (for production emails)
- GitHub account (for CI/CD)
- Slack workspace (optional, for alerts)

## Initial VPS Setup

### 1. Run VPS Setup Script

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/Coenni/above-sky-calendar/main/scripts/vps-setup.sh -o vps-setup.sh
chmod +x vps-setup.sh
sudo ./vps-setup.sh
```

This script will:
- Update system packages
- Install Docker and Docker Compose
- Configure firewall (UFW)
- Setup fail2ban for SSH protection
- Create swap space
- Configure log rotation
- Setup automated backups

### 2. Clone Repository

```bash
cd /opt/above-sky-calendar
git clone https://github.com/Coenni/above-sky-calendar.git .
```

### 3. Generate Secrets

```bash
./scripts/generate-secrets.sh
# This creates .env.secrets file with secure random passwords
```

### 4. Configure Environment Variables

```bash
cp .env.example .env.prod
nano .env.prod
```

Configure the following variables:
```env
# Domain
DOMAIN_NAME=your-domain.com

# Database
DB_HOST=db
DB_NAME=aboveskycalendar
DB_USER=admin
DB_PASSWORD=<from-secrets-file>

# Application
JWT_SECRET=<from-secrets-file>
SPRING_PROFILES_ACTIVE=prod

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=<from-secrets-file>

# Email (SendGrid)
SENDGRID_API_KEY=<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=noreply@your-domain.com

# Monitoring
GRAFANA_ADMIN_PASSWORD=<from-secrets-file>

# Alerts
SLACK_WEBHOOK_URL=<your-slack-webhook>
```

### 5. Setup SSL Certificates

```bash
DOMAIN_NAME=your-domain.com SSL_EMAIL=admin@your-domain.com ./scripts/setup-ssl.sh
```

## Deployment

### First-Time Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend ./mvnw flyway:migrate

# Check service health
./scripts/health-check.sh
```

### Subsequent Deployments

```bash
# Use the deployment script
./scripts/deploy.sh
```

The deploy script handles:
- Code updates
- Database migrations
- Zero-downtime deployment
- Health checks
- Automatic rollback on failure

## Service Access

### Application URLs
- **Frontend**: https://your-domain.com
- **Backend API**: https://your-domain.com/api
- **Swagger UI**: https://your-domain.com/swagger-ui (restricted to internal IPs)

### Monitoring
- **Grafana**: http://your-vps-ip:3000 (use SSH tunnel or restrict access)
- **Prometheus**: http://your-vps-ip:9090 (internal only)
- **Kibana**: http://your-vps-ip:5601 (internal only)

### SSH Tunneling for Monitoring

```bash
# Create SSH tunnel for Grafana
ssh -L 3000:localhost:3000 user@your-vps-ip

# Access Grafana at http://localhost:3000
```

## Monitoring and Alerts

### Grafana Dashboards

1. Access Grafana at http://localhost:3000 (via SSH tunnel)
2. Login with admin credentials from .env.prod
3. Navigate to Dashboards > Above Sky Calendar

Key metrics to monitor:
- Request rate and response times
- Error rates
- JVM memory and CPU usage
- Database connections
- Cache hit rates

### Prometheus Alerts

Alerts are configured for:
- Service downtime
- High error rates
- Resource exhaustion
- Database issues
- Cache failures

Alerts are sent to Slack via Alertmanager.

## Database Backups

### Automated Backups

Backups run automatically daily at 2 AM via cron job.

### Manual Backup

```bash
./scripts/backup-database.sh
```

Backups are stored in `./backups/` directory and compressed with gzip.

### Restore from Backup

```bash
# List available backups
ls -lh ./backups/

# Restore specific backup
./scripts/restore-database.sh backup_aboveskycalendar_20231215_020000.sql.gz
```

### Verify Backup

```bash
./scripts/verify-backup.sh backup_aboveskycalendar_20231215_020000.sql.gz
```

## Rollback Procedure

If deployment fails or issues arise:

```bash
./scripts/rollback.sh
```

This will:
1. Create emergency database backup
2. Revert code to previous commit
3. Restore previous Docker images
4. Optionally restore database
5. Restart services

## Troubleshooting

### Check Logs

```bash
# All services
./scripts/logs.sh

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Service Not Starting

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs service-name

# Restart service
docker-compose restart service-name
```

### Database Connection Issues

```bash
# Check database status
docker exec db pg_isready -U admin

# Connect to database
docker exec -it db psql -U admin -d aboveskycalendar

# Check connections
SELECT count(*) FROM pg_stat_activity;
```

### High Memory Usage

```bash
# Check memory usage
free -h

# Restart services to clear memory
docker-compose restart backend frontend
```

### SSL Certificate Issues

```bash
# Check certificate status
certbot certificates

# Renew certificates manually
certbot renew --force-renewal

# Reload nginx
docker-compose restart nginx
```

## Security Best Practices

1. **Keep Secrets Secure**
   - Never commit secrets to version control
   - Store .env.prod in secure location
   - Rotate secrets every 90 days

2. **Regular Updates**
   - Update system packages weekly
   - Update Docker images regularly
   - Monitor security advisories

3. **Access Control**
   - Use SSH keys (disable password auth)
   - Restrict monitoring ports to localhost
   - Use VPN for sensitive access

4. **Monitoring**
   - Review Grafana dashboards daily
   - Set up Slack alerts
   - Monitor application logs

5. **Backups**
   - Verify backup integrity weekly
   - Store backups offsite (S3)
   - Test restore procedure monthly

## Maintenance Schedule

### Daily
- Check Grafana dashboard for anomalies
- Review critical alerts
- Monitor disk space

### Weekly
- Review application logs
- Check backup integrity
- Update system packages

### Monthly
- Test backup restore procedure
- Review and rotate access credentials
- Security audit
- Performance optimization review

### Quarterly
- Rotate secrets (JWT, passwords)
- Update Docker images
- Review and update documentation
- Disaster recovery drill

## Post-Implementation Checklist

- [ ] SSL certificates installed and auto-renewal configured
- [ ] All environment variables configured
- [ ] Database backups running automatically
- [ ] Monitoring dashboards accessible
- [ ] Alerting configured and tested
- [ ] CI/CD pipeline working
- [ ] Health checks passing
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Email sending works
- [ ] Performance metrics acceptable
- [ ] Documentation reviewed
- [ ] Team trained on operations

## Support and Resources

- **GitHub Repository**: https://github.com/Coenni/above-sky-calendar
- **Documentation**: See `docs/` directory
- **Runbook**: See `docs/RUNBOOK.md`
- **Security**: See `docs/SECURITY.md`

For additional help, create an issue on GitHub or contact the development team.
