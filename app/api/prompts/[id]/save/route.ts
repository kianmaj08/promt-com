import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, err, requireAuth } from '@/lib/api-helpers';

// POST → save prompt
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    const { error } = await supabaseAdmin
      .from('saves')
      .insert({ user_id: user!.id, prompt_id: params.id });

    if (error) {
      if (error.code === '23505') return err('Already saved', 409);
      throw error;
    }

    return ok({ saved: true }, 201);
  } catch (e) {
    console.error('POST /api/prompts/[id]/save error:', e);
    return err('Failed to save prompt', 500);
  }
}

// DELETE → unsave prompt
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    const { error } = await supabaseAdmin
      .from('saves')
      .delete()
      .eq('user_id', user!.id)
      .eq('prompt_id', params.id);

    if (error) throw error;
    return ok({ saved: false });
  } catch (e) {
    console.error('DELETE /api/prompts/[id]/save error:', e);
    return err('Failed to unsave prompt', 500);
  }
}
