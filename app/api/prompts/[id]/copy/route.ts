import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, err } from '@/lib/api-helpers';

// POST /api/prompts/[id]/copy
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin.rpc('increment_copies', {
      prompt_id: params.id,
    });

    // Fallback if RPC doesn't exist
    if (error) {
      const { data: current } = await supabaseAdmin
        .from('prompts')
        .select('copies_count')
        .eq('id', params.id)
        .single();

      await supabaseAdmin
        .from('prompts')
        .update({ copies_count: (current?.copies_count ?? 0) + 1 })
        .eq('id', params.id);
    }

    return ok({ incremented: true });
  } catch (e) {
    console.error('POST /api/prompts/[id]/copy error:', e);
    return ok({ incremented: false }); // Non-critical, return ok
  }
}
