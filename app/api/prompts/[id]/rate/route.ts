import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, err, requireAuth } from '@/lib/api-helpers';

// POST /api/prompts/[id]/rate
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    const { stars } = await req.json();

    if (!stars || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
      return err('Stars must be an integer between 1 and 5');
    }

    // Check prompt exists
    const { data: prompt } = await supabaseAdmin
      .from('prompts')
      .select('id, user_id')
      .eq('id', params.id)
      .single();

    if (!prompt) return err('Prompt not found', 404);
    if (prompt.user_id === user!.id) return err('You cannot rate your own prompt', 403);

    // Upsert rating (update if exists)
    const { error } = await supabaseAdmin
      .from('ratings')
      .upsert(
        { user_id: user!.id, prompt_id: params.id, stars },
        { onConflict: 'user_id,prompt_id' }
      );

    if (error) throw error;

    // Fetch updated prompt stats
    const { data: updated } = await supabaseAdmin
      .from('prompts')
      .select('stars_community, rating_count')
      .eq('id', params.id)
      .single();

    return ok({ rated: true, stars, updated });
  } catch (e) {
    console.error('POST /api/prompts/[id]/rate error:', e);
    return err('Failed to submit rating', 500);
  }
}
