# Database Backup System

Automated PostgreSQL backup solution for the AI Readiness Assessment Platform.

## Overview

The backup system provides automated, cron-compatible database backups with compression, retention policies, and comprehensive logging.

## Features

- ✅ **Automated PostgreSQL backups** using `pg_dump`
- ✅ **Multiple backup formats** (SQL, Custom, TAR)
- ✅ **Compression support** with gzip
- ✅ **Retention policies** for automatic cleanup
- ✅ **Cron-compatible** for scheduled backups
- ✅ **Comprehensive logging** with timestamps
- ✅ **Error handling** and validation
- ✅ **Environment variable configuration**

## Quick Start

### Prerequisites

1. **PostgreSQL Client Tools**: Ensure `pg_dump` is installed and accessible
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   
   # macOS with Homebrew
   brew install postgresql
   
   # Verify installation
   pg_dump --version
   ```

2. **Environment Variables**: Ensure `DATABASE_URL` is set
   ```bash
   export DATABASE_URL="postgresql://username:password@host:port/database"
   ```

### Basic Usage

```bash
# Simple backup
node server/scripts/backup-database.js

# Compressed backup with custom directory
node server/scripts/backup-database.js --compress --output-dir /backups

# Weekly backup with 90-day retention
node server/scripts/backup-database.js --compress --retain-days 90 --verbose
```

## Configuration Options

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--output-dir <path>` | Backup output directory | `./backups` |
| `--compress` | Compress backup with gzip | `false` |
| `--retain-days <days>` | Days to retain old backups | `30` |
| `--format <format>` | Backup format: sql, custom, tar | `sql` |
| `--verbose` | Enable verbose logging | `false` |
| `--help` | Show help message | - |

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `BACKUP_OUTPUT_DIR` | Default backup directory | No |
| `BACKUP_RETAIN_DAYS` | Default retention period | No |

## Backup Formats

### SQL Format (Default)
- **File Extension**: `.sql`
- **Description**: Plain text SQL dump
- **Use Case**: Human-readable, portable across PostgreSQL versions
- **Compression**: Works well with gzip

### Custom Format
- **File Extension**: `.dump`
- **Description**: PostgreSQL custom format
- **Use Case**: Fastest restore, selective restore options
- **Compression**: Built-in compression

### TAR Format
- **File Extension**: `.tar`
- **Description**: TAR archive format
- **Use Case**: Parallel restore capabilities
- **Compression**: Works with gzip

## Automated Scheduling with Cron

### Examples

```bash
# Edit crontab
crontab -e

# Daily backup at 2 AM with compression
0 2 * * * cd /path/to/project && node server/scripts/backup-database.js --compress

# Weekly backup on Sunday at 3 AM with 90-day retention
0 3 * * 0 cd /path/to/project && node server/scripts/backup-database.js --compress --retain-days 90

# Hourly backup during business hours (9 AM - 6 PM, weekdays)
0 9-18 * * 1-5 cd /path/to/project && node server/scripts/backup-database.js --compress --retain-days 7
```

### Production Recommendations

1. **Daily Backups**: For active production systems
   ```bash
   0 2 * * * cd /path/to/project && node server/scripts/backup-database.js --compress --retain-days 30
   ```

2. **Weekly Full Backups**: For weekly archival
   ```bash
   0 3 * * 0 cd /path/to/project && node server/scripts/backup-database.js --compress --retain-days 90 --format custom
   ```

3. **Monthly Archives**: Long-term retention
   ```bash
   0 4 1 * * cd /path/to/project && node server/scripts/backup-database.js --compress --retain-days 365 --output-dir /archives
   ```

## File Naming Convention

Backup files follow this naming pattern:
```
{database-name}-backup-{timestamp}.{extension}[.gz]
```

Examples:
- `ai_readiness-backup-2024-09-19T02-00-00.sql`
- `ai_readiness-backup-2024-09-19T02-00-00.sql.gz` (compressed)
- `ai_readiness-backup-2024-09-19T02-00-00.dump` (custom format)

## Monitoring and Logging

### Log Levels
- **Standard**: Backup status, completion, and cleanup results
- **Verbose** (`--verbose`): Detailed command execution and file operations

### Log Format
```
[2024-09-19T02:00:00.000Z] Starting database backup process...
[2024-09-19T02:00:05.123Z] ✅ Backup completed successfully!
[2024-09-19T02:00:05.456Z]    File: ./backups/ai_readiness-backup-2024-09-19T02-00-00.sql.gz
[2024-09-19T02:00:05.456Z]    Size: 15.67 MB
[2024-09-19T02:00:06.789Z] 🗑️  Cleaned up 3 old backup(s), freed 45.21 MB
```

### Integration with Monitoring Systems

For production environments, consider integrating with monitoring:

```bash
# Log to syslog
node server/scripts/backup-database.js --compress 2>&1 | logger -t db-backup

# Send email on failure
node server/scripts/backup-database.js --compress || echo "Backup failed" | mail -s "DB Backup Failed" admin@company.com

# Webhook notification
node server/scripts/backup-database.js --compress && curl -X POST webhook-url -d "Backup completed"
```

## Restoration

### From SQL Format
```bash
# Restore from SQL backup
psql -h hostname -U username -d database_name < backup-file.sql

# Restore from compressed SQL backup
gunzip -c backup-file.sql.gz | psql -h hostname -U username -d database_name
```

### From Custom Format
```bash
# Restore from custom format
pg_restore -h hostname -U username -d database_name backup-file.dump

# Parallel restore (faster)
pg_restore -h hostname -U username -d database_name -j 4 backup-file.dump
```

## Troubleshooting

### Common Issues

1. **pg_dump not found**
   ```bash
   # Install PostgreSQL client tools
   sudo apt-get install postgresql-client  # Ubuntu/Debian
   brew install postgresql                  # macOS
   ```

2. **Permission denied**
   ```bash
   # Make script executable
   chmod +x server/scripts/backup-database.js
   ```

3. **Database connection failed**
   ```bash
   # Test DATABASE_URL
   psql $DATABASE_URL -c "SELECT version();"
   ```

4. **Disk space issues**
   ```bash
   # Check available space
   df -h ./backups
   
   # Reduce retention period
   node server/scripts/backup-database.js --retain-days 7
   ```

### Debugging

Enable verbose logging for detailed information:
```bash
node server/scripts/backup-database.js --verbose
```

## Security Considerations

1. **File Permissions**: Backup files may contain sensitive data
   ```bash
   # Restrict backup directory access
   chmod 700 ./backups
   ```

2. **Environment Variables**: Secure DATABASE_URL storage
   ```bash
   # Use .env files with restricted permissions
   chmod 600 .env
   ```

3. **Network Security**: Use SSL connections for remote databases
   ```bash
   # DATABASE_URL with SSL
   export DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

## Performance Tuning

### Large Databases
For databases > 100GB, consider:
- Custom format for faster operations
- Parallel operations where supported
- Network-optimized compression

### High-Frequency Backups
For frequent backups:
- Use incremental strategies
- Monitor disk I/O impact
- Consider read replicas for backup sources

## Integration Examples

### GitHub Actions
```yaml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install PostgreSQL client
        run: sudo apt-get install -y postgresql-client
      - name: Run backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: node server/scripts/backup-database.js --compress
```

### Docker Integration
```dockerfile
# Install PostgreSQL client in container
RUN apt-get update && apt-get install -y postgresql-client

# Add backup script
COPY server/scripts/backup-database.js /app/backup-database.js

# Schedule with cron
RUN echo "0 2 * * * cd /app && node backup-database.js --compress" | crontab -
```