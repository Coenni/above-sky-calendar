# Utility Scripts

This directory contains utility scripts to simplify Docker operations.

## Available Scripts

### start-local.sh
Starts the local development environment with all services.

```bash
./scripts/start-local.sh
```

**Features:**
- Creates .env from .env.example if missing
- Starts all Docker services in development mode
- Enables hot-reload for backend and frontend
- Uses H2 in-memory database
- Captures emails with MailHog
- Displays access URLs for all services

### start-stage.sh
Starts the staging environment.

```bash
./scripts/start-stage.sh
```

**Features:**
- Validates required environment variables
- Uses PostgreSQL database
- Connects to real SMTP server
- Enables ELK stack logging
- Suitable for pre-production testing

### stop-all.sh
Stops all Docker services.

```bash
./scripts/stop-all.sh
```

**Options:**
- Basic stop: Stops containers but preserves volumes
- Complete cleanup: `docker compose -f docker-compose.yml down -v`

### logs.sh
View logs for a specific service.

```bash
./scripts/logs.sh [service-name] [options]

# Examples
./scripts/logs.sh backend -f              # Follow backend logs
./scripts/logs.sh backend --tail=100      # Last 100 lines
./scripts/logs.sh frontend -f --tail=50   # Follow with last 50 lines
```

**Available services:**
- backend
- frontend
- nginx
- db
- elasticsearch
- logstash
- kibana
- mailhog

### reset-db.sh
Resets the local database (⚠️ destructive operation).

```bash
./scripts/reset-db.sh
```

**Warning:** This will delete all data in the local database!

## Quick Reference

```bash
# Start development
./scripts/start-local.sh

# View backend logs
./scripts/logs.sh backend -f

# Stop everything
./scripts/stop-all.sh

# Reset database (if needed)
./scripts/reset-db.sh
```

## Troubleshooting

### Permission Denied
If you get permission errors, make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Docker Not Running
Ensure Docker Desktop is running:
```bash
docker ps
```

### Port Conflicts
If ports are already in use:
1. Stop the conflicting service
2. Or modify ports in docker-compose.yml

## Notes

- Scripts use `docker compose` (v2 plugin syntax)
- Environment variables are loaded from `.env` file
- Local development uses volume mounts for hot-reload
- Logs are stored in containers, use `logs.sh` to view them
