import React from 'react';
import { User } from '../../types/User';
import AccessDeniedPage from '../AccessDeniedPage';

interface AdminGuardProps {
  currentUser: User | null;
  isLoading?: boolean;
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ currentUser, isLoading, children }) => {
  // Loading state - show skeleton
  if (isLoading || !currentUser) {
    return (
      <div className="bg-white min-h-0">
        <div className="animate-pulse p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Access denied if not ADMIN
  if (currentUser.role !== 'ADMIN') {
    return <AccessDeniedPage />;
  }

  // Render protected content
  return <>{children}</>;
};

export default AdminGuard;