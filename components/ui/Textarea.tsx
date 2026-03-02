'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, showCount, maxLength, className, id, value, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="text-sm font-medium text-[#0a0a0a] dark:text-white"
            >
              {label}
              {props.required && <span className="text-[#F5C518] ml-1">*</span>}
            </label>
            {showCount && maxLength && (
              <span className={cn(
                'text-xs',
                currentLength > maxLength * 0.9 ? 'text-[#F5C518]' : 'text-gray-400'
              )}>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full rounded-lg border bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'border-[#e5e5e5] dark:border-[#2a2a2a]',
            'focus:outline-none focus:ring-2 focus:ring-[#F5C518] focus:border-[#F5C518]',
            'transition-all duration-200 resize-y',
            'py-2.5 px-3.5 text-sm',
            'min-h-[100px]',
            error && 'border-red-500 focus:ring-red-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
