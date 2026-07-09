import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
  mobile: string;
  email: string;
  address: string;
  joiningDate: Date;
  isActive: boolean;
  profilePhoto?: string;
  faceEmbedding?: number[];
  emergencyContact: {
    name: string;
    relationship: string;
    mobile: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>({
  employeeId: { type: String, required: true, unique: true, index: true },
  employeeCode: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  department: { type: String, required: true, index: true },
  designation: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  address: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true, index: true },
  profilePhoto: { type: String },
  faceEmbedding: { type: [Number] },
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    mobile: { type: String, required: true },
  },
}, {
  timestamps: true,
  collection: 'employees',
});

employeeSchema.index({ department: 1, isActive: 1 });
employeeSchema.index({ name: 'text', employeeCode: 'text', email: 'text' });

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);