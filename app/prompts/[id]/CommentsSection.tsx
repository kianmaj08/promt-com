'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { MessageCircle, Send } from 'lucide-react';
import { cn, formatRelativeDate, getInitials, getAvatarColor } from '@/lib/utils';
import type { Comment } from '@/types';
import Button from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';

export default function CommentsSection({ promptId }: { promptId: string }) {
  const { isSignedIn, user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/api/prompts/${promptId}/comments`)
      .then(r => r.json())
      .then(j => setComments(j.data?.data ?? []))
      .finally(() => setLoading(false));
  }, [promptId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/prompts/${promptId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setComments(prev => [json.data, ...prev]);
      setContent('');
      showToast.success('Comment posted!');
    } catch {
      showToast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-[#0a0a0a] dark:text-white flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-[#F5C518]" />
        Comments {comments.length > 0 && <span className="text-sm font-normal text-gray-400">({comments.length})</span>}
      </h3>

      {/* Comment input */}
      {isSignedIn ? (
        <div className="flex gap-3">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', getAvatarColor(user?.username ?? ''))}>
            {getInitials(user?.username ?? user?.firstName ?? '?')}
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={1000}
              className="w-full rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white text-sm px-4 py-3 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-[#F5C518] transition-all"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="primary" onClick={handleSubmit} loading={submitting} disabled={!content.trim()} icon={<Send className="w-3.5 h-3.5" />}>
                Post
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <a href="/sign-in" className="text-[#F5C518] hover:underline">Sign in</a> to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2a2a2a] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-gray-200 dark:bg-[#2a2a2a] rounded" />
                <div className="h-3 w-full bg-gray-200 dark:bg-[#2a2a2a] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment: any) => {
            const a = comment.author;
            return (
              <div key={comment.id} className="flex gap-3">
                {a?.avatar_url ? (
                  <Image src={a.avatar_url} alt={a.username} width={32} height={32} className="rounded-full flex-shrink-0" />
                ) : (
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', getAvatarColor(a?.username ?? ''))}>
                    {getInitials(a?.username ?? '?')}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#0a0a0a] dark:text-white">{a?.username}</span>
                    <span className="text-xs text-gray-400">{formatRelativeDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
