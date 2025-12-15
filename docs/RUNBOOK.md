# Operations Runbook

## Above Sky Calendar - Operations Manual

This runbook provides operational procedures, troubleshooting guides, and common maintenance tasks.

## Quick Reference

### Service URLs
- Production: https://your-domain.com
- Monitoring: http://localhost:3000 (Grafana via SSH tunnel)
- Logs: http://localhost:5601 (Kibana via SSH tunnel)

### Emergency Contacts
- On-Call Engineer: [PagerDuty Rotation]
- DevOps Lead: devops@example.com
- Security Lead: security@example.com

### Critical Scripts
```bash
./scripts/health-check.sh    # Check system health
./scripts/deploy.sh          # Deploy application
./scripts/rollback.sh        # Rollback deployment
./scripts/backup-database.sh # Backup database
./scripts/restore-database.sh # Restore database
```

## Common Operations

### Viewing Logs

```bash
# All services
./scripts/logs.sh

# Specific service
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs --tail=100 backend

# Follow logs with timestamp
docker-compose logs -f -t backend
```

### Restarting Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
docker-compose restart nginx

# Hard restart (down and up)
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Checking Service Health

```bash
# Run health check script
./scripts/health-check.sh

# Manual checks
curl http://localhost:8080/api/actuator/health
docker-compose ps
docker stats
```

### Database Operations

```bash
# Connect to database
docker exec -it db psql -U admin -d aboveskycalendar

# Backup database
./scripts/backup-database.sh

# List backups
ls -lh ./backups/

# Restore database
./scripts/restore-database.sh backup_file.sql.gz

# Check database connections
docker exec db psql -U admin -d aboveskycalendar -c "SELECT count(*) FROM pg_stat_activity;"
```

## Alert Handling

### Critical Alerts

#### Backend Down
**Symptom**: Prometheus alert "BackendDown"  
**Impact**: Application unavailable

**Response**:
1. Check backend logs: `docker-compose logs backend`
2. Check database connectivity: `docker exec db pg_isready`
3. Restart backend: `docker-compose restart backend`
4. If persists, check system resources: `free -h`, `df -h`
5. Escalate if not resolved in 15 minutes

#### Database Down
**Symptom**: Prometheus alert "DatabaseDown"  
**Impact**: Data unavailable

**Response**:
1. Check database container: `docker ps | grep db`
2. Check database logs: `docker-compose logs db`
3. Restart database: `docker-compose restart db`
4. Verify connections: `docker exec db pg_isready`
5. If data corruption, restore from backup
6. Escalate immediately if restore needed

#### System Disk Space Critical
**Symptom**: Less than 5% disk space  
**Impact**: System instability

**Response**:
1. Check disk usage: `df -h`
2. Clean Docker: `docker system prune -a`
3. Clean old logs: `find /var/log -name "*.log" -mtime +7 -delete`
4. Clean old backups: Adjust retention in backup script
5. Expand disk if needed

### Warning Alerts

#### High Response Time
**Symptom**: p95 latency > 1s  
**Impact**: Slow user experience

**Response**:
1. Check Grafana dashboard for bottlenecks
2. Review slow query logs
3. Check cache hit rate
4. Monitor CPU/memory usage
5. Consider scaling if persistent

#### High Memory Usage
**Symptom**: Memory usage > 85%  
**Impact**: Potential OOM errors

**Response**:
1. Check which service: `docker stats`
2. Review application logs for memory leaks
3. Restart affected service
4. Monitor JVM heap usage in Grafana
5. Adjust memory limits if needed

#### High Cache Miss Rate
**Symptom**: Cache hit rate < 50%  
**Impact**: Increased database load

**Response**:
1. Check Redis status: `docker exec redis redis-cli ping`
2. Review cache configuration
3. Check TTL settings
4. Monitor query patterns
5. Optimize caching strategy

## Troubleshooting Guide

### Application Won't Start

**Symptoms**: Container exits immediately

**Diagnosis**:
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs backend

# Check for port conflicts
netstat -tulpn | grep 8080

# Verify environment variables
docker-compose config
```

**Solutions**:
- Fix configuration errors
- Resolve port conflicts
- Check database connectivity
- Verify secrets are set

### Slow Database Queries

**Symptoms**: High response times, timeout errors

**Diagnosis**:
```bash
# Connect to database
docker exec -it db psql -U admin -d aboveskycalendar

# Check slow queries
SELECT pid, usename, query, state, wait_event_type 
FROM pg_stat_activity 
WHERE state = 'active' AND query_start < now() - interval '10 seconds';

# Check table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

**Solutions**:
- Add missing indexes
- Optimize queries
- Increase connection pool
- Consider read replicas

### Redis Connection Issues

**Symptoms**: Cache errors, DEGRADED health status

**Diagnosis**:
```bash
# Check Redis status
docker exec redis redis-cli ping

# Check Redis info
docker exec redis redis-cli info

# Check memory usage
docker exec redis redis-cli info memory
```

