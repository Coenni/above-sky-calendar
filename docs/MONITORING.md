# Monitoring Guide

## Above Sky Calendar - Monitoring and Observability

This guide covers the monitoring stack, dashboards, alerts, and observability best practices.

## Monitoring Stack

### Components

- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards
- **Alertmanager**: Alert routing and notifications
- **Node Exporter**: System metrics
- **Postgres Exporter**: Database metrics
- **Redis Exporter**: Cache metrics
- **cAdvisor**: Container metrics

## Setup

### Starting Monitoring Stack

```bash
# Start monitoring with main application
docker-compose -f docker-compose.yml \
               -f docker-compose.prod.yml \
               -f docker-compose.monitoring.yml up -d

# Or separately
docker-compose -f docker-compose.monitoring.yml up -d
```

### Accessing Services

Via SSH tunnel (recommended for security):
```bash
# Grafana
ssh -L 3000:localhost:3000 user@your-vps-ip

# Prometheus
ssh -L 9090:localhost:9090 user@your-vps-ip

# Alertmanager
ssh -L 9093:localhost:9093 user@your-vps-ip
```

Then access at:
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

## Grafana Dashboards

### Default Dashboard

The "Above Sky Calendar - Application Dashboard" includes:

1. **Service Health**
   - Application status (UP/DOWN)
   - Request rate
   - Error rate
   - Average response time

2. **Performance Metrics**
   - Request rate by status code
   - Response time percentiles (p50, p95, p99)
   - Throughput graphs

3. **Resource Usage**
   - JVM memory (heap/non-heap)
   - CPU usage (process and system)
   - Thread count

4. **Database Metrics**
   - Connection pool status
   - Active/idle connections
   - Query performance

5. **Cache Metrics**
   - Cache hit rate
   - Cache size
   - Evictions

6. **Top Endpoints**
   - Most requested endpoints
   - Slowest endpoints
   - Error-prone endpoints

### Creating Custom Dashboards

1. Login to Grafana (admin/your-password)
2. Click "+" > "Dashboard"
3. Add panels with Prometheus queries
4. Save dashboard

Example queries:
```promql
# Request rate
rate(http_server_requests_seconds_count[5m])

# Error rate
rate(http_server_requests_seconds_count{status=~"5.."}[5m])

# Memory usage
jvm_memory_used_bytes{area="heap"}

# Cache hit rate
rate(cache_gets{result="hit"}[5m]) / rate(cache_gets[5m])
```

## Prometheus Metrics

### Application Metrics

Spring Boot Actuator exposes metrics at: `/api/actuator/prometheus`

Key metric types:
- **http_server_requests_seconds**: HTTP request metrics
- **jvm_memory_used_bytes**: JVM memory usage
- **process_cpu_usage**: CPU usage
- **hikaricp_connections**: Database connections
- **cache_gets**: Cache operations

### System Metrics

Node Exporter provides:
- **node_cpu_seconds_total**: CPU time
- **node_memory_MemAvailable_bytes**: Available memory
- **node_filesystem_avail_bytes**: Disk space
- **node_network_receive_bytes_total**: Network traffic

### Database Metrics

Postgres Exporter provides:
- **pg_stat_database_numbackends**: Active connections
- **pg_stat_statements_mean_time_seconds**: Query performance
- **pg_database_size_bytes**: Database size

### Querying Metrics

Direct Prometheus queries:
```promql
# Current CPU usage
process_cpu_usage{job="backend"}

# 95th percentile response time
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))

# Error rate percentage
rate(http_server_requests_seconds_count{status=~"5.."}[5m]) / 
rate(http_server_requests_seconds_count[5m]) * 100

# Database connections
hikaricp_connections_active{pool="HikariPool-1"}

# Cache hit rate
rate(cache_gets{result="hit"}[5m]) / rate(cache_gets[5m])
```

## Alerts

### Alert Configuration

Alerts are defined in `monitoring/prometheus/alerts.yml` and grouped by:
- Application alerts
- Database alerts
- Cache alerts
- System alerts
- Nginx alerts

### Alert Rules

#### Critical Alerts

**BackendDown**: Application unavailable
- Condition: `up{job="backend"} == 0`
- Duration: 2 minutes
- Action: Immediate investigation

