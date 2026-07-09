import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { appConfig } from './config';
import { connectDB } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';

// Route imports
import authRoutes from './modules/auth/routes';
import employeeRoutes from './modules/employees/routes';
import attendanceRoutes from './modules/attendance/routes';
import assetRoutes from './modules/assets/routes';
import fiberRoutes from './modules/fiber/routes';
import splitterRoutes from './modules/splitters/routes';
import spliceRoutes from './modules/splices/routes';
import tjboxRoutes from './modules/tjboxes/routes';
import maintenanceRoutes from './modules/maintenance/routes';
import mapRoutes from './modules/map/routes';
import reportRoutes from './modules/reports/routes';
import auditRoutes from './modules/audit/routes';
import notificationRoutes from './modules/notifications/routes';
import userRoutes from './modules/users/routes';
import roleRoutes from './modules/roles/routes';
import permissionRoutes from './modules/permissions/routes';
import importExportRoutes from './modules/import-export/routes';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: appConfig.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: appConfig.security.rateLimitWindowMs,
  max: appConfig.security.rateLimitMaxRequests,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(`${appConfig.apiPrefix}/`, limiter);

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: appConfig.env,
  });
});

app.get(`${appConfig.apiPrefix}/health`, (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: appConfig.env,
  });
});

// API Routes
app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
app.use(`${appConfig.apiPrefix}/employees`, authenticate, employeeRoutes);
app.use(`${appConfig.apiPrefix}/attendance`, authenticate, attendanceRoutes);
app.use(`${appConfig.apiPrefix}/assets`, authenticate, assetRoutes);
app.use(`${appConfig.apiPrefix}/fiber`, authenticate, fiberRoutes);
app.use(`${appConfig.apiPrefix}/splitters`, authenticate, splitterRoutes);
app.use(`${appConfig.apiPrefix}/splices`, authenticate, spliceRoutes);
app.use(`${appConfig.apiPrefix}/tjboxes`, authenticate, tjboxRoutes);
app.use(`${appConfig.apiPrefix}/maintenance`, authenticate, maintenanceRoutes);
app.use(`${appConfig.apiPrefix}/map`, authenticate, mapRoutes);
app.use(`${appConfig.apiPrefix}/reports`, authenticate, reportRoutes);
app.use(`${appConfig.apiPrefix}/audit`, authenticate, auditRoutes);
app.use(`${appConfig.apiPrefix}/notifications`, authenticate, notificationRoutes);
app.use(`${appConfig.apiPrefix}/users`, authenticate, userRoutes);
app.use(`${appConfig.apiPrefix}/roles`, authenticate, roleRoutes);
app.use(`${appConfig.apiPrefix}/permissions`, authenticate, permissionRoutes);
app.use(`${appConfig.apiPrefix}/import-export`, authenticate, importExportRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'NotFound', message: 'Route not found' });
});

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    
    app.listen(appConfig.port, () => {
      logger.info(`Server running on port ${appConfig.port} in ${appConfig.env} mode`);
      logger.info(`API available at http://localhost:${appConfig.port}${appConfig.apiPrefix}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export default app;