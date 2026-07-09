export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  employeeId?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Employee {
  id: string;
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
  mobile: string;
  email: string;
  address: string;
  joiningDate: string;
  isActive: boolean;
  profilePhoto?: string;
  faceEmbedding?: number[];
  emergencyContact: {
    name: string;
    relationship: string;
    mobile: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  employee: string;
  date: string;
  type: 'MORNING_CHECK_IN' | 'LUNCH_OUT' | 'LUNCH_IN' | 'EVENING_CHECK_OUT';
  status: 'PRESENT' | 'LATE' | 'EARLY_DEPARTURE' | 'ABSENT' | 'ON_LEAVE';
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    bearing?: number;
    speed?: number;
    timestamp: string;
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
  syncedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: string;
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
  installationDate: string;
  installedBy: string;
  vendor: string;
  brand: string;
  model: string;
  serialNumber: string;
  remarks: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DAMAGED';
  photos: {
    url: string;
    thumbnailUrl: string;
    capturedAt: string;
    capturedBy: string;
    watermark: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface FiberRoute {
  id: string;
  routeId: string;
  name: string;
  cableSize: number;
  fiberCount: number;
  cableType: string;
  installationType: 'UNDERGROUND' | 'AERIAL' | 'DUCT';
  length: number;
  startPoint: {
    assetId: string;
    gps: { latitude: number; longitude: number };
  };
  endPoint: {
    assetId: string;
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
    timestamp: string;
  }[];
  associatedAssets: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Splitter {
  id: string;
  splitterId: string;
  name: string;
  ratio: '1:2' | '1:4' | '1:8' | '1:16' | '1:32' | '1:64';
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  assetId: string;
  inputFiber: {
    cableId: string;
    fiberNumber: number;
  };
  outputFibers: {
    fiberNumber: number;
    connectedCustomer?: string;
    connectedOLTPort?: string;
    connectedSplice?: string;
    loss?: number;
    status: 'ACTIVE' | 'INACTIVE' | 'RESERVED';
  }[];
  loss: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  photos: {
    url: string;
    thumbnailUrl: string;
    capturedAt: string;
    capturedBy: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Splice {
  id: string;
  spliceId: string;
  fiberNumber: number;
  cableA: string;
  cableB: string;
  spliceBox: string;
  technician: string;
  spliceDate: string;
  fusionLoss: number;
  photo: string;
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface TJBox {
  id: string;
  tjBoxId: string;
  name: string;
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  installedDate: string;
  cableEntries: {
    cableId: string;
    port: string;
    fiberCount: number;
  }[];
  cableExits: {
    cableId: string;
    port: string;
    fiberCount: number;
  }[];
  connectedFibers: {
    fiberNumber: number;
    fromCable: string;
    toCable: string;
  }[];
  photos: {
    url: string;
    thumbnailUrl: string;
    capturedAt: string;
    capturedBy: string;
    caption: string;
  }[];
  maintenanceHistory: {
    date: string;
    performedBy: string;
    description: string;
    status: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS';
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Maintenance {
  id: string;
  asset: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  title: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  performedBy?: string;
  cost?: number;
  partsUsed?: string[];
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Notification {
  id: string;
  user: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  actions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}