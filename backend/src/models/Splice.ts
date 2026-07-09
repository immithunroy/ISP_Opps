import mongoose, { Document, Schema } from 'mongoose';

export interface ISplice extends Document {
  spliceId: string;
  fiberNumber: number;
  cableA: mongoose.Types.ObjectId;
  cableB: mongoose.Types.ObjectId;
  spliceBox: mongoose.Types.ObjectId;
  technician: mongoose.Types.ObjectId;
  spliceDate: Date;
  fusionLoss: number;
  photo: string;
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

const spliceSchema = new Schema<ISplice>({
  spliceId: { type: String, required: true, unique: true, index: true },
  fiberNumber: { type: Number, required: true },
  cableA: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  cableB: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  spliceBox: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  technician: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  spliceDate: { type: Date, required: true },
  fusionLoss: { type: Number, required: true, min: 0 },
  photo: { type: String, required: true },
  gps: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, required: true },
  },
  remarks: { type: String },
}, {
  timestamps: true,
  collection: 'splices',
});

spliceSchema.index({ cableA: 1, cableB: 1 });
spliceSchema.index({ spliceBox: 1 });
spliceSchema.index({ technician: 1, spliceDate: -1 });

export const Splice = mongoose.model<ISplice>('Splice', spliceSchema);