import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  permissions: [{ type: String }],
}, {
  timestamps: true,
  collection: 'roles',
});

export const Role = mongoose.model<IRole>('Role', roleSchema);