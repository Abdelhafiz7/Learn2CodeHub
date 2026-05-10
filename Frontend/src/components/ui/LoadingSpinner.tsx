import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullPage = false,
  text,
}) => {
  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={clsx('animate-spin text-indigo-600', sizeClasses[size])} />
          {text && <p className="text-sm text-gray-500">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={clsx('animate-spin text-indigo-600', sizeClasses[size])} />
        {text && <p className="text-sm text-gray-500">{text}</p>}
      </div>
    </div>
  );
};
