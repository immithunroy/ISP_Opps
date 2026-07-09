# ISP Employee Attendance & GIS Network Asset Management Platform

A production-ready, enterprise-grade platform for ISP employee attendance management (facial recognition + GPS) and comprehensive GIS network asset management.

## 🚀 Features

### Employee Management
- Complete employee profiles with facial embeddings
- Department, designation, emergency contacts
- Profile photos and face recognition data

### Facial Attendance System
- **Multi-type attendance**: Morning Check-in, Lunch Out, Lunch In, Evening Check-out
- **Face recognition** with liveness detection (prevents photo spoofing)
- **GPS validation** with accuracy, altitude, bearing, speed
- **Device security**: Root detection, mock location detection
- **Offline sync** with background synchronization
- **Anti-fraud measures**: Timestamp validation, camera-only capture

### GIS Network Mapping (OpenStreetMap/Leaflet)
- Interactive maps with satellite/street/dark modes
- Layer control, clustering, measurement tools
- Search, filter, and color-coded assets
- Live employee location tracking

### Network Asset Management
- **100+ asset types**: POP, ODF, OLT, ONU, Splitters, Poles, Hand Holes, Man Holes, Splice Boxes, Closures, TJ Boxes, Fiber Cabinets, Switches, Routers, Access Points, Wireless Towers, Racks, Generators, UPS, Battery Banks, Power Meters, Transformers, Customer Premises
- **Asset photos**: 1-3 photos per asset with watermarks (Date, Time, GPS, Employee, Asset ID)
- **Camera-only capture** with auto-compression (2MP, JPEG, Medium Quality)

### Fiber Route Management
- Route mapping with polyline GPS tracks
- Cable specifications (size, fiber count, type)
- Installation type (Underground/Aerial/Duct)
- Start/end points with associated assets

### Splitter Management
- Support for 1:2, 1:4, 1:8, 1:16, 1:32, 1:64 ratios
- Input/output fiber tracking
- Customer/OLT port connections
- Loss monitoring

### Splice & TJ Box Management
- Individual splice tracking with fusion loss
- TJ Box cable entries/exits
- Maintenance history

### Mobile Data Collection (React Native/Flutter ready)
- Offline-first architecture
- Background sync with progress indicators
- GPS auto-capture with device metadata

### Excel Import/Export
- All entities: Employees, Attendance, Assets, Fiber Routes, Splitters, Splices, TJ Boxes, Maintenance
- Formats: Excel (.xlsx) and CSV
- Template downloads for imports

### Role-Based Access Control
- 9 roles: Super Admin, Administrator, HR, NOC Engineer, GIS Manager, Supervisor, Technician, Field Engineer, Read Only
- Configurable permissions

### Audit & Notifications
- Complete audit trail for all actions
- Dashboard alerts for pending items

### Reports
- Attendance, Late, Absent, Employee Route
- Asset, Fiber, Maintenance, Map, Photo, GPS Accuracy

## 🏗️ Architecture

```
isp-platform/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, audit
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helpers
│   │   └── modules/        # Feature modules
│   └── Dockerfile
├── frontend/               # React/Vite/Tailwind
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   ├── utils/          # Helpers
│   │   └── modules/        # Feature modules
│   └── Dockerfile
├── android/                # React Native/Flutter client
├── docker/                 # Docker configs
│   ├── nginx/
│   ├── backend/
│   ├── frontend/
│   └── mongo/
├── scripts/                # Database scripts
├── docs/                   # Documentation
└── docker-compose.yml
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod / express-validator
- **Logging**: Pino
- **Testing**: Vitest

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **State**: TanStack Query + Zustand
- **Routing**: React Router v6
- **Maps**: Leaflet + React-Leaflet
- **Charts**: Chart.js + react-chartjs-2
- **Forms**: React Hook Form + Zod

### Mobile
- **Option A**: React Native (Expo)
- **Option B**: Flutter

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Database**: MongoDB + Mongo Express
- **Cache**: Redis
- **SSL**: Let's Encrypt ready

## 🚀 Quick Start

### Prerequisites
- Docker 24+ and Docker Compose 2+
- 4GB+ RAM available
- Ports 80, 443, 3000, 27017, 6379 available

### Development

```bash
# Clone repository
git clone <repository-url>
cd isp-platform

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Or run locally
npm install
npm run dev
```

### Production

```bash
# Build and start
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Points
- **Frontend**: http://localhost (or your domain)
- **API**: http://localhost/api/v1
- **Health Check**: http://localhost/health
- **Mongo Express**: http://localhost:8081 (admin/admin123)

