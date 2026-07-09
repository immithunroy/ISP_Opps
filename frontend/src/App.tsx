import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Layout } from './layouts/MainLayout';
import { Login } from './modules/auth/Login';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const Dashboard = lazy(() => import('./modules/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const Employees = lazy(() => import('./modules/employees/Employees').then(m => ({ default: m.Employees })));
const Attendance = lazy(() => import('./modules/attendance/Attendance').then(m => ({ default: m.Attendance })));
const Assets = lazy(() => import('./modules/assets/Assets').then(m => ({ default: m.Assets })));
const FiberRoutes = lazy(() => import('./modules/fiber/FiberRoutes').then(m => ({ default: m.FiberRoutes })));
const Splitters = lazy(() => import('./modules/splitters/Splitters').then(m => ({ default: m.Splitters })));
const Splices = lazy(() => import('./modules/splices/Splices').then(m => ({ default: m.Splices })));
const TJBoxes = lazy(() => import('./modules/tjboxes/TJBoxes').then(m => ({ default: m.TJBoxes })));
const Maintenance = lazy(() => import('./modules/maintenance/Maintenance').then(m => ({ default: m.Maintenance })));
const MapView = lazy(() => import('./modules/map/MapView').then(m => ({ default: m.MapView })));
const Reports = lazy(() => import('./modules/reports/Reports').then(m => ({ default: m.Reports })));
const AdminPanel = lazy(() => import('./modules/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const Settings = lazy(() => import('./modules/settings/Settings').then(m => ({ default: m.Settings })));
const Profile = lazy(() => import('./modules/profile/Profile').then(m => ({ default: m.Profile })));

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/fiber" element={<FiberRoutes />} />
            <Route path="/splitters" element={<Splitters />} />
            <Route path="/splices" element={<Splices />} />
            <Route path="/tjboxes" element={<TJBoxes />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<AdminPanel />} roles={['SUPER_ADMIN', 'ADMINISTRATOR']} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;