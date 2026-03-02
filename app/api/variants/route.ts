import { NextRequest } from 'next/server';
import { generateVariants } from '@/lib/gemini';
import { ok, err, requireAuth } from '@/lib/api-helpers';

// POST /api/variants
export async function POST(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const { goal, ...params } = await req.json();

    if (!goal?.trim()) return err('Goal is required');

    const variants = await generateVariants(goal, params);
    return ok({ variants });
  } catch (e) {
    console.error('POST /api/variants error:', e);
    return err('Variant generation failed. Please try again.', 500);
  }
}
