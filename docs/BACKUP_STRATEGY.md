# Backup Strategy

## Overview

This document outlines the comprehensive backup strategy for the ISP Platform, ensuring data durability, recoverability, and compliance with operational requirements.

## Backup Types

### 1. Full Database Backup (Daily)
- **Frequency**: Daily at 02:00 UTC
- **Retention**: 30 days
- **Method**: `mongodump` with compression
- **Scope**: All collections

### 2. Incremental Backup (Every 6 Hours)
- **Frequency**: Every 6 hours (02:00, 08:00, 14:00, 20:00 UTC)
- **Retention**: 7 days
- **Method**: Oplog-based incremental
- **Scope**: Changed documents since last backup

### 3. Configuration Backup (On Change)
- **Trigger**: Any config change (docker-compose, nginx, env)
- **Method**: Git commit + file copy
- **Retention**: 90 days

### 4. Uploads Backup (Daily)
- **Frequency**: Daily at 03:00 UTC
- **Retention**: 30 days
- **Method**: rsync to backup storage
- **Scope**: `/app/uploads` directory

### 5. Logs Backup (Weekly)
- **Frequency**: Weekly (Sunday 04:00 UTC)
- **Retention**: 90 days
- **Method**: Compressed archive
- **Scope**: Application logs

## Backup Storage

### Primary Storage (On-Server)
```
/opt/backups/isp-platform/
├── mongodb/
│   ├── full/           # Daily full backups
│   └── incremental/    # 6-hour incrementals
├── uploads/
│   └── daily/
├── config/
│   └── git/            # Config git repo
└── logs/
    └── weekly/
```

### Secondary Storage (Off-Site)
- **Provider**: AWS S3 / Google Cloud Storage / Azure Blob
- **Encryption**: AES-256 at rest
- **Replication**: Cross-region
- **Access**: IAM roles with least privilege

### Tertiary Storage (Cold Archive)
- **Provider**: AWS Glacier / Azure Archive
- **Retention**: 7 years (compliance)
- **Retrieval**: 12-48 hours

## Backup Implementation

### Automated Backup Script

```bash
#!/bin/bash
# /opt/scripts/backup-full.sh
# Run daily via cron: 0 2 * * * /opt/scripts/backup-full.sh

set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="/opt/backups/isp-platform"
MONGO_URI="mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/isp-platform?authSource=admin"
S3_BUCKET="s3://your-backup-bucket/isp-platform"

# Create directories
mkdir -p "${BACKUP_ROOT}/mongodb/full/${DATE}"
mkdir -p "${BACKUP_ROOT}/uploads/daily/${DATE}"

echo "Starting full backup at $(date)"

# 1. MongoDB Full Backup
echo "Backing up MongoDB..."
docker exec isp-mongodb mongodump \
  --uri="${MONGO_URI}" \
  --gzip \
  --out="${BACKUP_ROOT}/mongodb/full/${DATE}" \
  --excludeCollection=audit_logs \
  --excludeCollection=notifications

# Compress
tar -czf "${BACKUP_ROOT}/mongodb/full/isp-platform-${DATE}.tar.gz" \
  -C "${BACKUP_ROOT}/mongodb/full" "${DATE}"

# Verify
if [ ! -f "${BACKUP_ROOT}/mongodb/full/isp-platform-${DATE}.tar.gz" ]; then
  echo "ERROR: Backup file not created"
  exit 1
fi

# Upload to S3
echo "Uploading to S3..."
aws s3 cp "${BACKUP_ROOT}/mongodb/full/isp-platform-${DATE}.tar.gz" \
  "${S3_BUCKET}/mongodb/full/" \
  --storage-class STANDARD_IA

# 2. Uploads Backup
echo "Backing up uploads..."
rsync -av --delete \
  /app/uploads/ \
  "${BACKUP_ROOT}/uploads/daily/${DATE}/"

tar -czf "${BACKUP_ROOT}/uploads/daily/uploads-${DATE}.tar.gz" \
  -C "${BACKUP_ROOT}/uploads/daily" "${DATE}"

aws s3 cp "${BACKUP_ROOT}/uploads/daily/uploads-${DATE}.tar.gz" \
  "${S3_BUCKET}/uploads/daily/" \
  --storage-class STANDARD_IA

# 3. Cleanup old local backups (keep 7 days)
find "${BACKUP_ROOT}/mongodb/full" -name "*.tar.gz" -mtime +7 -delete
find "${BACKUP_ROOT}/uploads/daily" -name "*.tar.gz" -mtime +7 -delete

# 4. Cleanup old S3 backups (handled by lifecycle policy)
# Lifecycle: 30 days STANDARD_IA -> 90 days GLACIER -> 7 years DEEP_ARCHIVE

echo "Backup completed successfully at $(date)"

# Notify (optional)
# curl -X POST "$SLACK_WEBHOOK" -d '{"text":"ISP Platform backup completed"}'
```

