'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black text-[#0a0a0a] dark:text-white mb-3">
          Something went wrong
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={reset}
            className="bg-[#F5C518] text-[#0a0a0a] font-bold px-6 py-3 rounded-xl hover:bg-[#e6b800] transition-all duration-200"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] text-[#0a0a0a] dark:text-white font-semibold px-6 py-3 rounded-xl hover:border-[#F5C518] transition-all duration-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
