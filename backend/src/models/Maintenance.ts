import mongoose, { Document, Schema } from 'mongoose';

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface IMaintenance extends Document {
  asset: mongoose.Types.ObjectId;
  type: MaintenanceType;
  status: MaintenanceStatus;
  title: string;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  performedBy?: mongoose.Types.ObjectId;
  cost?: number;
  partsUsed?: string[];
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceSchema = new Schema<IMaintenance>({
  asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  type: { type: String, enum: ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'], required: true },
  status: { type: String, enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED', index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  scheduledDate: { type: Date, required: true, index: true },
  completedDate: { type: Date },
  performedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  cost: { type: Number },
  partsUsed: [{ type: String }],
  remarks: { type: String },
}, {
  timestamps: true,
  collection: 'maintenance',
});

maintenanceSchema.index({ asset: 1, status: 1 });
maintenanceSchema.index({ scheduledDate: 1, status: 1 });

export const Maintenance = mongoose.model<IMaintenance>('Maintenance', maintenanceSchema);