### Incremental Backup Script

```bash
#!/bin/bash
# /opt/scripts/backup-incremental.sh
# Run every 6 hours: 0 */6 * * * /opt/scripts/backup-incremental.sh

set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="/opt/backups/isp-platform"
MONGO_URI="mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/isp-platform?authSource=admin"
S3_BUCKET="s3://your-backup-bucket/isp-platform"

mkdir -p "${BACKUP_ROOT}/mongodb/incremental/${DATE}"

echo "Starting incremental backup at $(date)"

# Get last backup timestamp
LAST_BACKUP=$(ls -t "${BACKUP_ROOT}/mongodb/full"/isp-platform-*.tar.gz 2>/dev/null | head -1)
if [ -z "$LAST_BACKUP" ]; then
  echo "No full backup found, running full backup instead"
  /opt/scripts/backup-full.sh
  exit 0
fi

# Extract timestamp from filename
LAST_TS=$(basename "$LAST_BACKUP" | sed 's/isp-platform-\(.*\)\.tar\.gz/\1/')
LAST_DATE=$(date -d "${LAST_TS:0:8} ${LAST_TS:9:2}:${LAST_TS:11:2}:${LAST_TS:13:2}" +%s)

# Oplog dump since last backup
docker exec isp-mongodb mongodump \
  --uri="${MONGO_URI}" \
  --gzip \
  --oplogReplay \
  --out="${BACKUP_ROOT}/mongodb/incremental/${DATE}" \
  --query='{"ts": {"$gt": {"$timestamp": {"t": '${LAST_DATE}', "i": 1}}}}'

tar -czf "${BACKUP_ROOT}/mongodb/incremental/isp-platform-inc-${DATE}.tar.gz" \
  -C "${BACKUP_ROOT}/mongodb/incremental" "${DATE}"

aws s3 cp "${BACKUP_ROOT}/mongodb/incremental/isp-platform-inc-${DATE}.tar.gz" \
  "${S3_BUCKET}/mongodb/incremental/" \
  --storage-class STANDARD_IA

# Cleanup local (keep 3 days)
find "${BACKUP_ROOT}/mongodb/incremental" -name "*.tar.gz" -mtime +3 -delete

echo "Incremental backup completed at $(date)"
```

### Uploads Backup Script

```bash
#!/bin/bash
# /opt/scripts/backup-uploads.sh
# Run daily: 0 3 * * * /opt/scripts/backup-uploads.sh

set -euo pipefail

DATE=$(date +%Y%m%d)
BACKUP_ROOT="/opt/backups/isp-platform"
S3_BUCKET="s3://your-backup-bucket/isp-platform"

mkdir -p "${BACKUP_ROOT}/uploads/daily/${DATE}"

echo "Backing up uploads at $(date)"

# Sync uploads directory
rsync -av --delete \
  --exclude="*.tmp" \
  --exclude="*.temp" \
  /app/uploads/ \
  "${BACKUP_ROOT}/uploads/daily/${DATE}/"

# Compress
tar -czf "${BACKUP_ROOT}/uploads/daily/uploads-${DATE}.tar.gz" \
  -C "${BACKUP_ROOT}/uploads/daily" "${DATE}"

# Upload to S3 with intelligent tiering
aws s3 cp "${BACKUP_ROOT}/uploads/daily/uploads-${DATE}.tar.gz" \
  "${S3_BUCKET}/uploads/daily/" \
  --storage-class INTELLIGENT_TIERING

# Cleanup local (keep 14 days)
find "${BACKUP_ROOT}/uploads/daily" -name "*.tar.gz" -mtime +14 -delete

echo "Uploads backup completed at $(date)"
```

