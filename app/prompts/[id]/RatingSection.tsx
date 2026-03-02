'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
import showToast from '@/components/ui/Toast';

interface RatingSectionProps {
  promptId: string;
  currentRating: number;
  ratingCount: number;
}

export default function RatingSection({ promptId, currentRating, ratingCount }: RatingSectionProps) {
  const { isSignedIn } = useUser();
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [communityRating, setCommunityRating] = useState(currentRating);
  const [count, setCount] = useState(ratingCount);

  const handleRate = async (stars: number) => {
    if (!isSignedIn) { showToast.error('Sign in to rate prompts'); return; }
    setRating(stars);
    try {
      const res = await fetch(`/api/prompts/${promptId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (json.data?.updated) {
        setCommunityRating(json.data.updated.stars_community);
        setCount(json.data.updated.rating_count);
      }
      setSubmitted(true);
      showToast.success(`Rated ${stars} star${stars !== 1 ? 's' : ''}!`);
    } catch (e: any) {
      showToast.error(e.message ?? 'Failed to submit rating');
      setRating(0);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-5">
      <h3 className="font-bold text-[#0a0a0a] dark:text-white flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-[#F5C518]" />
        Community Rating
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-black text-[#F5C518]">{communityRating.toFixed(1)}</div>
          <div className="text-xs text-gray-400">{count} rating{count !== 1 ? 's' : ''}</div>
        </div>
        <StarRating value={communityRating} readOnly size="lg" />
      </div>

      {!submitted ? (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {isSignedIn ? 'Rate this prompt:' : 'Sign in to rate this prompt'}
          </p>
          {isSignedIn && (
            <StarRating
              value={rating}
              onChange={handleRate}
              size="lg"
            />
          )}
        </div>
      ) : (
        <p className={cn('text-sm font-medium', 'text-[#F5C518]')}>
          ✓ You rated this {rating} star{rating !== 1 ? 's' : ''}. Thank you!
        </p>
      )}
    </div>
  );
}
