import { NextRequest } from 'next/server';
import { generatePrompt } from '@/lib/gemini';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import type { GeneratorParams } from '@/types';

// POST /api/generate
export async function POST(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const params: GeneratorParams = await req.json();

    if (!params.goal?.trim()) return err('Goal is required');
    if (!params.category)     return err('Category is required');
    if (!params.ai_tool)      return err('AI tool is required');

    const prompt = await generatePrompt(params);
    return ok({ prompt });
  } catch (e) {
    console.error('POST /api/generate error:', e);
    return err('Generation failed. Please try again.', 500);
  }
}
