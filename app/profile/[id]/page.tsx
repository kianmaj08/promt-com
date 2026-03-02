import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, Twitter, BookMarked, Copy, Eye, Star } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PromptGrid from '@/components/prompts/PromptGrid';
import { supabaseAdmin } from '@/lib/supabase';
import { formatDate, formatNumber, getInitials, getAvatarColor, cn } from '@/lib/utils';

interface Props { params: { id: string } }

async function getUserData(id: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (!user) return null;

  const { data: prompts, count } = await supabaseAdmin
    .from('prompts')
    .select('*, author:users!user_id(*)', { count: 'exact' })
    .eq('user_id', id)
    .in('status', ['published', 'published_with_note'])
    .order('created_at', { ascending: false })
    .limit(12);

  const { data: stats } = await supabaseAdmin
    .from('prompts')
    .select('copies_count, views_count, stars_ai')
    .eq('user_id', id);

  const agg = stats?.reduce((a, p) => ({
    copies: a.copies + (p.copies_count ?? 0),
    views: a.views + (p.views_count ?? 0),
    stars: a.stars + (p.stars_ai ?? 0),
  }), { copies: 0, views: 0, stars: 0 }) ?? { copies: 0, views: 0, stars: 0 };

  return {
    user, prompts: prompts ?? [],
    stats: {
      total_prompts: count ?? 0,
      total_copies: agg.copies,
      total_views: agg.views,
      avg_rating: stats?.length ? agg.stars / stats.length : 0,
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getUserData(params.id);
  if (!data) return { title: 'User Not Found' };
  return { title: `${data.user.username}'s Profile`, description: data.user.bio ?? undefined };
}

export default async function ProfilePage({ params }: Props) {
  const data = await getUserData(params.id);
  if (!data) notFound();

  const { user, prompts, stats } = data;
  const initials = getInitials(user.username);
  const avatarColor = getAvatarColor(user.username);

  const statItems = [
    { icon: <BookMarked className="w-4 h-4" />, label: 'Prompts', value: formatNumber(stats.total_prompts) },
    { icon: <Copy className="w-4 h-4" />, label: 'Total Copies', value: formatNumber(stats.total_copies) },
    { icon: <Eye className="w-4 h-4" />, label: 'Total Views', value: formatNumber(stats.total_views) },
    { icon: <Star className="w-4 h-4" />, label: 'Avg Rating', value: stats.avg_rating.toFixed(1) },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Profile header */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt={user.username} width={88} height={88} className="rounded-2xl flex-shrink-0" />
            ) : (
              <div className={cn('w-22 h-22 w-[88px] h-[88px] rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0', avatarColor)}>
                {initials}
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black text-[#0a0a0a] dark:text-white">{user.username}</h1>
                  {user.bio && <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xl">{user.bio}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    {user.website && (
                      <a href={user.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#F5C518] transition-colors">
                        <Globe className="w-3.5 h-3.5" />{user.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    {user.twitter && (
                      <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#F5C518] transition-colors">
                        <Twitter className="w-3.5 h-3.5" />@{user.twitter}
                      </a>
                    )}
                    <span className="text-xs text-gray-400">Joined {formatDate(user.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
            {statItems.map(({ icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center text-[#F5C518] mb-1">{icon}</div>
                <div className="text-xl font-black text-[#0a0a0a] dark:text-white">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompts */}
        <div>
          <h2 className="text-xl font-black text-[#0a0a0a] dark:text-white mb-6">
            Prompts by {user.username}
          </h2>
          <PromptGrid
            prompts={prompts as any}
            emptyMessage="No published prompts yet"
            emptyIcon="📝"
          />
          {stats.total_prompts > 12 && (
            <div className="text-center mt-8">
              <Link href={`/explore?user_id=${user.id}`} className="text-sm font-medium text-[#F5C518] hover:underline">
                View all {stats.total_prompts} prompts →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
