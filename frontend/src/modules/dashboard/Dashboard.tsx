import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome, {user?.name || 'User'}!</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-2">Today's Attendance</h3>
            <p className="text-3xl font-bold text-blue-600">-</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-2">Active Assets</h3>
            <p className="text-3xl font-bold text-green-600">-</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-2">Pending Maintenance</h3>
            <p className="text-3xl font-bold text-orange-600">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};