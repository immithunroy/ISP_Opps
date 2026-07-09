import mongoose, { Document, Schema } from 'mongoose';

export type SplitRatio = '1:2' | '1:4' | '1:8' | '1:16' | '1:32' | '1:64';

export interface ISplitter extends Document {
  splitterId: string;
  name: string;
  ratio: SplitRatio;
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  assetId: mongoose.Types.ObjectId;
  inputFiber: {
    cableId: mongoose.Types.ObjectId;
    fiberNumber: number;
  };
  outputFibers: {
    fiberNumber: number;
    connectedCustomer?: mongoose.Types.ObjectId;
    connectedOLTPort?: string;
    connectedSplice?: mongoose.Types.ObjectId;
    loss?: number;
    status: 'ACTIVE' | 'INACTIVE' | 'RESERVED';
  }[];
  loss: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  photos: {
    url: string;
    thumbnailUrl: string;
    capturedAt: Date;
    capturedBy: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const splitterSchema = new Schema<ISplitter>({
  splitterId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  ratio: { type: String, enum: ['1:2', '1:4', '1:8', '1:16', '1:32', '1:64'], required: true },
  gps: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, required: true },
  },
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  inputFiber: {
    cableId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    fiberNumber: { type: Number, required: true },
  },
  outputFibers: [{
    fiberNumber: { type: Number, required: true },
    connectedCustomer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    connectedOLTPort: { type: String },
    connectedSplice: { type: Schema.Types.ObjectId, ref: 'Splice' },
    loss: { type: Number },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'RESERVED'], default: 'ACTIVE' },
  }],
  loss: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], default: 'ACTIVE' },
  photos: [{
    url: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    capturedAt: { type: Date, required: true },
    capturedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  }],
}, {
  timestamps: true,
  collection: 'splitters',
});

splitterSchema.index({ assetId: 1 });
splitterSchema.index({ ratio: 1, status: 1 });
splitterSchema.index({ 'gps.latitude': 1, 'gps.longitude': 1 });

export const Splitter = mongoose.model<ISplitter>('Splitter', splitterSchema);