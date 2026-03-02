import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, err, requireAuth } from '@/lib/api-helpers';

// GET /api/collections
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    let query = supabaseAdmin
      .from('collections')
      .select('*, author:users!user_id(*)')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return ok(data ?? []);
  } catch (e) {
    console.error('GET /api/collections error:', e);
    return err('Failed to fetch collections', 500);
  }
}

// POST /api/collections
export async function POST(req: NextRequest) {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    const body = await req.json();

    if (!body.name?.trim()) return err('Collection name is required');
    if (body.name.length > 100) return err('Name too long (max 100 chars)');

    const { data, error } = await supabaseAdmin
      .from('collections')
      .insert({
        user_id: user!.id,
        name: body.name.trim(),
        description: body.description?.trim() ?? null,
        is_public: body.is_public ?? true,
        cover_emoji: body.cover_emoji ?? '📁',
      })
      .select('*, author:users!user_id(*)')
      .single();

    if (error) throw error;
    return ok(data, 201);
  } catch (e) {
    console.error('POST /api/collections error:', e);
    return err('Failed to create collection', 500);
  }
}
