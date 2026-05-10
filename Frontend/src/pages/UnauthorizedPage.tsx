import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const getDashboard = () => {
    switch (user?.role) {
      case 'Admin': return '/admin/dashboard';
      case 'Instructor': return '/instructor/dashboard';
      default: return '/student/dashboard';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <ShieldOff className="h-12 w-12 text-red-400" />
      </div>
      <h1 className="mb-2 text-6xl font-bold text-gray-900">403</h1>
      <h2 className="mb-3 text-2xl font-semibold text-gray-700">Access Denied</h2>
      <p className="mb-8 max-w-md text-gray-500">
        You don't have permission to access this page. Please contact an administrator if you
        believe this is a mistake.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Link to={getDashboard()}>
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};
