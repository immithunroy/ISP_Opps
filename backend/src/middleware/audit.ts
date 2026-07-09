import { Request, Response, NextFunction } from 'express';
import { AuditLog, AuditAction } from '../models/AuditLog';

declare global {
  namespace Express {
    interface Request {
      auditData?: {
        action: AuditAction;
        resource: string;
        resourceId?: string;
        oldData?: any;
        newData?: any;
      };
    }
  }
}

export const auditMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function (body?: any): Response {
    const responseTime = Date.now() - startTime;
    const shouldAudit = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || 
                       req.path.includes('/attendance') ||
                       req.path.includes('/login') ||
                       req.path.includes('/logout');

    if (shouldAudit && req.user) {
      const auditEntry = {
        user: req.user._id,
        action: req.auditData?.action || getActionFromMethod(req.method),
        resource: req.auditData?.resource || req.path,
        resourceId: req.auditData?.resourceId || req.params.id,
        oldData: req.auditData?.oldData,
        newData: req.auditData?.newData || (typeof body === 'string' ? JSON.parse(body) : body),
        ipAddress: req.ip || req.socket.remoteAddress || '',
        userAgent: req.get('User-Agent') || '',
        deviceInfo: req.get('X-Device-Info') || '',
        status: res.statusCode >= 400 ? 'FAILED' : 'SUCCESS',
        errorMessage: res.statusCode >= 400 ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
        metadata: {
          method: req.method,
          path: req.path,
          responseTime,
          query: req.query,
        },
      };

      AuditLog.create(auditEntry).catch(err => 
        console.error('Audit log error:', err)
      );
    }

    return originalSend.call(this, body);
  };

  next();
};

function getActionFromMethod(method: string): AuditAction {
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT': 
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'VIEW';
  }
}

export const setAuditData = (data: {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  oldData?: any;
  newData?: any;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.auditData = data;
    next();
  };
};