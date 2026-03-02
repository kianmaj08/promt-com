import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, Copy, Bookmark, Calendar, Tag } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CopyButton from '@/components/prompts/CopyButton';
import StarRating from '@/components/ui/StarRating';
import Badge from '@/components/ui/Badge';
import PromptGrid from '@/components/prompts/PromptGrid';
import EvaluationResult from '@/components/prompts/EvaluationResult';
import { supabaseAdmin } from '@/lib/supabase';
import { formatDate, formatNumber, getInitials, getAvatarColor, cn } from '@/lib/utils';
import CommentsSection from './CommentsSection';
import RatingSection from './RatingSection';
import ImprovePrompt from '@/components/prompts/ImprovePrompt';
import RemixPrompt from '@/components/prompts/RemixPrompt';

interface Props {
  params: { id: string };
}

async function getPrompt(id: string) {
  const { data } = await supabaseAdmin
    .from('prompts')
    .select('*, author:users!user_id(*)')
    .eq('id', id)
    .single();
  return data;
}

async function getSimilarPrompts(category: string, excludeId: string) {
  const { data } = await supabaseAdmin
    .from('prompts')
    .select('*, author:users!user_id(*)')
    .eq('category', category)
    .in('status', ['published', 'published_with_note'])
    .neq('id', excludeId)
    .order('stars_ai', { ascending: false })
    .limit(3);
  return data ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const prompt = await getPrompt(params.id);
  if (!prompt) return { title: 'Prompt Not Found' };
  return {
    title: prompt.title,
    description: prompt.description ?? `A ${prompt.category} prompt for ${prompt.ai_tool}`,
  };
}

export default async function PromptDetailPage({ params }: Props) {
  const prompt = await getPrompt(params.id);
  if (!prompt) notFound();

  const similar = await getSimilarPrompts(prompt.category, prompt.id);
  const author = prompt.author as any;
  const authorInitials = author ? getInitials(author.username) : '??';
  const avatarColor = author ? getAvatarColor(author.username) : 'bg-gray-400';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Back button */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#F5C518] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="category">{prompt.category}</Badge>
                {prompt.subcategory && <Badge variant="tag">{prompt.subcategory}</Badge>}
                <Badge variant="tool">{prompt.ai_tool}</Badge>
                {prompt.is_featured && (
                  <span className="text-xs font-semibold text-[#F5C518] bg-[#F5C518]/10 px-2.5 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0a0a0a] dark:text-white mb-3 leading-tight">
                {prompt.title}
              </h1>
              {prompt.description && (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {prompt.description}
                </p>
              )}
            </div>

            {/* Prompt content block */}
            <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-2xl border-2 border-[#e5e5e5] dark:border-[#2a2a2a] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Prompt
                </span>
                <CopyButton
                  text={prompt.content}
                  promptId={prompt.id}
                  size="sm"
                  variant="primary"
                  showLabel
                />
              </div>
              <pre className="p-5 text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {prompt.content}
              </pre>
            </div>

            {/* Large copy button */}
            <CopyButton
              text={prompt.content}
              promptId={prompt.id}
              size="lg"
              variant="primary"
              showLabel
              className="w-full justify-center"
            />

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <Tag className="w-4 h-4 text-gray-400" />
                {prompt.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/explore?search=${tag}`}
                    className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-[#F5C518]/10 hover:text-[#F5C518] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Community Rating */}
            <RatingSection promptId={prompt.id} currentRating={prompt.stars_community} ratingCount={prompt.rating_count} />

            {/* Improve with AI */}
            <ImprovePrompt
              originalContent={prompt.content}
              promptTitle={prompt.title}
            />

            {/* Remix */}
            <RemixPrompt
              promptId={prompt.id}
              originalContent={prompt.content}
              originalTitle={prompt.title}
              category={prompt.category}
              aiTool={prompt.ai_tool}
              language={prompt.language ?? 'English'}
              tags={prompt.tags ?? []}
            />

            {/* Comments */}
            <CommentsSection promptId={prompt.id} />

          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Author card */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Author</h3>
              <Link href={`/profile/${author?.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                {author?.avatar_url ? (
                  <Image src={author.avatar_url} alt={author.username} width={44} height={44} className="rounded-full" />
                ) : (
                  <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm', avatarColor)}>
                    {authorInitials}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-[#0a0a0a] dark:text-white">{author?.username}</p>
                  {author?.bio && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{author.bio}</p>
                  )}
                </div>
              </Link>
            </div>

            {/* Stats card */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Copy className="w-4 h-4" />, label: 'Copies', value: formatNumber(prompt.copies_count) },
                  { icon: <Eye className="w-4 h-4" />, label: 'Views', value: formatNumber(prompt.views_count) },
                  { icon: <Bookmark className="w-4 h-4" />, label: 'Saves', value: formatNumber(prompt.saves_count) },
                  { icon: <Calendar className="w-4 h-4" />, label: 'Posted', value: formatDate(prompt.created_at) },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-gray-400">{icon}</span>
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-[#0a0a0a] dark:text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Score card */}
            {prompt.stars_ai > 0 && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">AI Quality Score</h3>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-[#F5C518]">{prompt.stars_ai.toFixed(1)}</span>
                  <div>
                    <StarRating value={prompt.stars_ai} readOnly size="md" />
                    <p className="text-xs text-gray-400 mt-0.5">Rated by Gemini 1.5 Flash</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Feedback accordion */}
            {prompt.ai_feedback && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">AI Evaluation</span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-5 pb-5">
                    <EvaluationResult
                      evaluation={prompt.ai_feedback as any}
                      status={prompt.status as any}
                      promptId={prompt.id}
                    />
                  </div>
                </details>
              </div>
            )}

          </div>
        </div>

        {/* Similar prompts */}
        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-black text-[#0a0a0a] dark:text-white mb-6">
              Similar Prompts
            </h2>
            <PromptGrid prompts={similar as any} skeletonCount={3} />
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
