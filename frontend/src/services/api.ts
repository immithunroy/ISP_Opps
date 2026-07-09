import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { User, LoginCredentials, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
              const { accessToken, refreshToken: newRefreshToken } = response.data;
              
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await this.client.post('/auth/logout', { refreshToken });
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await this.client.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiService = new ApiService();

export const authService = {
  login: (credentials: LoginCredentials) => apiService.login(credentials),
  logout: () => apiService.logout(),
  getCurrentUser: () => apiService.getCurrentUser(),
};

export const employeeService = {
  list: (params?: any) => apiService.getClient().get('/employees', { params }),
  get: (id: string) => apiService.getClient().get(`/employees/${id}`),
  create: (data: any) => apiService.getClient().post('/employees', data),
  update: (id: string, data: any) => apiService.getClient().patch(`/employees/${id}`, data),
  delete: (id: string) => apiService.getClient().delete(`/employees/${id}`),
  uploadPhoto: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiService.getClient().post(`/employees/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const attendanceService = {
  list: (params?: any) => apiService.getClient().get('/attendance', { params }),
  get: (id: string) => apiService.getClient().get(`/attendance/${id}`),
  create: (data: any) => apiService.getClient().post('/attendance', data),
  bulkCreate: (data: any[]) => apiService.getClient().post('/attendance/bulk', data),
  getToday: () => apiService.getClient().get('/attendance/today'),
  getEmployeeAttendance: (employeeId: string, params?: any) => 
    apiService.getClient().get(`/attendance/employee/${employeeId}`, { params }),
};

export const assetService = {
  list: (params?: any) => apiService.getClient().get('/assets', { params }),
  get: (id: string) => apiService.getClient().get(`/assets/${id}`),
  create: (data: any) => apiService.getClient().post('/assets', data),
  update: (id: string, data: any) => apiService.getClient().patch(`/assets/${id}`, data),
  delete: (id: string) => apiService.getClient().delete(`/assets/${id}`),
  uploadPhotos: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    return apiService.getClient().post(`/assets/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deletePhoto: (id: string, photoId: string) => 
    apiService.getClient().delete(`/assets/${id}/photos/${photoId}`),
  getNearby: (lat: number, lng: number, radius: number) => 
    apiService.getClient().get('/assets/nearby', { params: { lat, lng, radius } }),
};

export const fiberService = {
  list: (params?: any) => apiService.getClient().get('/fiber', { params }),
  get: (id: string) => apiService.getClient().get(`/fiber/${id}`),
  create: (data: any) => apiService.getClient().post('/fiber', data),
  update: (id: string, data: any) => apiService.getClient().patch(`/fiber/${id}`, data),
  delete: (id: string) => apiService.getClient().delete(`/fiber/${id}`),
};

export const splitterService = {
  list: (params?: any) => apiService.getClient().get('/splitters', { params }),
  get: (id: string) => apiService.getClient().get(`/splitters/${id}`),
  create: (data: any) => apiService.getClient().post('/splitters', data),
  update: (id: string, data: any) => apiService.getClient().patch(`/splitters/${id}`, data),
  delete: (id: string) => apiService.getClient().delete(`/splitters/${id}`),
  getOutputs: (id: string) => apiService.getClient().get(`/splitters/${id}/outputs`),
  connectOutput: (id: string, outputId: string, data: any) => 
    apiService.getClient().post(`/splitters/${id}/outputs/${outputId}/connect`, data),
};

export const spliceService = {
  list: (params?: any) => apiService.getClient().get('/splices', { params }),
  get: (id: string) => apiService.getClient().get(`/splices/${id}`),
  create: (data: any) => apiService.getClient().post('/splices', data),
  update: (id: string, data: any) => apiService.getClient().patch(`/splices/${id}`, data),
  delete: (id: string) => apiService.getClient().delete(`/splices/${id}`),
};

export const tjboxService = {
  list: (params?: any) => apiService.getClient().get('/tjboxes', { params }),
  get: (id: string) => apiService.getClient().get(`/tjboxes/${id}`),
  create: (data: any) => apiService.getClient().post('/tjboxes', data),
  update: (id: string, data: any) => apiService.getClient().patch(`/tjboxes/${id}`, data),
  delete: (id: string) => apiService.getClient().delete(`/tjboxes/${id}`),
  getMaintenanceHistory: (id: string) => apiService.getClient().get(`/tjboxes/${id}/maintenance`),
  addMaintenance: (id: string, data: any) => apiService.getClient().post(`/tjboxes/${id}/maintenance`, data),
};

export const maintenanceService = {
  list: (params?: any) => apiService.getClient().get('/maintenance', { params }),
  get: (id: string) => apiService.getClient().get(`/maintenance/${id}`),
  create: (data: any) => apiService.getClient().post('/maintenance', data),
  update: (id: string, data: any) => apiService.getClient().patch(`/maintenance/${id}`, data),
  delete: (id: string) => apiService.getClient().delete(`/maintenance/${id}`),
  getUpcoming: () => apiService.getClient().get('/maintenance/upcoming'),
  getOverdue: () => apiService.getClient().get('/maintenance/overdue'),
};

export const mapService = {
  getAssets: (params?: any) => apiService.getClient().get('/map/assets', { params }),
  getRoutes: (params?: any) => apiService.getClient().get('/map/routes', { params }),
  getEmployees: (params?: any) => apiService.getClient().get('/map/employees', { params }),
  search: (query: string) => apiService.getClient().get('/map/search', { params: { q: query } }),
};

export const reportService = {
  attendance: (params?: any) => apiService.getClient().get('/reports/attendance', { params, responseType: 'blob' }),
  assets: (params?: any) => apiService.getClient().get('/reports/assets', { params, responseType: 'blob' }),
  fiber: (params?: any) => apiService.getClient().get('/reports/fiber', { params, responseType: 'blob' }),
  maintenance: (params?: any) => apiService.getClient().get('/reports/maintenance', { params, responseType: 'blob' }),
  gpsAccuracy: (params?: any) => apiService.getClient().get('/reports/gps-accuracy', { params }),
};

export const importExportService = {
  export: (type: string, params?: any) => 
    apiService.getClient().get(`/import-export/export/${type}`, { params, responseType: 'blob' }),
  import: (type: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.getClient().post(`/import-export/import/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadTemplate: (type: string) => 
    apiService.getClient().get(`/import-export/template/${type}`, { responseType: 'blob' }),
};

export const userService = {
  list: (params?: any) => apiService.getClient().get('/users', { params }),
  get: (id: string) => apiService.getClient().get(`/users/${id}`),
  create: (data: any) => apiService.getClient().post('/users', data),
  update: (id: string, data: any) => apiService.getClient().patch(`/users/${id}`, data),
  delete: (id: string) => apiService.getClient().delete(`/users/${id}`),
  resetPassword: (id: string) => apiService.getClient().post(`/users/${id}/reset-password`),
};

export const roleService = {
  list: () => apiService.getClient().get('/roles'),
  get: (id: string) => apiService.getClient().get(`/roles/${id}`),
  create: (data: any) => apiService.getClient().post('/roles', data),
  update: (id: string, data: any) => apiService.getClient().patch(`/roles/${id}`, data),
  delete: (id: string) => apiService.getClient().delete(`/roles/${id}`),
  assignPermissions: (id: string, permissions: string[]) => 
    apiService.getClient().post(`/roles/${id}/permissions`, { permissions }),
};

export const permissionService = {
  list: () => apiService.getClient().get('/permissions'),
};

export const auditService = {
  list: (params?: any) => apiService.getClient().get('/audit', { params }),
  get: (id: string) => apiService.getClient().get(`/audit/${id}`),
};

export const notificationService = {
  list: (params?: any) => apiService.getClient().get('/notifications', { params }),
  markRead: (id: string) => apiService.getClient().patch(`/notifications/${id}/read`),
  markAllRead: () => apiService.getClient().patch('/notifications/read-all'),
  getUnreadCount: () => apiService.getClient().get('/notifications/unread-count'),
};

// Export axios instance for direct use
export const api = apiService.getClient();