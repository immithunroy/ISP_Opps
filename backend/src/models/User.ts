import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { appConfig } from '../config';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMINISTRATOR' 
  | 'HR' 
  | 'NOC_ENGINEER' 
  | 'GIS_MANAGER' 
  | 'SUPERVISOR' 
  | 'TECHNICIAN' 
  | 'FIELD_ENGINEER' 
  | 'READ_ONLY';

export interface IUser extends Document {
  employee?: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const userSchema = new Schema<IUser>({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', unique: true, sparse: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: [
    'SUPER_ADMIN', 'ADMINISTRATOR', 'HR', 'NOC_ENGINEER', 
    'GIS_MANAGER', 'SUPERVISOR', 'TECHNICIAN', 'FIELD_ENGINEER', 'READ_ONLY'
  ]},
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true, index: true },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  refreshToken: { type: String, select: false },
}, {
  timestamps: true,
  collection: 'users',
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, appConfig.security.bcryptRounds);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = async function(): Promise<void> {
  if (this.lockUntil && this.lockUntil > new Date()) return;
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  }
  
  await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  await this.updateOne({ $set: { loginAttempts: 0, lockUntil: null } });
};

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

export const User = mongoose.model<IUser>('User', userSchema);