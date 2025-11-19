'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      // Optional: Add hover effect
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => {
          const value = i + 1;
          const filled = value <= rating;
          const halfFilled = value - 0.5 <= rating && rating < value;

          const starElement = (
            <Star
              className={cn(
                sizeClasses[size],
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : halfFilled
                  ? 'fill-yellow-200 text-yellow-400'
                  : 'fill-gray-200 text-gray-300'
              )}
            />
          );

          if (interactive) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleClick(value)}
                onMouseEnter={() => handleMouseEnter(value)}
                className="transition-colors cursor-pointer hover:scale-110"
              >
                {starElement}
              </button>
            );
          }

          return (
            <div
              key={i}
              className="transition-colors cursor-default"
            >
              {starElement}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

