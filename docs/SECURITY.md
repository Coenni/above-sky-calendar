# Security Documentation

## Above Sky Calendar - Security Guide

This document outlines security best practices, configurations, and incident response procedures.

## Security Architecture

### Defense in Depth Layers

1. **Network Security**
   - Firewall (UFW) blocking all but essential ports
   - fail2ban for SSH brute-force protection
   - Rate limiting at nginx level

2. **Application Security**
   - JWT-based authentication
   - CSRF protection
   - Input validation and sanitization
   - SQL injection prevention (JPA/Hibernate)

3. **Transport Security**
   - TLS 1.2+ only
   - HSTS headers
   - Secure ciphers

4. **Data Security**
   - Encrypted database backups
   - Secrets management
   - Redis password protection

## Secrets Management

### Best Practices

1. **Never commit secrets to version control**
   - Use `.gitignore` for `.env*` files
   - Use `application-secrets.yml.example` as template only

2. **Generate Strong Secrets**
   ```bash
   ./scripts/generate-secrets.sh
   ```

3. **Secret Rotation Schedule**
   - JWT secrets: Every 90 days
   - Database passwords: Every 90 days
   - API keys: Per provider recommendations
   - SSL certificates: Auto-renewed by Let's Encrypt

4. **Storage**
   - Production: Use environment variables or Docker secrets
   - Development: Local `.env` files (never committed)
   - Use password manager for team access

### Required Secrets

| Secret | Purpose | Rotation Frequency |
|--------|---------|-------------------|
| JWT_SECRET | Token signing | 90 days |
| DB_PASSWORD | Database access | 90 days |
| REDIS_PASSWORD | Cache access | 90 days |
| SENDGRID_API_KEY | Email service | As needed |
| GRAFANA_ADMIN_PASSWORD | Monitoring access | 90 days |
| SLACK_WEBHOOK_URL | Alert notifications | As needed |

## SSL/TLS Configuration

### Certificate Management

Certificates are auto-generated and renewed using Let's Encrypt:

```bash
# Initial setup
DOMAIN_NAME=your-domain.com SSL_EMAIL=admin@your-domain.com ./scripts/setup-ssl.sh

# Manual renewal (if needed)
certbot renew --force-renewal
docker-compose restart nginx
```

### TLS Configuration

Nginx is configured with:
- TLS 1.2 and 1.3 only
- Strong cipher suites (Mozilla Intermediate profile)
- OCSP stapling
- Session tickets disabled

### Security Headers

All responses include:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
```

## Rate Limiting

### API Rate Limits

| Endpoint Type | Limit | Burst |
|--------------|-------|-------|
| Authentication | 5 req/min | 5 |
| General API | 10 req/s | 20 |
| Public | 20 req/s | 20 |

Rate limiting is implemented at:
1. Nginx level (per IP)
2. Application level (RateLimitingFilter)

### Bypass Rate Limiting

Internal monitoring and health checks bypass rate limiting.

## Authentication & Authorization

### JWT Token Security

- **Algorithm**: HS512 (HMAC with SHA-512)
- **Expiration**: 24 hours
- **Refresh Token**: 7 days
- **Storage**: HTTP-only cookies (recommended) or localStorage

### Password Requirements

- Minimum 8 characters
- Must include uppercase, lowercase, number
- Hashed using BCrypt (strength 12)

### Session Management

- Stateless JWT tokens
- Redis for token blacklist (logout)
- No server-side sessions

## CORS Configuration

Production CORS policy:
```yaml
cors:
  allowed-origins: https://yourdomain.com, https://www.yourdomain.com
  allowed-methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
  allowed-headers: "*"
  allow-credentials: true
  max-age: 3600
```

## Database Security

### Connection Security

- Password authentication required
- No public database exposure
- Internal Docker network only

### Backup Security

- Backups compressed with gzip
- SHA256 checksums for integrity
- Optional S3 encryption at rest
- 30-day retention policy

### SQL Injection Prevention

- JPA/Hibernate prepared statements
- Input validation
- Parameterized queries only

## Monitoring & Logging

### Security Logging

All authentication attempts logged:
- Successful logins
- Failed login attempts
- Token validations
- Rate limit violations

### Log Retention

- Application logs: 14 days
- Nginx access logs: 30 days
- Audit logs: 90 days

### Security Monitoring

Prometheus alerts configured for:
- Multiple failed login attempts
- Unusual traffic patterns
- High error rates
- Service downtime

## Incident Response

### Security Incident Procedure

1. **Detection**
   - Monitor alerts in Slack
   - Review Grafana dashboards
   - Check application logs

2. **Assessment**
   - Determine severity (Critical, High, Medium, Low)
   - Identify affected systems
   - Estimate impact

3. **Containment**
   - Isolate affected services
   - Block malicious IPs (UFW)
   - Revoke compromised credentials

4. **Eradication**
   - Remove threats
   - Patch vulnerabilities
   - Update security rules

5. **Recovery**
   - Restore from clean backup if needed
   - Verify system integrity
   - Resume normal operations

6. **Post-Incident**
   - Document incident
   - Update security procedures
   - Team debrief

### Emergency Contacts

| Role | Contact | Availability |
|------|---------|-------------|
| Security Lead | security@example.com | 24/7 |
| DevOps Lead | devops@example.com | Business hours |
| On-Call Engineer | Pagerduty rotation | 24/7 |

### Rollback Procedure

If security breach detected:
```bash
# Immediate rollback
./scripts/rollback.sh

# Restore clean database backup
./scripts/restore-database.sh backup_file.sql.gz

# Rotate all secrets
./scripts/generate-secrets.sh
# Update .env.prod with new secrets

# Restart all services
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Vulnerability Management

### Dependency Scanning

CI/CD pipeline includes:
- OWASP Dependency Check
- Trivy vulnerability scanning
- Regular dependency updates

### Security Updates

- System packages: Weekly
- Docker images: Monthly or on security advisory
- Dependencies: Monthly or on security advisory

### Reporting Vulnerabilities

Security issues should be reported to: security@example.com

**Do not** create public GitHub issues for security vulnerabilities.

## Compliance Checklist

- [ ] SSL/TLS certificates valid
- [ ] All secrets rotated within 90 days
- [ ] Firewall rules reviewed
- [ ] fail2ban active and logging
- [ ] Rate limiting tested
- [ ] Security headers verified
- [ ] CORS properly configured
- [ ] Database backups encrypted
- [ ] Monitoring alerts functioning
- [ ] Incident response plan updated
- [ ] Team trained on security procedures
- [ ] Vulnerability scan completed
- [ ] Access logs reviewed
- [ ] Unused accounts disabled

## Security Hardening Checklist

### Server
- [ ] SSH key-only authentication
- [ ] fail2ban configured
- [ ] UFW firewall active
- [ ] Automatic security updates enabled
- [ ] Non-root application user
- [ ] Unnecessary services disabled

### Application
- [ ] JWT secrets strong and rotated
- [ ] CSRF protection enabled
- [ ] Rate limiting active
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

### Network
- [ ] HTTPS only (HTTP redirected)
- [ ] HSTS headers active
- [ ] TLS 1.2+ only
- [ ] Strong cipher suites
- [ ] Monitoring ports restricted

### Monitoring
- [ ] Security alerts configured
- [ ] Log aggregation working
- [ ] Failed auth attempts monitored
- [ ] Resource usage monitored
- [ ] Backup integrity verified

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)

## Conclusion

Security is an ongoing process. Regular reviews, updates, and training are essential for maintaining a secure system. Follow this guide and adapt it to your specific security requirements.
