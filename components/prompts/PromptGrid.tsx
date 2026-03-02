'use client';

import { cn } from '@/lib/utils';
import type { Prompt } from '@/types';
import PromptCard from './PromptCard';

interface PromptGridProps {
  prompts: Prompt[];
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
  onSaveToggle?: (promptId: string, saved: boolean) => void;
  emptyMessage?: string;
  emptyIcon?: string;
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-4 animate-pulse">
      {/* Badges */}
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-24 bg-gray-200 dark:bg-[#2a2a2a] rounded-full" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-[#2a2a2a] rounded-full" />
      </div>
      {/* Title */}
      <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-4/5 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-3/5 mb-3" />
      {/* Preview block */}
      <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2.5 mb-3 space-y-1.5">
        <div className="h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded w-4/6" />
      </div>
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded" />
        ))}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 dark:bg-[#2a2a2a] rounded-full" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-[#2a2a2a] rounded" />
        </div>
        <div className="h-7 w-16 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg" />
      </div>
    </div>
  );
}

export default function PromptGrid({
  prompts,
  loading = false,
  skeletonCount = 9,
  className,
  onSaveToggle,
  emptyMessage = 'No prompts found',
  emptyIcon = '🔍',
}: PromptGridProps) {
  if (loading) {
    return (
      <div className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}>
        {[...Array(skeletonCount)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!prompts || prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">{emptyIcon}</span>
        <h3 className="text-lg font-semibold text-[#0a0a0a] dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
      className
    )}>
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onSaveToggle={onSaveToggle}
        />
      ))}
    </div>
  );
}
