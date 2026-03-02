import { NextRequest } from 'next/server';
import { evaluatePrompt } from '@/lib/gemini';
import { ok, err } from '@/lib/api-helpers';

// POST /api/evaluate
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) return err('Prompt text is required');
    if (prompt.length < 10) return err('Prompt too short to evaluate (min 10 chars)');
    if (prompt.length > 5000) return err('Prompt too long (max 5000 chars)');

    const evaluation = await evaluatePrompt(prompt);
    return ok(evaluation);
  } catch (e) {
    console.error('POST /api/evaluate error:', e);
    return err('Evaluation failed. Please try again.', 500);
  }
}
