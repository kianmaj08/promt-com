import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, err } from '@/lib/api-helpers';

// GET /api/users/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Support lookup by clerk_id or DB id
    let query = supabaseAdmin.from('users').select('*');

    if (params.id.startsWith('user_')) {
      // Clerk ID format
      query = query.eq('clerk_id', params.id);
    } else {
      query = query.eq('id', params.id);
    }

    const { data: user, error } = await query.single();
    if (error || !user) return err('User not found', 404);

    // Fetch user's published prompts
    const { data: prompts, count: promptCount } = await supabaseAdmin
      .from('prompts')
      .select('*, author:users!user_id(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .in('status', ['published', 'published_with_note'])
      .order('created_at', { ascending: false })
      .limit(12);

    // Aggregate stats
    const { data: statsData } = await supabaseAdmin
      .from('prompts')
      .select('copies_count, views_count, stars_ai')
      .eq('user_id', user.id)
      .in('status', ['published', 'published_with_note']);

    const stats = statsData?.reduce(
      (acc, p) => ({
        total_copies: acc.total_copies + (p.copies_count ?? 0),
        total_views:  acc.total_views  + (p.views_count  ?? 0),
        total_stars:  acc.total_stars  + (p.stars_ai     ?? 0),
      }),
      { total_copies: 0, total_views: 0, total_stars: 0 }
    ) ?? { total_copies: 0, total_views: 0, total_stars: 0 };

    const avgRating =
      statsData && statsData.length > 0
        ? stats.total_stars / statsData.length
        : 0;

    return ok({
      user,
      prompts: prompts ?? [],
      stats: {
        total_prompts: promptCount ?? 0,
        total_copies: stats.total_copies,
        total_views:  stats.total_views,
        avg_rating: parseFloat(avgRating.toFixed(2)),
      },
    });
  } catch (e) {
    console.error('GET /api/users/[id] error:', e);
    return err('Failed to fetch user profile', 500);
  }
}

// PATCH /api/users/[id] - update profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const allowed = ['username', 'bio', 'website', 'twitter', 'avatar_url'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return err('Username already taken', 409);
      throw error;
    }
    return ok(data);
  } catch (e) {
    console.error('PATCH /api/users/[id] error:', e);
    return err('Failed to update profile', 500);
  }
}