**DatabaseDown**: Database unavailable
- Condition: `up{job="postgres"} == 0`
- Duration: 2 minutes
- Action: Check database logs, restart if needed

**CriticalDiskSpace**: < 5% disk space
- Condition: `disk_usage > 95%`
- Duration: 1 minute
- Action: Clean up immediately

#### Warning Alerts

**HighErrorRate**: > 5% error rate
- Condition: `error_rate > 0.05`
- Duration: 5 minutes
- Action: Check logs, investigate

**HighResponseTime**: p95 > 1 second
- Condition: `p95_latency > 1s`
- Duration: 10 minutes
- Action: Check for bottlenecks

**HighMemoryUsage**: > 85% memory
- Condition: `memory_usage > 0.85`
- Duration: 10 minutes
- Action: Monitor, restart if needed

### Alert Notifications

Alerts are sent to Slack via Alertmanager:
- Critical alerts → #critical-alerts
- Warnings → #alerts
- Database alerts → #database-alerts

### Testing Alerts

```bash
# Trigger test alert
curl -X POST http://localhost:9093/api/v1/alerts \
  -H 'Content-Type: application/json' \
  -d '[{
    "labels": {"alertname": "TestAlert", "severity": "warning"},
    "annotations": {"summary": "Test alert"}
  }]'
```

## Best Practices

### Dashboard Design

1. **Start Simple**: Begin with key metrics
2. **Group Related Metrics**: Organize by service/component
3. **Use Appropriate Visualizations**: Graphs for trends, stats for current values
4. **Set Meaningful Thresholds**: Based on baseline performance
5. **Add Context**: Use annotations and labels

### Alert Management

1. **Avoid Alert Fatigue**: Only alert on actionable issues
2. **Set Appropriate Thresholds**: Based on actual capacity and SLAs
3. **Use Severity Levels**: Critical, warning, info
4. **Document Runbooks**: Link alerts to response procedures
5. **Test Regularly**: Verify alerts work as expected

### Query Optimization

1. **Use Recording Rules**: Pre-compute expensive queries
2. **Limit Time Ranges**: Use appropriate scrape intervals
3. **Use Labels Wisely**: Don't over-cardinalize
4. **Aggregate When Possible**: Reduce data points

## Troubleshooting

### Metrics Not Appearing

```bash
# Check if Prometheus can reach target
curl http://localhost:9090/api/v1/targets

# Check application metrics endpoint
curl http://localhost:8080/api/actuator/prometheus

# Verify Prometheus config
docker exec prometheus promtool check config /etc/prometheus/prometheus.yml
```

### Grafana Connection Issues

```bash
# Check Grafana logs
docker-compose logs grafana

# Verify datasource configuration
curl http://localhost:3000/api/datasources

# Test Prometheus connection
curl http://localhost:9090/-/healthy
```

### High Cardinality

If Prometheus is slow:
```bash
# Check cardinality
curl http://localhost:9090/api/v1/status/tsdb

# Identify high cardinality metrics
curl http://localhost:9090/api/v1/label/__name__/values
```

Solution: Reduce label count or use recording rules.

## Maintenance

### Data Retention

Default: 30 days
```yaml
# In prometheus.yml command args
--storage.tsdb.retention.time=30d
```

### Backup Prometheus Data

```bash
# Stop Prometheus
docker-compose stop prometheus

# Backup data directory
tar czf prometheus-backup.tar.gz ./prometheus_data/

# Restart Prometheus
docker-compose start prometheus
```

### Cleanup Old Data

```bash
# Prometheus automatically removes old data based on retention
# Manual cleanup if needed:
docker exec prometheus promtool tsdb clean-tombstones
```

## Monitoring Checklist

### Daily
- [ ] Check Grafana dashboard for anomalies
- [ ] Review critical alerts
- [ ] Verify all targets are up

### Weekly
- [ ] Review alert history
- [ ] Check disk space usage
- [ ] Verify backup jobs running

### Monthly
- [ ] Review and update alert thresholds
- [ ] Clean up unused dashboards
- [ ] Update documentation
- [ ] Test alert notifications

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Alert Manager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)

## Support

For monitoring issues:
1. Check this guide
2. Review Prometheus/Grafana logs
3. Consult `docs/RUNBOOK.md` for common issues
4. Contact DevOps team
