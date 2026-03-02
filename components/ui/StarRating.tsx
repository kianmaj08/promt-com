'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const displayValue = hovered ?? value;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayValue;
          const partialFill = !filled && star - 1 < displayValue && displayValue < star;
          const fillPercent = partialFill ? (displayValue - Math.floor(displayValue)) * 100 : 0;

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange?.(star)}
              onMouseEnter={() => !readOnly && setHovered(star)}
              onMouseLeave={() => !readOnly && setHovered(null)}
              className={cn(
                'relative transition-transform duration-100',
                !readOnly && 'hover:scale-110 cursor-pointer',
                readOnly && 'cursor-default',
                'focus:outline-none'
              )}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            >
              {/* Background star (empty) */}
              <svg
                className={cn(sizes[size], 'text-gray-200 dark:text-gray-700')}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>

              {/* Foreground star (filled) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : `${fillPercent}%` }}
              >
                <svg
                  className={cn(sizes[size], 'text-[#F5C518]')}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={cn('font-semibold text-[#0a0a0a] dark:text-white ml-1', textSizes[size])}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
