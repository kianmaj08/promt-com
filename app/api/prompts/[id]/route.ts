import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, err, requireAuth } from '@/lib/api-helpers';

// GET /api/prompts/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: prompt, error } = await supabaseAdmin
      .from('prompts')
      .select('*, author:users!user_id(*)')
      .eq('id', params.id)
      .single();

    if (error || !prompt) return err('Prompt not found', 404);

    // Increment view count (fire and forget)
    supabaseAdmin
      .from('prompts')
      .update({ views_count: (prompt.views_count ?? 0) + 1 })
      .eq('id', params.id)
      .then(() => {});

    return ok(prompt);
  } catch (e) {
    console.error('GET /api/prompts/[id] error:', e);
    return err('Failed to fetch prompt', 500);
  }
}

// PATCH /api/prompts/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('prompts')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (!existing) return err('Prompt not found', 404);
    if (existing.user_id !== user!.id) return err('Forbidden', 403);

    const body = await req.json();
    const allowed = ['title', 'content', 'description', 'category', 'subcategory', 'ai_tool', 'language', 'tags'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabaseAdmin
      .from('prompts')
      .update(updates)
      .eq('id', params.id)
      .select('*, author:users!user_id(*)')
      .single();

    if (error) throw error;
    return ok(data);
  } catch (e) {
    console.error('PATCH /api/prompts/[id] error:', e);
    return err('Failed to update prompt', 500);
  }
}

// DELETE /api/prompts/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    const { data: existing } = await supabaseAdmin
      .from('prompts')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (!existing) return err('Prompt not found', 404);
    if (existing.user_id !== user!.id) return err('Forbidden', 403);

    const { error } = await supabaseAdmin
      .from('prompts')
      .delete()
      .eq('id', params.id);

    if (error) throw error;
    return ok({ deleted: true });
  } catch (e) {
    console.error('DELETE /api/prompts/[id] error:', e);
    return err('Failed to delete prompt', 500);
  }
}
