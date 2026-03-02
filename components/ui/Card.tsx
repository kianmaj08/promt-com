import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  className,
  hover = false,
  onClick,
  padding = 'md',
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a]',
        'shadow-card dark:shadow-card-dark',
        'transition-all duration-200',
        hover && 'hover:border-[#F5C518] hover:shadow-lg cursor-pointer hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// Sub-components
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 mb-3', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-2 mt-4 pt-4 border-t border-[#e5e5e5] dark:border-[#2a2a2a]', className)}>
      {children}
    </div>
  );
}
