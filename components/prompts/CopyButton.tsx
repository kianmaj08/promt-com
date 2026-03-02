'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn, copyToClipboard } from '@/lib/utils';
import showToast from '@/components/ui/Toast';

interface CopyButtonProps {
  text: string;
  promptId?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'ghost';
  showLabel?: boolean;
  className?: string;
  onCopied?: () => void;
}

export default function CopyButton({
  text,
  promptId,
  size = 'md',
  variant = 'primary',
  showLabel = true,
  className,
  onCopied,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const success = await copyToClipboard(text);
    if (!success) {
      showToast.error('Failed to copy. Please try again.');
      return;
    }

    setCopied(true);
    showToast.success('Copied to clipboard!');

    // Increment copy counter in background
    if (promptId) {
      fetch(`/api/prompts/${promptId}/copy`, { method: 'POST' }).catch(() => {});
    }

    onCopied?.();

    setTimeout(() => setCopied(false), 2000);
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs h-7 gap-1.5',
    md: 'px-3.5 py-2 text-sm h-9 gap-2',
    lg: 'px-5 py-2.5 text-base h-11 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const variants = {
    primary: copied
      ? 'bg-green-500 text-white'
      : 'bg-[#F5C518] text-[#0a0a0a] hover:bg-[#e6b800]',
    ghost: copied
      ? 'text-green-500 border-green-500'
      : 'text-gray-600 dark:text-gray-400 border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#F5C518] hover:text-[#F5C518]',
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'border transition-all duration-200',
        variant === 'primary' ? 'border-transparent shadow-sm' : '',
        variant === 'ghost' ? 'bg-transparent' : '',
        'focus:outline-none focus:ring-2 focus:ring-[#F5C518] focus:ring-offset-1',
        'active:scale-95',
        sizes[size],
        variants[variant],
        className
      )}
      aria-label="Copy prompt"
    >
      {copied ? (
        <Check className={cn(iconSizes[size], 'flex-shrink-0')} />
      ) : (
        <Copy className={cn(iconSizes[size], 'flex-shrink-0')} />
      )}
      {showLabel && <span>{copied ? 'Copied!' : 'Copy'}</span>}
    </button>
  );
}
