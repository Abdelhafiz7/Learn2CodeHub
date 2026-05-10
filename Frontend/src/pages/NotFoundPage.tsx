import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui';

export const NotFoundPage: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100">
      <BookOpen className="h-12 w-12 text-indigo-400" />
    </div>
    <h1 className="mb-2 text-6xl font-bold text-gray-900">404</h1>
    <h2 className="mb-3 text-2xl font-semibold text-gray-700">Page Not Found</h2>
    <p className="mb-8 max-w-md text-gray-500">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/">
      <Button leftIcon={<Home className="h-4 w-4" />}>Back to Home</Button>
    </Link>
  </div>
);
