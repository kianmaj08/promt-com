'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, BookmarkCheck, Eye, Copy, Zap } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { cn, truncateText, formatRelativeDate, formatNumber, getInitials, getAvatarColor } from '@/lib/utils';
import type { Prompt } from '@/types';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import CopyButton from './CopyButton';
import showToast from '@/components/ui/Toast';

interface PromptCardProps {
  prompt: Prompt;
  onSaveToggle?: (promptId: string, saved: boolean) => void;
}

export default function PromptCard({ prompt, onSaveToggle }: PromptCardProps) {
  const { isSignedIn } = useUser();
  const [isSaved, setIsSaved] = useState(prompt.user_has_saved ?? false);
  const [savePending, setSavePending] = useState(false);

  const author = prompt.author;
  const authorInitials = author ? getInitials(author.username) : '??';
  const avatarColor = author ? getAvatarColor(author.username) : 'bg-gray-400';

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      showToast.error('Sign in to save prompts');
      return;
    }
    if (savePending) return;

    setSavePending(true);
    const newSaved = !isSaved;
    setIsSaved(newSaved);

    try {
      const method = newSaved ? 'POST' : 'DELETE';
      const res = await fetch(`/api/prompts/${prompt.id}/save`, { method });
      if (!res.ok) throw new Error();
      showToast.success(newSaved ? 'Saved to bookmarks!' : 'Removed from bookmarks');
      onSaveToggle?.(prompt.id, newSaved);
    } catch {
      setIsSaved(!newSaved);
      showToast.error('Something went wrong');
    } finally {
      setSavePending(false);
    }
  };

  return (
    <Link href={`/prompts/${prompt.id}`} className="block group">
      <article
        className={cn(
          'bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a]',
          'shadow-card dark:shadow-card-dark',
          'transition-all duration-200',
          'hover:border-[#F5C518] hover:shadow-lg hover:-translate-y-0.5',
          'flex flex-col h-full overflow-hidden'
        )}
      >
        {/* Card body */}
        <div className="p-4 flex flex-col flex-1">

          {/* Top row: Category badge + AI tool + Save button */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="category">{prompt.category}</Badge>
              {prompt.ai_tool && (
                <Badge variant="tool">{prompt.ai_tool}</Badge>
              )}
            </div>
            <button
              onClick={handleSaveToggle}
              disabled={savePending}
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200 flex-shrink-0',
                isSaved
                  ? 'text-[#F5C518] bg-[#F5C518]/10'
                  : 'text-gray-400 hover:text-[#F5C518] hover:bg-[#F5C518]/10'
              )}
              aria-label={isSaved ? 'Unsave prompt' : 'Save prompt'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[#0a0a0a] dark:text-white text-sm leading-snug mb-2 group-hover:text-[#F5C518] transition-colors duration-200 line-clamp-2">
            {prompt.title}
          </h3>

          {/* Description */}
          {prompt.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2 flex-1">
              {truncateText(prompt.description, 120)}
            </p>
          )}

          {/* Prompt preview */}
          <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2.5 mb-3 border border-[#e5e5e5] dark:border-[#2a2a2a]">
            <p className="text-xs font-mono text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
              {truncateText(prompt.content, 150)}
            </p>
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {prompt.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400"
                >
                  #{tag}
                </span>
              ))}
              {prompt.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{prompt.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Ratings row */}
          <div className="flex items-center gap-3 mb-3">
            {/* AI Rating */}
            {prompt.stars_ai > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#F5C518]" />
                <StarRating value={prompt.stars_ai} readOnly size="sm" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {prompt.stars_ai.toFixed(1)}
                </span>
              </div>
            )}
            {/* Community rating */}
            {prompt.rating_count > 0 && (
              <div className="flex items-center gap-1">
                <StarRating value={prompt.stars_community} readOnly size="sm" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({prompt.rating_count})
                </span>
              </div>
            )}
          </div>

          {/* Featured badge */}
          {prompt.is_featured && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-semibold text-[#F5C518] bg-[#F5C518]/10 px-2 py-0.5 rounded-full">
                ⭐ Featured
              </span>
            </div>
          )}
        </div>

        {/* Card footer */}
        <div className="px-4 pb-4 pt-0 flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2 min-w-0">
            {author?.avatar_url ? (
              <Image
                src={author.avatar_url}
                alt={author.username}
                width={24}
                height={24}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', avatarColor)}>
                {authorInitials}
              </div>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {author?.username ?? 'Anonymous'}
            </span>
            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatRelativeDate(prompt.created_at)}
            </span>
          </div>

          {/* Stats + Copy */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Copy className="w-3 h-3" />
              <span>{formatNumber(prompt.copies_count)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="w-3 h-3" />
              <span>{formatNumber(prompt.views_count)}</span>
            </div>
            <CopyButton
              text={prompt.content}
              promptId={prompt.id}
              size="sm"
              showLabel={false}
              className="ml-1"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
