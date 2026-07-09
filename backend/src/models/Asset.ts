import mongoose, { Document, Schema } from 'mongoose';

export type AssetCategory = 
  | 'POP' | 'CORE_POP' | 'DISTRIBUTION_POINT' | 'ODF' | 'OLT' | 'ONU' 
  | 'SPLITTER' | 'POLE' | 'HAND_HOLE' | 'MAN_HOLE' | 'SPLICE_BOX' | 'CLOSURE' | 'TJ_BOX' | 'FIBER_CABINET'
  | 'SWITCH' | 'ROUTER' | 'ACCESS_POINT' | 'WIRELESS_TOWER' | 'RACK' | 'GENERATOR' | 'UPS' | 'BATTERY_BANK' | 'POWER_METER' | 'TRANSFORMER'
  | 'CUSTOMER_PREMISES' | 'SME_CUSTOMER' | 'CORPORATE_CUSTOMER' | 'WIFI_HOTSPOT'
  | 'UNDERGROUND_ROUTE' | 'AERIAL_ROUTE';

export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DAMAGED';

export interface IAsset extends Document {
  assetId: string;
  name: string;
  category: AssetCategory;
  type: string;
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
  };
  address: string;
  area: string;
  zone: string;
  district: string;
  division: string;
  googleMapsUrl: string;
  openStreetMapUrl: string;
  installationDate: Date;
  installedBy: mongoose.Types.ObjectId;
  vendor: string;
  brand: string;
  model: string;
  serialNumber: string;
  remarks: string;
  status: AssetStatus;
  photos: {
    url: string;
    thumbnailUrl: string;
    capturedAt: Date;
    capturedBy: mongoose.Types.ObjectId;
    watermark: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>({
  assetId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true, enum: [
    'POP', 'CORE_POP', 'DISTRIBUTION_POINT', 'ODF', 'OLT', 'ONU',
    'SPLITTER', 'POLE', 'HAND_HOLE', 'MAN_HOLE', 'SPLICE_BOX', 'CLOSURE', 'TJ_BOX', 'FIBER_CABINET',
    'SWITCH', 'ROUTER', 'ACCESS_POINT', 'WIRELESS_TOWER', 'RACK', 'GENERATOR', 'UPS', 'BATTERY_BANK', 'POWER_METER', 'TRANSFORMER',
    'CUSTOMER_PREMISES', 'SME_CUSTOMER', 'CORPORATE_CUSTOMER', 'WIFI_HOTSPOT',
    'UNDERGROUND_ROUTE', 'AERIAL_ROUTE',
  ]},
  type: { type: String, required: true, index: true },
  gps: {
    latitude: { type: Number, required: true, index: true },
    longitude: { type: Number, required: true, index: true },
    accuracy: { type: Number, required: true },
    altitude: { type: Number },
  },
  address: { type: String, required: true },
  area: { type: String, required: true, index: true },
  zone: { type: String, required: true, index: true },
  district: { type: String, required: true, index: true },
  division: { type: String, required: true, index: true },
  googleMapsUrl: { type: String },
  openStreetMapUrl: { type: String },
  installationDate: { type: Date, required: true },
  installedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  vendor: { type: String },
  brand: { type: String },
  model: { type: String },
  serialNumber: { type: String, unique: true, sparse: true },
  remarks: { type: String },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED'], default: 'ACTIVE', index: true },
  photos: [{
    url: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    capturedAt: { type: Date, required: true },
    capturedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    watermark: { type: String, required: true },
  }],
}, {
  timestamps: true,
  collection: 'assets',
});

assetSchema.index({ category: 1, status: 1 });
assetSchema.index({ area: 1, zone: 1 });
assetSchema.index({ 'gps.latitude': 1, 'gps.longitude': 1 }, { name: 'geospatial' });
assetSchema.index({ name: 'text', assetId: 'text', serialNumber: 'text' });

export const Asset = mongoose.model<IAsset>('Asset', assetSchema);