## Restore Procedures

### 1. Full Database Restore

```bash
#!/bin/bash
# /opt/scripts/restore-full.sh <backup-date>
# Usage: ./restore-full.sh 20240115_020000

set -euo pipefail

BACKUP_DATE=$1
BACKUP_ROOT="/opt/backups/isp-platform"
MONGO_URI="mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/isp-platform?authSource=admin"
S3_BUCKET="s3://your-backup-bucket/isp-platform"

if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 <backup-date>"
  echo "Available backups:"
  aws s3 ls "${S3_BUCKET}/mongodb/full/" | grep tar.gz
  exit 1
fi

echo "Restoring from backup: ${BACKUP_DATE}"

# Download from S3 if not local
LOCAL_BACKUP="${BACKUP_ROOT}/mongodb/full/isp-platform-${BACKUP_DATE}.tar.gz"
if [ ! -f "$LOCAL_BACKUP" ]; then
  echo "Downloading from S3..."
  aws s3 cp "${S3_BUCKET}/mongodb/full/isp-platform-${BACKUP_DATE}.tar.gz" "$LOCAL_BACKUP"
fi

# Extract
TEMP_DIR=$(mktemp -d)
tar -xzf "$LOCAL_BACKUP" -C "$TEMP_DIR"

# Stop application
docker-compose stop backend frontend nginx

# Restore
echo "Restoring MongoDB..."
docker exec -i isp-mongodb mongorestore \
  --uri="${MONGO_URI}" \
  --gzip \
  --drop \
  --dir="${TEMP_DIR}/${BACKUP_DATE}"

# Cleanup
rm -rf "$TEMP_DIR"

# Restart application
docker-compose start backend frontend nginx

echo "Restore completed. Verify application health."
```

### 2. Point-in-Time Recovery

```bash
#!/bin/bash
# /opt/scripts/restore-pitr.sh <target-timestamp>
# Usage: ./restore-pitr.sh "2024-01-15 14:30:00"

set -euo pipefail

TARGET_TS=$1
BACKUP_ROOT="/opt/backups/isp-platform"
MONGO_URI="mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/isp-platform?authSource=admin"

if [ -z "$TARGET_TS" ]; then
  echo "Usage: $0 \"YYYY-MM-DD HH:MM:SS\""
  exit 1
fi

TARGET_EPOCH=$(date -d "$TARGET_TS" +%s)
echo "Target restore time: $TARGET_TS (epoch: $TARGET_EPOCH)"

# Find the full backup before target time
FULL_BACKUP=$(ls -t "${BACKUP_ROOT}/mongodb/full"/isp-platform-*.tar.gz | while read f; do
  TS=$(basename "$f" | sed 's/isp-platform-\(.*\)\.tar\.gz/\1/')
  TS_EPOCH=$(date -d "${TS:0:8} ${TS:9:2}:${TS:11:2}:${TS:13:2}" +%s 2>/dev/null || echo 0)
  if [ "$TS_EPOCH" -le "$TARGET_EPOCH" ]; then
    echo "$f"
    break
  fi
done)

if [ -z "$FULL_BACKUP" ]; then
  echo "No suitable full backup found before target time"
  exit 1
fi

echo "Using full backup: $FULL_BACKUP"

# Find incrementals between full backup and target
FULL_TS=$(basename "$FULL_BACKUP" | sed 's/isp-platform-\(.*\)\.tar\.gz/\1/')
FULL_EPOCH=$(date -d "${FULL_TS:0:8} ${FULL_TS:9:2}:${FULL_TS:11:2}:${TS:13:2}" +%s)

INCREMENTALS=$(ls -t "${BACKUP_ROOT}/mongodb/incremental"/isp-platform-inc-*.tar.gz | while read f; do
  TS=$(basename "$f" | sed 's/isp-platform-inc-\(.*\)\.tar\.gz/\1/')
  TS_EPOCH=$(date -d "${TS:0:8} ${TS:9:2}:${TS:11:2}:${TS:13:2}" +%s 2>/dev/null || echo 0)
  if [ "$TS_EPOCH" -gt "$FULL_EPOCH" ] && [ "$TS_EPOCH" -le "$TARGET_EPOCH" ]; then
    echo "$f"
  fi
done)

# Restore process
TEMP_DIR=$(mktemp -d)

echo "Extracting full backup..."
tar -xzf "$FULL_BACKUP" -C "$TEMP_DIR"
FULL_DIR=$(basename "$FULL_BACKUP" .tar.gz)

echo "Restoring full backup..."
docker exec -i isp-mongodb mongorestore \
  --uri="${MONGO_URI}" \
  --gzip \
  --drop \
  --dir="${TEMP_DIR}/${FULL_DIR}"

# Apply incrementals in chronological order
for inc in $(echo "$INCREMENTALS" | tac); do
  echo "Applying incremental: $inc"
  INC_DIR=$(mktemp -d)
  tar -xzf "$inc" -C "$INC_DIR"
  INC_NAME=$(basename "$inc" .tar.gz)
  
  docker exec -i isp-mongodb mongorestore \
    --uri="${MONGO_URI}" \
    --gzip \
    --oplogReplay \
    --dir="${INC_DIR}/${INC_NAME}"
  
  rm -rf "$INC_DIR"
done

rm -rf "$TEMP_DIR"

echo "Point-in-time restore completed to $TARGET_TS"
```

