import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, err, requireAuth, parsePagination } from '@/lib/api-helpers';

// GET /api/prompts/[id]/comments
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(req.url);
    const { from, to, page, limit } = parsePagination(url);

    const { data, error, count } = await supabaseAdmin
      .from('comments')
      .select('*, author:users!user_id(*)', { count: 'exact' })
      .eq('prompt_id', params.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return ok({
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      has_more: (count ?? 0) > to + 1,
    });
  } catch (e) {
    console.error('GET /api/prompts/[id]/comments error:', e);
    return err('Failed to fetch comments', 500);
  }
}

// POST /api/prompts/[id]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    const { content } = await req.json();

    if (!content?.trim()) return err('Comment content is required');
    if (content.length > 1000) return err('Comment too long (max 1000 chars)');

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({ user_id: user!.id, prompt_id: params.id, content: content.trim() })
      .select('*, author:users!user_id(*)')
      .single();

    if (error) throw error;
    return ok(data, 201);
  } catch (e) {
    console.error('POST /api/prompts/[id]/comments error:', e);
    return err('Failed to post comment', 500);
  }
}
