import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  resource: string;
  actions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>({
  resource: { type: String, required: true, unique: true, index: true },
  actions: [{ type: String, required: true }],
}, {
  timestamps: true,
  collection: 'permissions',
});

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);