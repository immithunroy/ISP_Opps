import mongoose, { Document, Schema } from 'mongoose';

export type InstallationType = 'UNDERGROUND' | 'AERIAL' | 'DUCT';

export interface IFiberRoute extends Document {
  routeId: string;
  name: string;
  cableSize: number;
  fiberCount: number;
  cableType: string;
  installationType: InstallationType;
  length: number;
  startPoint: {
    assetId: mongoose.Types.ObjectId;
    gps: { latitude: number; longitude: number };
  };
  endPoint: {
    assetId: mongoose.Types.ObjectId;
    gps: { latitude: number; longitude: number };
  };
  polyline: {
    type: 'LineString';
    coordinates: number[][];
  };
  gpsTrack: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  }[];
  associatedAssets: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const fiberRouteSchema = new Schema<IFiberRoute>({
  routeId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  cableSize: { type: Number, required: true },
  fiberCount: { type: Number, required: true },
  cableType: { type: String, required: true },
  installationType: { type: String, enum: ['UNDERGROUND', 'AERIAL', 'DUCT'], required: true },
  length: { type: Number, required: true },
  startPoint: {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    gps: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  endPoint: {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    gps: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  polyline: {
    type: { type: String, enum: ['LineString'], default: 'LineString' },
    coordinates: { type: [[Number]], required: true },
  },
  gpsTrack: [{
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timestamp: { type: Date, required: true },
  }],
  associatedAssets: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
}, {
  timestamps: true,
  collection: 'fiber_routes',
});

fiberRouteSchema.index({ polyline: '2dsphere' });
fiberRouteSchema.index({ installationType: 1 });
fiberRouteSchema.index({ associatedAssets: 1 });

export const FiberRoute = mongoose.model<IFiberRoute>('FiberRoute', fiberRouteSchema);