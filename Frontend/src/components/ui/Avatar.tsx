import React from 'react';
import { clsx } from 'clsx';
import { getInitials } from '@/utils';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
  firstName = "", 
  lastName = "",   
  imageUrl,
  size = 'md',
  className,
}) => {
  const initials = getInitials(firstName, lastName);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${firstName} ${lastName}`}
        className={clsx(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-indigo-600 font-semibold text-white',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
};
