import type { Metadata } from 'next';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import PromptFilter from '@/components/prompts/PromptFilter';
import PromptGrid from '@/components/prompts/PromptGrid';
import { supabaseAdmin } from '@/lib/supabase';
import { PROMPTS_PER_PAGE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explore Prompts',
  description: 'Browse thousands of high-quality AI prompts. Filter by category, tool, language and rating.',
};

interface ExplorePageProps {
  searchParams: {
    category?: string;
    ai_tool?: string;
    language?: string;
    min_stars?: string;
    sort?: string;
    search?: string;
    page?: string;
  };
}

async function getPrompts(searchParams: ExplorePageProps['searchParams']) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1'));
  const limit = PROMPTS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('prompts')
    .select('*, author:users!user_id(*)', { count: 'exact' })
    .in('status', ['published', 'published_with_note']);

  if (searchParams.category)  query = query.eq('category', searchParams.category);
  if (searchParams.ai_tool)   query = query.eq('ai_tool', searchParams.ai_tool);
  if (searchParams.language)  query = query.eq('language', searchParams.language);
  if (searchParams.min_stars) query = query.gte('stars_ai', parseFloat(searchParams.min_stars));

  if (searchParams.search) {
    query = query.textSearch('search_vector', searchParams.search, {
      type: 'websearch',
      config: 'english',
    });
  }

  switch (searchParams.sort) {
    case 'trending':    query = query.order('copies_count', { ascending: false }); break;
    case 'top_rated':   query = query.order('stars_ai', { ascending: false }); break;
    case 'most_copied': query = query.order('copies_count', { ascending: false }); break;
    default:            query = query.order('created_at', { ascending: false });
  }

  const { data, count } = await query.range(from, to);
  return { prompts: data ?? [], total: count ?? 0, page, limit };
}

function Pagination({ page, total, limit, searchParams }: {
  page: number; total: number; limit: number;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('page', String(p));
    return `/explore?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {page > 1 && (
        <Link href={buildUrl(page - 1)} className="p-2 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#F5C518] transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </Link>
      )}
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
        return (
          <Link
            key={p}
            href={buildUrl(p)}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-all',
              p === page
                ? 'bg-[#F5C518] text-[#0a0a0a] border-[#F5C518]'
                : 'border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#F5C518]'
            )}
          >
            {p}
          </Link>
        );
      })}
      {page < totalPages && (
        <Link href={buildUrl(page + 1)} className="p-2 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#F5C518] transition-colors">
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
      <span className="text-xs text-gray-400 ml-2">{total} prompts</span>
    </div>
  );
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { prompts, total, page, limit } = await getPrompts(searchParams);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <Suspense>
            <Sidebar className="hidden lg:block" />
          </Suspense>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-[#0a0a0a] dark:text-white mb-1">
                {searchParams.search
                  ? `Results for "${searchParams.search}"`
                  : searchParams.category
                  ? `${searchParams.category} Prompts`
                  : 'Explore Prompts'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {total} prompt{total !== 1 ? 's' : ''} found
              </p>
            </div>

            <Suspense>
              <div className="mb-6">
                <PromptFilter />
              </div>
            </Suspense>

            <PromptGrid prompts={prompts as any} />

            <Pagination page={page} total={total} limit={limit} searchParams={searchParams as any} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
