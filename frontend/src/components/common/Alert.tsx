import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  dismissible?: boolean;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400',
};

export const Alert: React.FC<AlertProps> = ({ 
  type, 
  title, 
  children, 
  className = '', 
  onClose, 
  dismissible = true 
}) => {
  const Icon = icons[type];

  return (
    <div
      className={`flex items-start p-4 rounded-lg border ${styles[type]} ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5 mt-0.5" />
      </div>
      <div className="ml-3 flex-1">
        {title && (
          <h3 className="text-sm font-medium">{title}</h3>
        )}
        <div className={`mt-1 text-sm ${title ? 'mt-2' : ''}`}>
          {children}
        </div>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};