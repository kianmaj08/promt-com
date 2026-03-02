import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'category' | 'tag' | 'status' | 'tool';
  onRemove?: () => void;
  className?: string;
}

export default function Badge({ children, variant = 'category', onRemove, className }: BadgeProps) {
  const variants = {
    category:
      'bg-[#F5C518] text-[#0a0a0a] font-semibold',
    tag:
      'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300',
    status:
      'font-medium',
    tool:
      'bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all duration-200',
        variants[variant],
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity rounded-full focus:outline-none"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