**Solutions**:
- Restart Redis: `docker-compose restart redis`
- Check password configuration
- Verify memory limits
- Clear cache if needed: `docker exec redis redis-cli FLUSHALL`

### SSL Certificate Issues

**Symptoms**: HTTPS not working, certificate warnings

**Diagnosis**:
```bash
# Check certificate status
certbot certificates

# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -noout -dates

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

**Solutions**:
- Renew certificate: `certbot renew --force-renewal`
- Fix DNS issues
- Check nginx configuration
- Restart nginx: `docker-compose restart nginx`

## Maintenance Procedures

### Deploy New Version

```bash
# Pre-deployment
./scripts/health-check.sh
./scripts/backup-database.sh

# Deploy
./scripts/deploy.sh

# Post-deployment
./scripts/health-check.sh
# Monitor Grafana for anomalies
```

### Database Maintenance

```bash
# Weekly: Vacuum database
docker exec db psql -U admin -d aboveskycalendar -c "VACUUM ANALYZE;"

# Monthly: Rebuild indexes
docker exec db psql -U admin -d aboveskycalendar -c "REINDEX DATABASE aboveskycalendar;"

# Check database statistics
docker exec db psql -U admin -d aboveskycalendar -c "SELECT * FROM pg_stat_database WHERE datname = 'aboveskycalendar';"
```

### Secret Rotation

```bash
# Generate new secrets
./scripts/generate-secrets.sh

# Update .env.prod with new secrets
nano .env.prod

# Restart services to apply
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify services are healthy
./scripts/health-check.sh
```

### Log Rotation

Automatic via logrotate, but manual trigger:
```bash
logrotate -f /etc/logrotate.d/above-sky-calendar
```

### Backup Verification

```bash
# Run weekly
./scripts/verify-backup.sh

# Test restore to temporary database
./scripts/verify-backup.sh backup_file.sql.gz
```

## Performance Tuning

### Database Optimization

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check missing indexes
SELECT schemaname, tablename, attname 
FROM pg_stats 
WHERE schemaname = 'public' 
  AND n_distinct < 0 
  AND correlation < 0.1;
```

### Cache Optimization

```bash
# Check cache hit rate
docker exec redis redis-cli info stats | grep keyspace

# Monitor cache memory
docker exec redis redis-cli info memory | grep used_memory

# Check cache keys
docker exec redis redis-cli --scan --pattern "users:*"
```

### JVM Tuning

Current settings: `-Xms512m -Xmx2g -XX:+UseG1GC`

Adjust in `.env.prod` if needed:
```env
JAVA_OPTS="-Xms1g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

## Escalation Procedures

### Level 1: Self-Service
- Check this runbook
- Review logs
- Basic troubleshooting
- Restart services if safe

### Level 2: On-Call Engineer
- Critical alerts
- Service degradation > 15 minutes
- Unable to resolve with runbook
- Contact via PagerDuty

### Level 3: DevOps Lead
- Multiple service failures
- Data integrity issues
- Security incidents
- Major outages

### Level 4: Security/Management
- Security breaches
- Data loss
- Compliance issues
- Customer-impacting incidents

## Change Management

### Pre-Change
- [ ] Create change ticket
- [ ] Schedule maintenance window
- [ ] Notify stakeholders
- [ ] Backup database
- [ ] Prepare rollback plan

### During Change
- [ ] Follow deployment procedure
- [ ] Monitor health checks
- [ ] Check error rates
- [ ] Verify functionality

### Post-Change
- [ ] Confirm services healthy
- [ ] Monitor for 1 hour
- [ ] Update documentation
- [ ] Close change ticket

## Useful Commands

```bash
# System resources
free -h                    # Memory usage
df -h                      # Disk usage
top                        # Process monitoring
htop                       # Better process monitoring

# Docker
docker ps                  # Running containers
docker stats               # Container resources
docker system df           # Docker disk usage
docker system prune -a     # Clean up Docker

# Networking
netstat -tulpn            # Open ports
curl -I https://domain.com # Test HTTPS
dig domain.com            # DNS lookup

# Database
docker exec db pg_isready                    # Check DB ready
docker exec -it db psql -U admin -d dbname  # Connect to DB
docker exec db pg_dump -U admin dbname       # Dump database

# Monitoring
curl localhost:9090/-/healthy   # Prometheus health
curl localhost:3000/api/health  # Grafana health
```

## Documentation References

- Production Deployment: `docs/PRODUCTION_DEPLOYMENT.md`
- Security Guide: `docs/SECURITY.md`
- Monitoring Guide: `docs/MONITORING.md`
- API Documentation: `https://your-domain.com/swagger-ui`

## On-Call Checklist

- [ ] Access to VPS (SSH keys configured)
- [ ] Access to monitoring (Grafana credentials)
- [ ] Access to alerts (Slack notifications)
- [ ] PagerDuty app installed and configured
- [ ] Emergency contact list accessible
- [ ] Runbook reviewed and understood
- [ ] Backup/restore procedures tested
- [ ] Escalation contacts known
