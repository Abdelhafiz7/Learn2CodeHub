import React from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

interface StarRatingProps {
  rating?: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'sm',
  showValue = true,
  reviewCount,
}) => {
  const safeRating = rating ?? 0;
  const safeReviewCount = reviewCount ?? 0;

  return (
    <div className="flex items-center gap-1">
      {showValue && (
        <span className="text-sm font-semibold text-amber-500">
          {safeRating.toFixed(1)}
        </span>
      )}

      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, i) => {
          const filled = i < Math.floor(safeRating);
          const partial = !filled && i < safeRating;

          return (
            <Star
              key={i}
              className={clsx(
                sizeClasses[size],
                filled || partial ? 'text-amber-400' : 'text-gray-300',
                filled && 'fill-amber-400'
              )}
            />
          );
        })}
      </div>

      {reviewCount !== undefined && (
        <span className="text-xs text-gray-500">
          ({safeReviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};
