import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PromptGrid from '@/components/prompts/PromptGrid';
import PromptFilter from '@/components/prompts/PromptFilter';
import { supabaseAdmin } from '@/lib/supabase';
import { getCategoryBySlug, PROMPTS_PER_PAGE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  params: { slug: string };
  searchParams: { subcategory?: string; sort?: string; page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) return { title: 'Category Not Found' };
  return { title: `${cat.icon} ${cat.name} Prompts`, description: cat.description ?? undefined };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  const page = Math.max(1, parseInt(searchParams.page ?? '1'));
  const limit = PROMPTS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('prompts')
    .select('*, author:users!user_id(*)', { count: 'exact' })
    .eq('category', params.slug)
    .in('status', ['published', 'published_with_note']);

  if (searchParams.subcategory) query = query.eq('subcategory', searchParams.subcategory);

  switch (searchParams.sort) {
    case 'top_rated':   query = query.order('stars_ai', { ascending: false }); break;
    case 'most_copied': query = query.order('copies_count', { ascending: false }); break;
    default:            query = query.order('created_at', { ascending: false });
  }

  const { data: prompts, count } = await query.range(from, to);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Category header */}
        <div className="mb-8 pb-8 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0a0a0a] dark:text-white">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-500 dark:text-gray-400 mt-1">{category.description}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-400">{count ?? 0} prompts</p>
        </div>

        {/* Subcategory filters */}
        {category.subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href={`/categories/${params.slug}`}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200',
                !searchParams.subcategory
                  ? 'bg-[#F5C518] text-[#0a0a0a] border-[#F5C518]'
                  : 'border-[#e5e5e5] dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-[#F5C518]'
              )}
            >
              All
            </Link>
            {category.subcategories.map(sub => (
              <Link
                key={sub}
                href={`/categories/${params.slug}?subcategory=${encodeURIComponent(sub)}`}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200',
                  searchParams.subcategory === sub
                    ? 'bg-[#F5C518] text-[#0a0a0a] border-[#F5C518]'
                    : 'border-[#e5e5e5] dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-[#F5C518]'
                )}
              >
                {sub}
              </Link>
            ))}
          </div>
        )}

        <Suspense>
          <div className="mb-6"><PromptFilter /></div>
        </Suspense>

        <PromptGrid
          prompts={prompts as any ?? []}
          emptyMessage={`No ${category.name} prompts yet`}
          emptyIcon={category.icon}
        />
      </main>
      <Footer />
    </div>
  );
}
