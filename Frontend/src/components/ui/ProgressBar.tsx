import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'green' | 'blue' | 'amber';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorClasses = {
  indigo: 'bg-indigo-600',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  color = 'indigo',
  showLabel = false,
  className,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div className={clsx('w-full overflow-hidden rounded-full bg-gray-200', sizeClasses[size])}>
        <div
          className={clsx('h-full rounded-full transition-all duration-300', colorClasses[color])}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
