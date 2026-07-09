# Installation Guide

## System Requirements

### Minimum Hardware
- **CPU**: 2 vCPUs (4 recommended)
- **RAM**: 4 GB (8 GB recommended)
- **Storage**: 50 GB SSD (100 GB recommended)
- **Network**: 100 Mbps (1 Gbps recommended)

### Software Requirements
- **OS**: Ubuntu 22.04 LTS / Debian 12 / CentOS 9 / RHEL 9
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Git**: 2.40+

## Pre-Installation

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Configure Firewall
```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Or firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/your-org/isp-platform.git
cd isp-platform
```

### 2. Configure Environment
```bash
# Copy example environment
cp .env.example .env

# Generate secure secrets
# JWT Secret (32+ chars)
openssl rand -base64 32

# MongoDB Password
openssl rand -base64 24

# Edit .env with your values
nano .env
```

**Required .env variables:**
```env
# Database
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your-secure-password
MONGO_DATABASE=isp-platform

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=your-32-char-min-secret
JWT_REFRESH_SECRET=your-32-char-min-refresh-secret

# Client URL
CLIENT_URL=https://your-domain.com

# Frontend API URL
VITE_API_URL=/api/v1
```

### 3. SSL Certificates (Production)
```bash
# Create SSL directory
mkdir -p docker/nginx/ssl

# Option A: Let's Encrypt (recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/nginx/ssl/key.pem

# Option B: Self-signed (development only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/key.pem \
  -out docker/nginx/ssl/cert.pem \
  -subj "/CN=localhost"
```

### 4. Build and Start
```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Production
docker-compose up -d --build
```

### 5. Verify Installation
```bash
# Check all containers running
docker-compose ps

# Check health
curl http://localhost/health
curl http://localhost/api/v1/health

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 6. Initialize Database
```bash
# Run migrations (creates indexes, default roles/permissions)
docker-compose exec backend npm run migrate

# Seed default data (admin user, roles, permissions)
docker-compose exec backend npm run seed
```

### 7. Create Admin User
```bash
# Option 1: Via seed script (creates admin/admin123)
docker-compose exec backend npm run seed

# Option 2: Manual creation
docker-compose exec backend node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./dist/models/User').User;

mongoose.connect(process.env.MONGODB_URI);
const password = await bcrypt.hash('your-secure-password', 12);
await User.create({
  username: 'admin',
  email: 'admin@your-domain.com',
  password,
  role: 'SUPER_ADMIN',
  permissions: ['*'],
  isActive: true
});
console.log('Admin created');
"
```

## Post-Installation

### 1. Configure Reverse Proxy (if not using Docker Nginx)
```nginx
# /etc/nginx/sites-available/isp-platform
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Setup Automated Backups
```bash
# Create backup script
cat > /opt/backup-isp.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/isp-platform"
mkdir -p $BACKUP_DIR

# MongoDB dump
docker exec isp-mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/isp-platform?authSource=admin" \
  --out=$BACKUP_DIR/$DATE

# Compress
tar -czf $BACKUP_DIR/isp-platform-$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

# Keep last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/isp-platform-$DATE.tar.gz"
EOF

chmod +x /opt/backup-isp.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/backup-isp.sh >> /var/log/isp-backup.log 2>&1" | sudo crontab -
```

### 3. Configure Log Rotation
```bash
# /etc/logrotate.d/isp-platform
/opt/backups/isp-platform/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

### 4. Monitoring Setup (Optional)
```bash
# Install Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvf node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/

# Create systemd service
cat > /etc/systemd/system/node_exporter.service << 'EOF'
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
```

## Mobile App Build

### React Native (Expo)
```bash
cd android

# Install dependencies
npm install

# Development
npx expo start

# Production build (EAS)
npm install -g eas-cli
eas login
eas build --platform android --profile production

# Or build locally
npx expo run:android --variant release
```

### Flutter
```bash
cd android

# Get dependencies
flutter pub get

# Build APK
flutter build apk --release

# Build App Bundle (Play Store)
flutter build appbundle --release
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Port already in use
sudo lsof -i :3000
sudo lsof -i :80

# 2. MongoDB connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# 3. Permission issues
docker-compose exec backend ls -la /app/uploads
```

### Database Connection Failed
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify credentials
docker-compose exec mongodb mongosh -u admin -p --authenticationDatabase admin

# Reset password
docker-compose exec mongodb mongosh --eval "
  db = db.getSiblingDB('admin');
  db.changeUserPassword('admin', 'new-password');
"
```

### Frontend Not Loading
```bash
# Check nginx config
docker-compose exec frontend nginx -t

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### SSL Certificate Issues
```bash
# Test certificate
openssl x509 -in docker/nginx/ssl/cert.pem -text -noout

# Check nginx SSL config
docker-compose exec nginx nginx -t

# Renew Let's Encrypt
sudo certbot renew --quiet
docker-compose restart nginx
```

## Upgrading

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations
docker-compose exec backend npm run migrate
```

## Uninstalling

```bash
# Stop and remove containers
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Remove volumes (WARNING: deletes data)
docker volume rm isp-platform_mongodb_data isp-platform_redis_data isp-platform_backend_uploads isp-platform_backend_logs

# Clean up
docker system prune -af
```