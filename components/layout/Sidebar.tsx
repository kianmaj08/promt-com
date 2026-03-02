'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  return (
    <aside className={cn('w-56 flex-shrink-0', className)}>
      <div className="sticky top-24">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 mb-3">
          Categories
        </h2>
        <nav className="space-y-0.5">
          {/* All Prompts */}
          <Link
            href="/explore"
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
              !activeCategory && pathname === '/explore'
                ? 'bg-[#F5C518]/15 text-[#F5C518] font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-[#0a0a0a] dark:hover:text-white'
            )}
          >
            <span className="text-base">✨</span>
            <span>All Prompts</span>
          </Link>

          {/* Category list */}
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/explore?category=${cat.slug}`}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                  isActive
                    ? 'bg-[#F5C518]/15 text-[#F5C518] font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-[#0a0a0a] dark:hover:text-white'
                )}
              >
                <span className="text-base w-5 text-center">{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
