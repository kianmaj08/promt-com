'use client';

import { cn } from '@/lib/utils';
import type { GeneratedPromptVariant } from '@/types';
import CopyButton from '@/components/prompts/CopyButton';

interface VariantSelectorProps {
  variants: GeneratedPromptVariant[];
  selectedId: string | null;
  onSelect: (variant: GeneratedPromptVariant) => void;
}

export default function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: VariantSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Choose the approach that best fits your needs:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {variants.map((variant, index) => {
          const isSelected = selectedId === variant.id;
          const labels = ['Direct', 'Detailed', 'Creative'];
          const emojis = ['⚡', '📋', '🎨'];

          return (
            <button
              key={variant.id}
              onClick={() => onSelect(variant)}
              className={cn(
                'text-left p-4 rounded-xl border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#F5C518]',
                isSelected
                  ? 'border-[#F5C518] bg-[#F5C518]/5 shadow-md'
                  : 'border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] hover:border-[#F5C518]/50'
              )}
            >
              {/* Variant header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{emojis[index]}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {labels[index]}
                      </span>
                      {isSelected && (
                        <span className="text-xs bg-[#F5C518] text-[#0a0a0a] font-bold px-1.5 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#0a0a0a] dark:text-white mt-0.5">
                      {variant.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                {variant.description}
              </p>

              {/* Prompt preview */}
              <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2.5 mb-3 border border-[#e5e5e5] dark:border-[#2a2a2a]">
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400 line-clamp-4 leading-relaxed">
                  {variant.content}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {variant.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Copy button */}
              <div onClick={(e) => e.stopPropagation()}>
                <CopyButton
                  text={variant.content}
                  size="sm"
                  variant="ghost"
                  showLabel
                  className="w-full justify-center"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