## 📦 API Documentation

### Authentication
```
POST   /api/v1/auth/login          # Login
POST   /api/v1/auth/refresh        # Refresh token
POST   /api/v1/auth/logout         # Logout
GET    /api/v1/auth/me             # Current user
POST   /api/v1/auth/change-password
```

### Employees
```
GET    /api/v1/employees           # List with pagination/filter
POST   /api/v1/employees           # Create
GET    /api/v1/employees/:id       # Get one
PATCH  /api/v1/employees/:id       # Update
DELETE /api/v1/employees/:id       # Delete
POST   /api/v1/employees/:id/photo # Upload photo
```

### Attendance
```
GET    /api/v1/attendance          # List with filters
POST   /api/v1/attendance          # Create (mobile)
GET    /api/v1/attendance/today    # Today's attendance
GET    /api/v1/attendance/stats    # Statistics
```

### Assets
```
GET    /api/v1/assets              # List with geo-filtering
POST   /api/v1/assets              # Create
GET    /api/v1/assets/:id          # Get one
PATCH  /api/v1/assets/:id          # Update
DELETE /api/v1/assets/:id          # Delete
POST   /api/v1/assets/:id/photos   # Upload photos (1-3)
DELETE /api/v1/assets/:id/photos/:photoId
GET    /api/v1/assets/stats        # Statistics
GET    /api/v1/assets/nearby       # Nearby assets
```

### Fiber Routes
```
GET    /api/v1/fiber               # List
POST   /api/v1/fiber               # Create
GET    /api/v1/fiber/:id           # Get one
PATCH  /api/v1/fiber/:id           # Update
DELETE /api/v1/fiber/:id           # Delete
GET    /api/v1/fiber/geojson       # GeoJSON for map
```

### Splitters
```
GET    /api/v1/splitters
POST   /api/v1/splitters
GET    /api/v1/splitters/:id
PATCH  /api/v1/splitters/:id
DELETE /api/v1/splitters/:id
GET    /api/v1/splitters/:id/outputs
POST   /api/v1/splitters/:id/outputs/:outputId/connect
```

### Splices
```
GET    /api/v1/splices
POST   /api/v1/splices
GET    /api/v1/splices/:id
PATCH  /api/v1/splices/:id
DELETE /api/v1/splices/:id
```

### TJ Boxes
```
GET    /api/v1/tjboxes
POST   /api/v1/tjboxes
GET    /api/v1/tjboxes/:id
PATCH  /api/v1/tjboxes/:id
DELETE /api/v1/tjboxes/:id
GET    /api/v1/tjboxes/:id/maintenance
POST   /api/v1/tjboxes/:id/maintenance
```

### Maintenance
```
GET    /api/v1/maintenance
POST   /api/v1/maintenance
GET    /api/v1/maintenance/:id
PATCH  /api/v1/maintenance/:id
DELETE /api/v1/maintenance/:id
GET    /api/v1/maintenance/upcoming
GET    /api/v1/maintenance/overdue
```

### Map
```
GET    /api/v1/map/assets          # Assets as GeoJSON
GET    /api/v1/map/routes          # Routes as GeoJSON
GET    /api/v1/map/employees       # Live employee locations
GET    /api/v1/map/search?q=       # Search
GET    /api/v1/map/bounds          # Map bounds
```

### Reports
```
GET    /api/v1/reports/attendance
GET    /api/v1/reports/assets
GET    /api/v1/reports/fiber
GET    /api/v1/reports/maintenance
GET    /api/v1/reports/gps-accuracy
GET    /api/v1/reports/export/:type?format=excel|csv
```

### Import/Export
```
POST   /api/v1/import-export/import/:type
GET    /api/v1/import-export/export/:type?format=excel|csv
GET    /api/v1/import-export/template/:type
```

### Admin
```
GET    /api/v1/users
POST   /api/v1/users
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

GET    /api/v1/roles
POST   /api/v1/roles
PATCH  /api/v1/roles/:id
DELETE /api/v1/roles/:id

GET    /api/v1/permissions
GET    /api/v1/audit
GET    /api/v1/notifications
```

