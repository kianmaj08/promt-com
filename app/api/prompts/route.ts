import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, err, requireAuth, parsePagination } from '@/lib/api-helpers';
import { evaluatePrompt, determinePromptStatus } from '@/lib/gemini';
import type { SubmitPromptForm } from '@/types';

// GET /api/prompts
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { page, limit, from, to } = parsePagination(url);

    const category   = url.searchParams.get('category') ?? '';
    const ai_tool    = url.searchParams.get('ai_tool') ?? '';
    const language   = url.searchParams.get('language') ?? '';
    const min_stars  = parseFloat(url.searchParams.get('min_stars') ?? '0');
    const sort       = url.searchParams.get('sort') ?? 'newest';
    const search     = url.searchParams.get('search') ?? '';
    const user_id    = url.searchParams.get('user_id') ?? '';
    const is_featured = url.searchParams.get('is_featured') === 'true';

    let query = supabaseAdmin
      .from('prompts')
      .select('*, author:users!user_id(*)', { count: 'exact' })
      .in('status', ['published', 'published_with_note']);

    if (category)    query = query.eq('category', category);
    if (ai_tool)     query = query.eq('ai_tool', ai_tool);
    if (language)    query = query.eq('language', language);
    if (min_stars)   query = query.gte('stars_ai', min_stars);
    if (user_id)     query = query.eq('user_id', user_id);
    if (is_featured) query = query.eq('is_featured', true);

    if (search) {
      query = query.textSearch('search_vector', search, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Sorting
    switch (sort) {
      case 'trending':
        query = query.order('copies_count', { ascending: false });
        break;
      case 'top_rated':
        query = query.order('stars_ai', { ascending: false });
        break;
      case 'most_copied':
        query = query.order('copies_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return ok({
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      has_more: (count ?? 0) > to + 1,
    });
  } catch (e) {
    console.error('GET /api/prompts error:', e);
    return err('Failed to fetch prompts', 500);
  }
}

// POST /api/prompts
export async function POST(req: NextRequest) {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    const body: SubmitPromptForm = await req.json();

    // Validate required fields
    if (!body.title?.trim())   return err('Title is required');
    if (!body.content?.trim()) return err('Prompt content is required');
    if (!body.category)        return err('Category is required');
    if (!body.ai_tool)         return err('AI tool is required');

    if (body.title.length > 100)    return err('Title too long (max 100 chars)');
    if (body.content.length > 5000) return err('Prompt too long (max 5000 chars)');

    // AI Evaluation via Gemini
    let aiFeedback = null;
    let status: 'published' | 'published_with_note' | 'rejected' = 'published';
    let is_featured = false;
    let stars_ai = 0;

    try {
      aiFeedback = await evaluatePrompt(body.content);
      stars_ai = aiFeedback.total_score;
      const determined = determinePromptStatus(stars_ai);
      status = determined.status;
      is_featured = determined.is_featured;
    } catch (aiErr) {
      console.error('AI evaluation failed, publishing with note:', aiErr);
      status = 'published_with_note';
    }

    const { data, error } = await supabaseAdmin
      .from('prompts')
      .insert({
        user_id: user!.id,
        title: body.title.trim(),
        content: body.content.trim(),
        description: body.description?.trim() ?? null,
        category: body.category,
        subcategory: body.subcategory || null,
        ai_tool: body.ai_tool,
        language: body.language || 'English',
        tags: body.tags ?? [],
        stars_ai,
        status,
        is_featured,
        ai_feedback: aiFeedback,
      })
      .select('*, author:users!user_id(*)')
      .single();

    if (error) throw error;

    return ok({ prompt: data, evaluation: aiFeedback, status }, 201);
  } catch (e) {
    console.error('POST /api/prompts error:', e);
    return err('Failed to create prompt', 500);
  }
}
