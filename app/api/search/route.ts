import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, err, parsePagination } from '@/lib/api-helpers';

// GET /api/search?q=...
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q')?.trim() ?? '';
    const { from, to, page, limit } = parsePagination(url);

    if (!query) return err('Search query is required');
    if (query.length < 2) return err('Search query too short (min 2 chars)');

    const { data, error, count } = await supabaseAdmin
      .from('prompts')
      .select('*, author:users!user_id(*)', { count: 'exact' })
      .in('status', ['published', 'published_with_note'])
      .textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english',
      })
      .order('stars_ai', { ascending: false })
      .range(from, to);

    if (error) {
      // Fallback to ilike search if full-text fails
      const { data: fallback, count: fallbackCount } = await supabaseAdmin
        .from('prompts')
        .select('*, author:users!user_id(*)', { count: 'exact' })
        .in('status', ['published', 'published_with_note'])
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('stars_ai', { ascending: false })
        .range(from, to);

      return ok({
        data: fallback ?? [],
        total: fallbackCount ?? 0,
        page,
        limit,
        has_more: (fallbackCount ?? 0) > to + 1,
        query,
      });
    }

    return ok({
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      has_more: (count ?? 0) > to + 1,
      query,
    });
  } catch (e) {
    console.error('GET /api/search error:', e);
    return err('Search failed. Please try again.', 500);
  }
}
