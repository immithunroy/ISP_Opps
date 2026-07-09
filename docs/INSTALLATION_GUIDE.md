# Installation Guide

## Overview

This guide covers the complete installation and configuration of the ISP Platform for production deployment.

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 vCPUs | 8 vCPUs |
| RAM | 8 GB | 16 GB |
| Storage | 100 GB SSD | 250 GB NVMe |
| Network | 1 Gbps | 10 Gbps |

### Software Requirements

- **OS**: Ubuntu 22.04 LTS / Debian 12 / RHEL 9 / Rocky Linux 9
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Git**: 2.40+

## Pre-Installation

### 1. System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git vim htop net-tools

# Configure kernel parameters
cat << 'EOF' | sudo tee /etc/sysctl.d/99-isp-platform.conf
# Network tuning
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.core.netdev_max_backlog = 65535

# Memory management
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# File handles
fs.file-max = 1000000
EOF

sudo sysctl --system
```

### 2. Docker Installation

```bash
# Install Docker Engine
curl -fsSL https://get.docker.com | sudo sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3. Firewall Configuration

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw allow 3000/tcp comment 'Backend API'  # Internal only
sudo ufw enable

# Or firewalld (RHEL/Rocky)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### 4. Swap Configuration (if RAM < 16GB)

```bash
# Create 4GB swap file
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Tune swappiness
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Installation

### 1. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/your-org/isp-platform.git
sudo chown -R $USER:$USER isp-platform
cd isp-platform
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Generate secure secrets
# JWT Secret (32+ chars)
openssl rand -base64 32

# MongoDB Password
openssl rand -base64 24

# Redis Password (optional)
openssl rand -base64 24
```

Edit `.env` with your values:

```env
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1
CLIENT_URL=https://your-domain.com

# Database
MONGO_ROOT_USER=isp_admin
MONGO_ROOT_PASSWORD=your-secure-mongo-password
MONGO_DATABASE=isp-platform
MONGODB_URI=mongodb://isp_admin:your-secure-mongo-password@mongodb:27017/isp-platform?authSource=admin

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-32-char-minimum-secret-key
JWT_REFRESH_SECRET=your-32-char-minimum-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=5242880

# Logging
LOG_LEVEL=info

# Frontend
VITE_API_URL=/api/v1
```

### 3. SSL Certificates

#### Option A: Let's Encrypt (Production)

```bash
# Install certbot
sudo apt install -y certbot

# Obtain certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy to nginx SSL directory
sudo mkdir -p docker/nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/nginx/ssl/key.pem
sudo chown -R $USER:$USER docker/nginx/ssl

# Setup auto-renewal
echo "0 0 * * * root certbot renew --quiet --post-hook 'docker-compose -f /opt/isp-platform/docker-compose.yml restart nginx'" | sudo tee /etc/cron.d/certbot-renew
```

#### Option B: Self-Signed (Development)

```bash
mkdir -p docker/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/key.pem \
  -out docker/nginx/ssl/cert.pem \
  -subj "/CN=localhost"
```

### 4. Build and Deploy

```bash
# Build all images
docker-compose build --no-cache

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. Database Initialization

```bash
# Wait for MongoDB to be ready (check logs)
docker-compose logs -f mongodb

# Run migrations (creates indexes)
docker-compose exec backend npm run migrate

# Seed initial data (creates admin user, roles, permissions)
docker-compose exec backend npm run seed
```

### 6. Verify Installation

```bash
# Health checks
curl -f http://localhost/health
curl -f http://localhost/api/v1/health

# Check frontend
curl -f http://localhost/ | grep -i "isp platform"

# Check API
curl -f http://localhost/api/v1/auth/me \
  -H "Authorization: Bearer invalid" \
  | grep -i "unauthorized"
```

## Post-Installation

### 1. Create Admin User

```bash
# Default credentials from seed:
# Username: superadmin
# Password: SuperAdmin@123

# Login and change password immediately
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "SuperAdmin@123"}'

# Use returned token to change password
curl -X POST http://localhost/api/v1/auth/change-password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "SuperAdmin@123", "newPassword": "your-secure-password"}'
```

### 2. Configure First Organization

```bash
# Access frontend at https://your-domain.com
# Login with superadmin
# Navigate to Admin > Organizations
# Create your ISP organization
# Configure departments, zones, districts
```

### 3. Setup Email (Optional)

```env
# Add to .env and restart backend
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your-email-password
EMAIL_FROM=ISP Platform <noreply@your-domain.com>
```

```bash
docker-compose restart backend
```

### 4. Configure Backup

```bash
# Create backup script
sudo tee /opt/backup-isp.sh > /dev/null << 'EOF'
#!/bin/bash
set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/isp-platform"
mkdir -p $BACKUP_DIR

# MongoDB dump
docker exec isp-mongodb mongodump \
  --uri="mongodb://isp_admin:your-password@localhost:27017/isp-platform?authSource=admin" \
  --out=$BACKUP_DIR/$DATE

