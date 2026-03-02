import { NextRequest } from 'next/server';
import { improvePrompt } from '@/lib/gemini';
import { ok, err } from '@/lib/api-helpers';

// POST /api/improve
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) return err('Prompt text is required');
    if (prompt.length < 10) return err('Prompt too short (min 10 chars)');
    if (prompt.length > 5000) return err('Prompt too long (max 5000 chars)');

    const improved = await improvePrompt(prompt);
    return ok({ original: prompt, improved });
  } catch (e) {
    console.error('POST /api/improve error:', e);
    return err('Improvement failed. Please try again.', 500);
  }
}
