import mongoose, { Document, Schema } from 'mongoose';

export type AttendanceType = 'MORNING_CHECK_IN' | 'LUNCH_OUT' | 'LUNCH_IN' | 'EVENING_CHECK_OUT';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'EARLY_DEPARTURE' | 'ABSENT' | 'ON_LEAVE';

export interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  type: AttendanceType;
  status: AttendanceStatus;
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    bearing?: number;
    speed?: number;
    timestamp: Date;
  };
  faceMatchScore?: number;
  facePhoto?: string;
  deviceInfo: {
    deviceId: string;
    deviceName: string;
    androidVersion: string;
    appVersion: string;
    networkType: string;
    batteryLevel: number;
    isRooted: boolean;
    isMockLocation: boolean;
  };
  isOfflineSync: boolean;
  syncedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  date: { type: Date, required: true, index: true },
  type: { 
    type: String, 
    enum: ['MORNING_CHECK_IN', 'LUNCH_OUT', 'LUNCH_IN', 'EVENING_CHECK_OUT'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PRESENT', 'LATE', 'EARLY_DEPARTURE', 'ABSENT', 'ON_LEAVE'], 
    required: true 
  },
  gps: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    altitude: { type: Number },
    bearing: { type: Number },
    speed: { type: Number },
    timestamp: { type: Date, required: true },
  },
  faceMatchScore: { type: Number, min: 0, max: 1 },
  facePhoto: { type: String },
  deviceInfo: {
    deviceId: { type: String, required: true },
    deviceName: { type: String, required: true },
    androidVersion: { type: String, required: true },
    appVersion: { type: String, required: true },
    networkType: { type: String, required: true },
    batteryLevel: { type: Number, required: true },
    isRooted: { type: Boolean, required: true },
    isMockLocation: { type: Boolean, required: true },
  },
  isOfflineSync: { type: Boolean, default: false, index: true },
  syncedAt: { type: Date },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verificationNotes: { type: String },
}, {
  timestamps: true,
  versionKey: false,
});

attendanceSchema.index({ employee: 1, date: 1, type: 1 }, { unique: true });
attendanceSchema.index({ date: 1, type: 1 });
attendanceSchema.index({ isOfflineSync: 1, syncedAt: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);