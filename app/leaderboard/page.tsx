import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Star, Copy, BookMarked } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabaseAdmin } from '@/lib/supabase';
import { formatNumber, getInitials, getAvatarColor, cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Top contributors on Prompt.com ranked by prompts, ratings and community impact.',
};

async function getLeaderboard() {
  const { data: users } = await supabaseAdmin.from('users').select('*').limit(50);
  if (!users) return [];

  const results = await Promise.all(users.map(async (user) => {
    const { data: prompts } = await supabaseAdmin
      .from('prompts')
      .select('stars_ai, copies_count')
      .eq('user_id', user.id)
      .in('status', ['published', 'published_with_note']);

    const count = prompts?.length ?? 0;
    const totalStars = prompts?.reduce((s, p) => s + (p.stars_ai ?? 0), 0) ?? 0;
    const totalCopies = prompts?.reduce((s, p) => s + (p.copies_count ?? 0), 0) ?? 0;
    return { user, prompt_count: count, total_stars: totalStars, total_copies: totalCopies };
  }));

  return results
    .filter(r => r.prompt_count > 0)
    .sort((a, b) => b.total_stars - a.total_stars || b.prompt_count - a.prompt_count)
    .slice(0, 10)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

const PODIUM_STYLES = [
  { order: 2, height: 'h-24', bg: 'bg-[#F5C518]', text: 'text-[#0a0a0a]', crown: '👑', label: '1st' },
  { order: 1, height: 'h-16', bg: 'bg-gray-300 dark:bg-gray-600', text: 'text-white', crown: '🥈', label: '2nd' },
  { order: 3, height: 'h-12', bg: 'bg-orange-400', text: 'text-white', crown: '🥉', label: '3rd' },
];

export default async function LeaderboardPage() {
  const leaders = await getLeaderboard();
  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Trophy className="w-12 h-12 text-[#F5C518]" />
          </div>
          <h1 className="text-3xl font-black text-[#0a0a0a] dark:text-white mb-2">Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Top contributors ranked by AI ratings and community impact</p>
        </div>

        {/* Podium */}
        {top3.length === 3 && (
          <div className="flex items-end justify-center gap-4 mb-12">
            {PODIUM_STYLES.map(({ order, height, bg, text, crown, label }) => {
              const leader = top3[order - 1];
              if (!leader) return null;
              const initials = getInitials(leader.user.username);
              const color = getAvatarColor(leader.user.username);
              return (
                <div key={order} className="flex flex-col items-center gap-3" style={{ order }}>
                  <span className="text-2xl">{crown}</span>
                  {leader.user.avatar_url ? (
                    <Image src={leader.user.avatar_url} alt={leader.user.username} width={56} height={56} className="rounded-full border-4 border-[#F5C518]" />
                  ) : (
                    <div className={cn('w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-[#F5C518]', color)}>
                      {initials}
                    </div>
                  )}
                  <Link href={`/profile/${leader.user.id}`} className="text-sm font-bold text-[#0a0a0a] dark:text-white hover:text-[#F5C518] transition-colors">
                    {leader.user.username}
                  </Link>
                  <div className={cn('w-20 rounded-t-xl flex items-center justify-center font-black text-lg', height, bg, text)}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#e5e5e5] dark:border-[#2a2a2a] text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">User</div>
            <div className="col-span-2 text-center">Prompts</div>
            <div className="col-span-2 text-center">Avg Stars</div>
            <div className="col-span-2 text-center">Copies</div>
          </div>

          {leaders.map(({ user, rank, prompt_count, total_stars, total_copies }) => {
            const avgStars = prompt_count > 0 ? total_stars / prompt_count : 0;
            const initials = getInitials(user.username);
            const color = getAvatarColor(user.username);
            const isTop3 = rank <= 3;

            return (
              <div key={user.id} className={cn(
                'grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-[#e5e5e5] dark:border-[#2a2a2a] last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-[#0a0a0a]',
                isTop3 && 'bg-[#F5C518]/5'
              )}>
                <div className="col-span-1">
                  <span className={cn('text-sm font-black', isTop3 ? 'text-[#F5C518]' : 'text-gray-400')}>
                    {rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                  </span>
                </div>

                <div className="col-span-5 flex items-center gap-3">
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt={user.username} width={36} height={36} className="rounded-full flex-shrink-0" />
                  ) : (
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', color)}>
                      {initials}
                    </div>
                  )}
                  <Link href={`/profile/${user.id}`} className="font-semibold text-[#0a0a0a] dark:text-white hover:text-[#F5C518] transition-colors truncate">
                    {user.username}
                  </Link>
                </div>

                <div className="col-span-2 text-center">
                  <span className="text-sm font-bold text-[#0a0a0a] dark:text-white">{prompt_count}</span>
                </div>
                <div className="col-span-2 text-center flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#F5C518]" />
                  <span className="text-sm font-bold text-[#0a0a0a] dark:text-white">{avgStars.toFixed(1)}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-bold text-[#0a0a0a] dark:text-white">{formatNumber(total_copies)}</span>
                </div>
              </div>
            );
          })}

          {leaders.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No contributors yet. Be the first!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