### 3. Selective Collection Restore

```bash
#!/bin/bash
# /opt/scripts/restore-collection.sh <collection> <backup-date>

set -euo pipefail

COLLECTION=$1
BACKUP_DATE=$2
BACKUP_ROOT="/opt/backups/isp-platform"
MONGO_URI="mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/isp-platform?authSource=admin"

if [ -z "$COLLECTION" ] || [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 <collection> <backup-date>"
  exit 1
fi

LOCAL_BACKUP="${BACKUP_ROOT}/mongodb/full/isp-platform-${BACKUP_DATE}.tar.gz"
if [ ! -f "$LOCAL_BACKUP" ]; then
  aws s3 cp "s3://your-backup-bucket/isp-platform/mongodb/full/isp-platform-${BACKUP_DATE}.tar.gz" "$LOCAL_BACKUP"
fi

TEMP_DIR=$(mktemp -d)
tar -xzf "$LOCAL_BACKUP" -C "$TEMP_DIR"

COLLECTION_FILE="${TEMP_DIR}/${BACKUP_DATE}/isp-platform/${COLLECTION}.bson.gz"

if [ ! -f "$COLLECTION_FILE" ]; then
  echo "Collection $COLLECTION not found in backup"
  exit 1
fi

echo "Restoring collection: $COLLECTION"
docker exec -i isp-mongodb mongorestore \
  --uri="${MONGO_URI}" \
  --gzip \
  --drop \
  --nsInclude="isp-platform.${COLLECTION}" \
  --dir="${TEMP_DIR}/${BACKUP_DATE}"

rm -rf "$TEMP_DIR"
echo "Collection restore completed"
```

### 4. Uploads Restore

```bash
#!/bin/bash
# /opt/scripts/restore-uploads.sh <backup-date>

set -euo pipefail

BACKUP_DATE=$1
BACKUP_ROOT="/opt/backups/isp-platform"
S3_BUCKET="s3://your-backup-bucket/isp-platform"

if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 <backup-date>"
  exit 1
fi

LOCAL_BACKUP="${BACKUP_ROOT}/uploads/daily/uploads-${BACKUP_DATE}.tar.gz"
if [ ! -f "$LOCAL_BACKUP" ]; then
  echo "Downloading from S3..."
  aws s3 cp "${S3_BUCKET}/uploads/daily/uploads-${BACKUP_DATE}.tar.gz" "$LOCAL_BACKUP"
fi

echo "Restoring uploads from ${BACKUP_DATE}..."

# Stop services to prevent upload conflicts
docker-compose stop backend

# Backup current uploads
mv /app/uploads /app/uploads.backup.$(date +%s)

# Extract
mkdir -p /app/uploads
tar -xzf "$LOCAL_BACKUP" -C /app/uploads --strip-components=1

# Fix permissions
chown -R 1001:1001 /app/uploads

# Restart
docker-compose start backend

echo "Uploads restore completed"
```

## Backup Verification

### Automated Verification

