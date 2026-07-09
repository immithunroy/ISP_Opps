# Local Development Setup

## Prerequisites
- Node.js 20+ (installed)
- MongoDB (choose one option below)

## MongoDB Options

### Option 1: MongoDB Atlas (Recommended - Free Tier Available)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/isp-platform`
4. Update `.env` file with your connection string

### Option 2: Install MongoDB Community Server Locally
- Download from: https://www.mongodb.com/try/download/community
- Follow installation instructions for Windows
- MongoDB will run on `mongodb://localhost:27017`

### Option 3: Use Docker Desktop (Recommended for Production-like Environment)
- Download from: https://www.docker.com/products/docker-desktop
- Run: `docker-compose up -d`

## Running the Application

### Backend
```bash
cd c:\ISP_Opps\backend
npm run dev
```

### Frontend
```bash
cd c:\ISP_Opps\frontend
npm run dev
```

## Access
- Frontend: http://localhost:5173
- API: http://localhost:3000/api/v1

## Quick Start with MongoDB Atlas

1. Sign up at https://www.mongodb.com/cloud/atas/register
2. Create a free cluster (M0 tier)
3. In "Connect" → "Connect your application"
4. Copy connection string
5. Create `.env` file in root:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/isp-platform?retryWrites=true&w=majority

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-32-char-minimum-secret-key
JWT_REFRESH_SECRET=your-32-char-minimum-refresh-secret

# Other settings
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
CLIENT_URL=http://localhost:5173
```

6. Run migrations and seed:
```bash
cd c:\ISP_Opps\backend
npm run migrate
npm run seed
```

7. Start both servers:
```bash
# Terminal 1 - Backend
cd c:\ISP_Opps\backend
npm run dev

# Terminal 2 - Frontend
cd c:\ISP_Opps\frontend
npm run dev
```

8. Access http://localhost:5173 and login with:
- Username: `superadmin`
- Password: `SuperAdmin@123`