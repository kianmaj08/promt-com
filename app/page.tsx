import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Zap, Users, BookOpen, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PromptGrid from '@/components/prompts/PromptGrid';
import { supabaseAdmin } from '@/lib/supabase';
import { CATEGORIES, PLATFORM_STATS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Prompt.com – Community Platform for High-Quality AI Prompts',
  description: 'Discover, share, and generate high-quality AI prompts for ChatGPT, Midjourney, DALL-E and more. AI-rated and community-approved.',
};

async function getFeaturedPrompts() {
  const { data } = await supabaseAdmin
    .from('prompts')
    .select('*, author:users!user_id(*)')
    .eq('is_featured', true)
    .in('status', ['published'])
    .order('stars_ai', { ascending: false })
    .limit(6);
  return data ?? [];
}

async function getTrendingPrompts() {
  const { data } = await supabaseAdmin
    .from('prompts')
    .select('*, author:users!user_id(*)')
    .in('status', ['published', 'published_with_note'])
    .order('copies_count', { ascending: false })
    .limit(6);
  return data ?? [];
}

function HeroSearch() {
  return (
    <form action="/explore" method="GET" className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <input
          name="search"
          type="search"
          placeholder="Search 10,000+ prompts..."
          className={cn(
            'w-full rounded-2xl border-2 border-[#e5e5e5] dark:border-[#2a2a2a]',
            'bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white',
            'pl-6 pr-36 py-4 text-base',
            'focus:outline-none focus:border-[#F5C518]',
            'transition-all duration-200 shadow-lg'
          )}
        />
        <button
          type="submit"
          className="absolute right-2 bg-[#F5C518] text-[#0a0a0a] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#e6b800] transition-all duration-200 text-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default async function HomePage() {
  const [featured, trending] = await Promise.all([
    getFeaturedPrompts(),
    getTrendingPrompts(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />

      {/* ---- HERO ---- */}
      <section className="relative overflow-hidden bg-white dark:bg-[#0a0a0a] border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F5C518]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#F5C518]/8 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#F5C518]/10 border border-[#F5C518]/30 text-[#0a0a0a] dark:text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
            AI-powered quality rating with Gemini 1.5 Flash
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a0a0a] dark:text-white leading-tight mb-5 tracking-tight">
            The Community for{' '}
            <span className="text-[#F5C518]">High-Quality</span>
            <br />AI Prompts
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover, share, and generate AI prompts for ChatGPT, Midjourney, Claude & more.
            Every prompt is rated by AI and the community.
          </p>

          {/* Search */}
          <div className="mb-8">
            <Suspense>
              <HeroSearch />
            </Suspense>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0a0a0a] font-bold px-7 py-3.5 rounded-xl hover:bg-[#e6b800] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Explore Prompts
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] font-bold px-7 py-3.5 rounded-xl hover:opacity-90 transition-all duration-200"
            >
              <Zap className="w-4 h-4" />
              Generate a Prompt
            </Link>
          </div>
        </div>
      </section>

      {/* ---- STATS BANNER ---- */}
      <section className="bg-[#F5C518] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-[#0a0a0a]">{stat.value}</div>
                <div className="text-xs font-semibold text-[#0a0a0a]/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* ---- CATEGORIES ---- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#0a0a0a] dark:text-white">Browse Categories</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Find prompts for every use case</p>
            </div>
            <Link
              href="/explore"
              className="text-sm font-medium text-[#F5C518] hover:underline flex items-center gap-1"
            >
              All prompts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border',
                  'border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]',
                  'hover:border-[#F5C518] hover:bg-[#F5C518]/5 hover:-translate-y-0.5',
                  'transition-all duration-200 text-center group'
                )}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </span>
                <span className="text-xs font-medium text-[#0a0a0a] dark:text-white leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
            {/* All categories link */}
            <Link
              href="/explore"
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl border',
                'border-dashed border-[#e5e5e5] dark:border-[#2a2a2a]',
                'hover:border-[#F5C518] hover:bg-[#F5C518]/5',
                'transition-all duration-200 text-center'
              )}
            >
              <span className="text-2xl">✨</span>
              <span className="text-xs font-medium text-gray-400">View All</span>
            </Link>
          </div>
        </section>

        {/* ---- TRENDING ---- */}
        {trending.length > 0 && (
          <section className="bg-gray-50 dark:bg-[#0a0a0a] border-y border-[#e5e5e5] dark:border-[#2a2a2a] py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-[#0a0a0a] dark:text-white flex items-center gap-2">
                    🔥 Trending Prompts
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Most copied this week</p>
                </div>
                <Link
                  href="/explore?sort=trending"
                  className="text-sm font-medium text-[#F5C518] hover:underline flex items-center gap-1"
                >
                  See all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <PromptGrid prompts={trending as any} />
            </div>
          </section>
        )}

        {/* ---- FEATURED ---- */}
        {featured.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-[#0a0a0a] dark:text-white flex items-center gap-2">
                  ⭐ Featured Prompts
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  AI-rated 4.5+ stars — the very best
                </p>
              </div>
              <Link
                href="/explore?sort=top_rated&min_stars=4"
                className="text-sm font-medium text-[#F5C518] hover:underline flex items-center gap-1"
              >
                Top rated <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <PromptGrid prompts={featured as any} />
          </section>
        )}

        {/* ---- CTA SECTION ---- */}
        <section className="bg-[#0a0a0a] dark:bg-[#1a1a1a] py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-3xl font-black text-white mb-4">
              Ready to share your best prompts?
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Submit a prompt, get AI feedback, and earn recognition in our community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0a0a0a] font-bold px-7 py-3.5 rounded-xl hover:bg-[#e6b800] transition-all duration-200"
              >
                Submit a Prompt
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/generator"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                <Zap className="w-4 h-4" />
                Use the Generator
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
