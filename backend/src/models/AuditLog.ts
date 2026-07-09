import mongoose, { Document, Schema } from 'mongoose';

export type AuditAction = 
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
  | 'ATTENDANCE_CHECK_IN' | 'ATTENDANCE_CHECK_OUT'
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'
  | 'GPS_CHANGE' | 'PHOTO_UPLOAD' | 'PHOTO_DELETE'
  | 'EXPORT' | 'IMPORT'
  | 'ASSET_CREATE' | 'ASSET_UPDATE' | 'ASSET_DELETE'
  | 'ROUTE_CREATE' | 'ROUTE_UPDATE' | 'ROUTE_DELETE'
  | 'SPLITTER_CREATE' | 'SPLITTER_UPDATE' | 'SPLITTER_DELETE'
  | 'SPLICE_CREATE' | 'SPLICE_UPDATE' | 'SPLICE_DELETE'
  | 'TJ_BOX_CREATE' | 'TJ_BOX_UPDATE' | 'TJ_BOX_DELETE'
  | 'MAINTENANCE_CREATE' | 'MAINTENANCE_UPDATE' | 'MAINTENANCE_DELETE'
  | 'EMPLOYEE_CREATE' | 'EMPLOYEE_UPDATE' | 'EMPLOYEE_DELETE'
  | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE'
  | 'ROLE_ASSIGN' | 'PERMISSION_CHANGE';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  action: AuditAction;
  resource: string;
  resourceId?: mongoose.Types.ObjectId;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, index: true, enum: [
    'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
    'ATTENDANCE_CHECK_IN', 'ATTENDANCE_CHECK_OUT',
    'CREATE', 'UPDATE', 'DELETE', 'VIEW',
    'GPS_CHANGE', 'PHOTO_UPLOAD', 'PHOTO_DELETE',
    'EXPORT', 'IMPORT',
    'ASSET_CREATE', 'ASSET_UPDATE', 'ASSET_DELETE',
    'ROUTE_CREATE', 'ROUTE_UPDATE', 'ROUTE_DELETE',
    'SPLITTER_CREATE', 'SPLITTER_UPDATE', 'SPLITTER_DELETE',
    'SPLICE_CREATE', 'SPLICE_UPDATE', 'SPLICE_DELETE',
    'TJ_BOX_CREATE', 'TJ_BOX_UPDATE', 'TJ_BOX_DELETE',
    'MAINTENANCE_CREATE', 'MAINTENANCE_UPDATE', 'MAINTENANCE_DELETE',
    'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE',
    'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
    'ROLE_ASSIGN', 'PERMISSION_CHANGE',
  ]},
  resource: { type: String, required: true, index: true },
  resourceId: { type: Schema.Types.ObjectId, index: true },
  oldData: { type: Schema.Types.Mixed },
  newData: { type: Schema.Types.Mixed },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  deviceInfo: { type: String },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true, default: 'SUCCESS' },
  errorMessage: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'audit_logs',
});

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

auditLogSchema.set('autoIndex', false);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);