## 🔐 Security

- **JWT** with short-lived access tokens (15min) + refresh tokens (7 days)
- **Password hashing**: bcrypt with 12 rounds
- **Rate limiting**: 100 req/15min general, 5 req/min login
- **Helmet**: Security headers
- **CORS**: Configured for specific origins
- **Input validation**: Zod schemas on all endpoints
- **Audit logging**: All actions tracked
- **File upload**: Type validation, size limits, secure storage
- **HTTPS ready**: Nginx SSL termination

## 🗄️ Database Schema

Key collections with indexes:
- **employees**: employeeId, employeeCode, email, mobile (unique), department, isActive
- **attendance**: compound unique (employee, date, type), date, type, isOfflineSync
- **assets**: assetId (unique), category, status, 2dsphere on gps, text search
- **fiber_routes**: routeId (unique), 2dsphere on polyline
- **splitters**: splitterId (unique), ratio, status
- **splices**: spliceId (unique), cableA, cableB
- **tj_boxes**: tjBoxId (unique), 2dsphere on gps
- **maintenance**: asset, status, scheduledDate
- **users**: username, email (unique), role, isActive
- **audit_logs**: TTL index (1 year), compound indexes

## 📱 Mobile App

### React Native Structure
```
android/
├── app/src/main/
│   ├── java/com/isp/attendance/
│   │   ├── ui/           # Screens
│   │   ├── domain/       # Business logic
│   │   ├── data/         # Repository, API
│   │   ├── di/           # Dependency injection
│   │   └── utils/        # Helpers
│   └── res/              # Resources
```

Key features:
- Offline-first with SQLite/AsyncStorage
- Background sync with WorkManager
- Camera-only photo capture
- Face liveness detection (ML Kit)
- GPS spoofing detection
- Root/mock location detection

## 🐳 Docker Deployment

### Services
- **nginx**: Reverse proxy, SSL, rate limiting
- **backend**: Node.js API (multi-stage build)
- **frontend**: Nginx static serving (multi-stage build)
- **mongodb**: Primary database
- **redis**: Caching/sessions
- **mongo-express**: DB admin (dev only)

### Volumes
- `mongodb_data`: Database persistence
- `redis_data`: Redis persistence
- `backend_uploads`: Uploaded files
- `backend_logs`: Application logs

### Health Checks
All services include health checks for orchestration readiness.

## 📊 Monitoring

### Health Endpoints
- `GET /health` - Basic health
- `GET /api/v1/health` - Detailed health with DB/Redis status

### Logging
- Structured JSON logs (Pino)
- Log levels: error, warn, info, debug
- Request/response logging
- Audit trail separate

## 🔧 Configuration

All configuration via environment variables (see `.env.example`):
- Database connections
- JWT secrets
- Rate limits
- File upload limits
- Email settings
- Map tile URLs

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
npm run test:e2e
```

## 📈 Performance

- **Pagination**: Cursor-based on all list endpoints
- **Lazy loading**: React.lazy + Suspense
- **Virtual scrolling**: Large lists
- **Image optimization**: Thumbnails, WebP, compression
- **MongoDB indexes**: Optimized for query patterns
- **Redis caching**: Sessions, frequent queries
- **Code splitting**: Route-based chunks
- **CDN ready**: Static assets

## 🔄 Backup Strategy

```bash
# Automated daily backup (add to cron)
docker exec mongodb mongodump --uri="mongodb://admin:pass@localhost:27017/isp-platform?authSource=admin" --out=/backup/$(date +%F)

# Restore
docker exec -i mongodb mongorestore --uri="mongodb://admin:pass@localhost:27017/isp-platform?authSource=admin" --drop /backup/2024-01-15
```

## 🚀 Future Scalability

- **Microservices**: Split modules into services
- **Kubernetes**: Helm charts for K8s deployment
- **Message Queue**: RabbitMQ/Kafka for async processing
- **Search**: Elasticsearch for full-text search
- **Analytics**: ClickHouse for metrics
- **CDN**: CloudFlare/AWS CloudFront for assets
- **Multi-region**: Database replication

## 📝 License

Proprietary - All rights reserved.

## 🤝 Support

For issues and feature requests, please contact the development team.

---

**Built with ❤️ for ISP Network Operations**