# Compress
tar -czf $BACKUP_DIR/isp-platform-$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/isp-platform-$DATE.tar.gz s3://your-bucket/backups/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/isp-platform-$DATE.tar.gz"
EOF

chmod +x /opt/backup-isp.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-isp.sh >> /var/log/isp-backup.log 2>&1") | crontab -
```

### 5. Setup Monitoring

```bash
# Install Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvf node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/

# Create service
sudo tee /etc/systemd/system/node_exporter.service > /dev/null << 'EOF'
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=root
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=default.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now node_exporter

# Verify
curl http://localhost:9100/metrics | head -20
```

### 6. Log Rotation

```bash
sudo tee /etc/logrotate.d/isp-platform > /dev/null << 'EOF'
/var/log/isp-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    sharedscripts
    postrotate
        docker-compose -f /opt/isp-platform/docker-compose.yml restart backend frontend > /dev/null 2>&1 || true
    endscript
}

/opt/backups/isp-platform/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
```

## Mobile App Configuration

### React Native (Expo)

```bash
cd android

# Install dependencies
npm install

# Configure API URL
cat > .env << 'EOF'
EXPO_PUBLIC_API_URL=https://your-domain.com/api/v1
EXPO_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
EOF

# Development
npx expo start

# Production build
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

### Flutter

```bash
cd android

# Get dependencies
flutter pub get

# Configure
cat > .env << 'EOF'
API_BASE_URL=https://your-domain.com/api/v1
MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
EOF

# Build
flutter build apk --release
flutter build appbundle --release
```

## Updating

### Standard Update

```bash
cd /opt/isp-platform

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Run any new migrations
docker-compose exec backend npm run migrate
```

### Database Migration Only

```bash
docker-compose exec backend npm run migrate
```

### Rollback

```bash
# Rollback to previous version
git checkout <previous-tag>

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# If migration was run, restore database from backup
/opt/backup-isp.sh restore <backup-date>
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend
docker-compose logs --tail=100 mongodb

# Check container status
docker-compose ps

# Check resource usage
docker stats
```

### Database Connection Issues

```bash
# Test MongoDB connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check replica set status
docker-compose exec mongodb mongosh --eval "rs.status()"

# Reset if needed
docker-compose down -v
docker-compose up -d mongodb
# Wait for healthy, then start others
docker-compose up -d
```

### Frontend Not Loading

```bash
# Check nginx config
docker-compose exec frontend nginx -t

# Check built files
docker-compose exec frontend ls -la /usr/share/nginx/html/

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Permission Issues

```bash
# Fix uploads permissions
docker-compose exec backend chown -R nodejs:nodejs /app/uploads
docker-compose exec backend chmod -R 755 /app/uploads

# Fix logs permissions
docker-compose exec backend chown -R nodejs:nodejs /app/logs
```

## Security Hardening

### 1. Change Default Passwords

```bash
# MongoDB
docker-compose exec mongodb mongosh --eval "
  db = db.getSiblingDB('admin');
  db.changeUserPassword('isp_admin', 'new-secure-password');
"

# Update .env with new password
# Restart backend
docker-compose restart backend
```

### 2. Disable Root SSH

```bash
sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 3. Setup Fail2Ban

```bash
sudo apt install -y fail2ban

sudo tee /etc/fail2ban/jail.local > /dev/null << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/*error.log
findtime = 600
bantime = 7200
maxretry = 10
EOF

sudo systemctl enable --now fail2ban
```

### 4. Regular Security Updates

```bash
# Weekly update script
sudo tee /opt/weekly-update.sh > /dev/null << 'EOF'
#!/bin/bash
apt update && apt upgrade -y
docker-compose -f /opt/isp-platform/docker-compose.yml pull
docker-compose -f /opt/isp-platform/docker-compose.yml up -d --build
docker image prune -f
apt autoremove -y
apt clean
EOF

chmod +x /opt/weekly-update.sh

# Add to crontab (Sunday 3 AM)
echo "0 3 * * 0 /opt/weekly-update.sh >> /var/log/weekly-update.log 2>&1" | sudo crontab -
```

## Support

### Log Locations

| Component | Location |
|-----------|----------|
| Backend | `docker-compose logs backend` |
| Frontend | `docker-compose logs frontend` |
| MongoDB | `docker-compose logs mongodb` |
| Nginx | `docker-compose logs nginx` |
| System | `/var/log/syslog` |
| Backups | `/var/log/isp-backup.log` |

### Health Endpoints

| Service | Endpoint |
|---------|----------|
| Platform | `GET /health` |
| API | `GET /api/v1/health` |
| MongoDB | `mongosh --eval "db.adminCommand('ping')"` |
| Redis | `redis-cli ping` |

### Useful Commands

```bash
# View all logs
docker-compose logs -f --tail=100

# Restart single service
docker-compose restart backend

# Scale backend (if using swarm/k8s)
docker-compose up -d --scale backend=3

# Clean up
docker system prune -af --volumes

# Backup database manually
docker-compose exec mongodb mongodump --uri="mongodb://..." --out=/tmp/backup
docker cp isp-mongodb:/tmp/backup ./manual-backup
```