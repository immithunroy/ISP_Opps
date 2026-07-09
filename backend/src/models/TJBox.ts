import mongoose, { Document, Schema } from 'mongoose';

export interface ITJBox extends Document {
  tjBoxId: string;
  name: string;
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  installedDate: Date;
  cableEntries: {
    cableId: mongoose.Types.ObjectId;
    port: string;
    fiberCount: number;
  }[];
  cableExits: {
    cableId: mongoose.Types.ObjectId;
    port: string;
    fiberCount: number;
  }[];
  connectedFibers: {
    fiberNumber: number;
    fromCable: mongoose.Types.ObjectId;
    toCable: mongoose.Types.ObjectId;
  }[];
  photos: {
    url: string;
    thumbnailUrl: string;
    capturedAt: Date;
    capturedBy: mongoose.Types.ObjectId;
    caption: string;
  }[];
  maintenanceHistory: {
    date: Date;
    performedBy: mongoose.Types.ObjectId;
    description: string;
    status: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const tjBoxSchema = new Schema<ITJBox>({
  tjBoxId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  gps: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, required: true },
  },
  installedDate: { type: Date, required: true },
  cableEntries: [{
    cableId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    port: { type: String, required: true },
    fiberCount: { type: Number, required: true },
  }],
  cableExits: [{
    cableId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    port: { type: String, required: true },
    fiberCount: { type: Number, required: true },
  }],
  connectedFibers: [{
    fiberNumber: { type: Number, required: true },
    fromCable: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    toCable: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  }],
  photos: [{
    url: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    capturedAt: { type: Date, required: true },
    capturedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    caption: { type: String },
  }],
  maintenanceHistory: [{
    date: { type: Date, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['COMPLETED', 'PENDING', 'IN_PROGRESS'], required: true },
  }],
}, {
  timestamps: true,
  collection: 'tj_boxes',
});

tjBoxSchema.index({ 'gps.latitude': 1, 'gps.longitude': 1 });
tjBoxSchema.index({ installedDate: -1 });

export const TJBox = mongoose.model<ITJBox>('TJBox', tjBoxSchema);