```bash
#!/bin/bash
# /opt/scripts/verify-backup.sh <backup-date>

set -euo pipefail

BACKUP_DATE=$1
BACKUP_ROOT="/opt/backups/isp-platform"
MONGO_URI="mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/isp-platform?authSource=admin"

if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 <backup-date>"
  exit 1
fi

LOCAL_BACKUP="${BACKUP_ROOT}/mongodb/full/isp-platform-${BACKUP_DATE}.tar.gz"
if [ ! -f "$LOCAL_BACKUP" ]; then
  echo "Backup not found locally"
  exit 1
fi

# Test extraction
TEMP_DIR=$(mktemp -d)
tar -tzf "$LOCAL_BACKUP" > /dev/null
if [ $? -ne 0 ]; then
  echo "ERROR: Backup archive corrupted"
  exit 1
fi

# Test restore to temporary database
TEST_DB="isp-platform-verify-${BACKUP_DATE}"
echo "Testing restore to $TEST_DB..."

tar -xzf "$LOCAL_BACKUP" -C "$TEMP_DIR"
docker exec -i isp-mongodb mongorestore \
  --uri="mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/${TEST_DB}?authSource=admin" \
  --gzip \
  --dir="${TEMP_DIR}/${BACKUP_DATE}"

# Verify collections
COLLECTIONS=$(docker exec isp-mongodb mongosh --quiet --eval "
  db = db.getSiblingDB('${TEST_DB}');
  print(Object.keys(db.getCollectionInfos().reduce((acc, c) => { acc[c.name] = true; return acc; }, {})));
")

echo "Collections restored: $COLLECTIONS"

# Cleanup test database
docker exec isp-mongodb mongosh --quiet --eval "
  db.getSiblingDB('${TEST_DB}').dropDatabase();
"

rm -rf "$TEMP_DIR"

echo "Backup verification PASSED"
```

### Health Checks

```bash
# Add to cron for daily verification
# 0 4 * * * /opt/scripts/verify-backup.sh $(date -d "yesterday" +%Y%m%d_%H%M%S) >> /var/log/backup-verify.log 2>&1
```

## Disaster Recovery Plan

### RTO/RPO Targets
| Component | RTO | RPO |
|-----------|-----|-----|
| Database | 2 hours | 6 hours |
| Uploads | 4 hours | 24 hours |
| Config | 30 min | 0 (git) |
| Full Platform | 4 hours | 6 hours |

### Recovery Scenarios

#### Scenario 1: Single Server Failure
1. Provision new server
2. Install Docker/Docker Compose
3. Clone repository
4. Restore from latest full backup
5. Apply incrementals
6. Restore uploads
7. Update DNS
8. Verify health

#### Scenario 2: Data Center Outage
1. Failover to secondary region
2. Restore from off-site backups
3. Update DNS to secondary
4. Verify all services

#### Scenario 3: Ransomware/Corruption
1. Isolate affected systems
2. Identify last clean backup
3. Restore from clean backup
4. Apply incrementals up to infection point
5. Security audit before going live

## Monitoring & Alerting

### Backup Success Metrics
- Backup job completion status
- Backup size (alert if >20% change)
- Backup duration (alert if >2x normal)
- S3 upload success
- Verification job success

### Alert Channels
- **Critical**: PagerDuty + Slack + Email
- **Warning**: Slack + Email
- **Info**: Slack

### Dashboard Metrics
- Last successful backup time
- Backup size trends
- Restore test results
- Storage utilization

## Compliance

### Data Retention Requirements
- **Financial records**: 7 years
- **Audit logs**: 1 year (auto-expire)
- **Employee data**: Per local labor laws
- **Network assets**: Indefinite

### Encryption
- **At rest**: AES-256 (S3 SSE-KMS)
- **In transit**: TLS 1.3
- **Key management**: AWS KMS / HashiCorp Vault

### Access Control
- Backup access: Read-only IAM roles
- Restore access: Break-glass procedure
- Audit trail: All backup/restore operations logged

## Testing Schedule

| Test Type | Frequency | Scope |
|-----------|-----------|-------|
| Full restore test | Monthly | Complete platform |
| Incremental restore | Weekly | Last 24 hours |
| Collection restore | Bi-weekly | Critical collections |
| Uploads restore | Monthly | Random sample |
| DR drill | Quarterly | Full failover |

## Documentation

All backup/restore operations must be documented in:
- Runbook: `/opt/runbooks/backup-restore.md`
- Incident log: `/var/log/incidents/`
- Change log: Git commits for config changes