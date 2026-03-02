import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AiFeedback, GeneratorParams, GeneratedPromptVariant } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  });
}

// ============================================================
// evaluatePrompt – Score a prompt on 5 criteria
// ============================================================
export async function evaluatePrompt(promptText: string): Promise<AiFeedback> {
  const model = getModel();

  const systemInstruction = `You are an expert prompt engineer. Evaluate the given AI prompt strictly and objectively.
Return ONLY valid JSON, no markdown, no explanation outside the JSON.

Score each criterion from 1 to 5 (1=poor, 5=excellent):
- clarity (25%): Is the prompt clear and unambiguous?
- completeness (20%): Does it include context, goal, and format?
- reusability (20%): Can it be easily adapted for similar tasks?
- creativity (15%): Is it original and creative?
- specificity (20%): Does it give the AI enough detail to work with?

The total_score is the weighted average, rounded to 2 decimal places.

Return this exact JSON structure:
{
  "total_score": <number 1-5>,
  "breakdown": {
    "clarity": { "score": <1-5>, "feedback": "<concise feedback>" },
    "completeness": { "score": <1-5>, "feedback": "<concise feedback>" },
    "reusability": { "score": <1-5>, "feedback": "<concise feedback>" },
    "creativity": { "score": <1-5>, "feedback": "<concise feedback>" },
    "specificity": { "score": <1-5>, "feedback": "<concise feedback>" }
  },
  "overall_feedback": "<2-3 sentence summary>",
  "improvement_suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}`;

  const prompt = `${systemInstruction}\n\nEvaluate this prompt:\n\n---\n${promptText}\n---`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean) as AiFeedback;

    // Validate structure
    if (
      typeof parsed.total_score !== 'number' ||
      !parsed.breakdown ||
      !parsed.overall_feedback
    ) {
      throw new Error('Invalid response structure from Gemini');
    }

    return parsed;
  } catch (error) {
    console.error('Gemini evaluatePrompt error:', error);
    throw new Error('Failed to evaluate prompt. Please try again.');
  }
}

// ============================================================
// generatePrompt – Create a prompt from user parameters
// ============================================================
export async function generatePrompt(params: GeneratorParams): Promise<string> {
  const model = getModel();

  const instruction = `You are an expert prompt engineer. Create a high-quality, ready-to-use AI prompt based on the user's specifications.

The prompt should be:
- Clear and unambiguous
- Specific enough to get great results
- Written in ${params.language}
- Suitable for ${params.ai_tool}
- Tone: ${params.tone}
- Length: ${params.length} (short=1-3 sentences, medium=4-8 sentences, long=9+ sentences or structured)
${params.target_audience ? `- Target audience: ${params.target_audience}` : ''}
${params.style ? `- Style: ${params.style}` : ''}

Return ONLY the prompt text itself. No introduction, no explanation, no quotes around it.`;

  const userMessage = `Goal: ${params.goal}
Category: ${params.category}
AI Tool: ${params.ai_tool}`;

  try {
    const result = await model.generateContent(`${instruction}\n\n${userMessage}`);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini generatePrompt error:', error);
    throw new Error('Failed to generate prompt. Please try again.');
  }
}

// ============================================================
// improvePrompt – Enhance an existing prompt
// ============================================================
export async function improvePrompt(originalPrompt: string): Promise<string> {
  const model = getModel();

  const instruction = `You are an expert prompt engineer. Improve the given prompt to make it:
- More specific and detailed
- Clearer in its instructions
- Better structured
- More likely to produce excellent AI outputs
- Reusable and adaptable

Keep the core intent and goal of the original. Return ONLY the improved prompt text. No explanation, no "Here is the improved prompt:", just the prompt itself.`;

  try {
    const result = await model.generateContent(
      `${instruction}\n\nOriginal prompt to improve:\n\n---\n${originalPrompt}\n---`
    );
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini improvePrompt error:', error);
    throw new Error('Failed to improve prompt. Please try again.');
  }
}

// ============================================================
// generateVariants – Create 3 different prompt variants
// ============================================================
export async function generateVariants(
  goal: string,
  params: Partial<GeneratorParams>
): Promise<GeneratedPromptVariant[]> {
  const model = getModel();

  const instruction = `You are an expert prompt engineer. Create exactly 3 different prompt variants for the given goal.
Each variant should take a distinctly different approach:
- Variant 1: Direct and concise approach
- Variant 2: Detailed and structured approach  
- Variant 3: Creative and unconventional approach

${params.ai_tool ? `All prompts are for: ${params.ai_tool}` : ''}
${params.language ? `Language: ${params.language}` : ''}
${params.category ? `Category: ${params.category}` : ''}

Return ONLY valid JSON, no markdown. Use this exact structure:
[
  {
    "id": "variant-1",
    "title": "<short title for this variant>",
    "content": "<the full prompt text>",
    "description": "<1 sentence describing this approach>",
    "tags": ["<tag1>", "<tag2>", "<tag3>"]
  },
  {
    "id": "variant-2",
    "title": "<short title>",
    "content": "<the full prompt text>",
    "description": "<1 sentence>",
    "tags": ["<tag1>", "<tag2>", "<tag3>"]
  },
  {
    "id": "variant-3",
    "title": "<short title>",
    "content": "<the full prompt text>",
    "description": "<1 sentence>",
    "tags": ["<tag1>", "<tag2>", "<tag3>"]
  }
]`;

  try {
    const result = await model.generateContent(`${instruction}\n\nGoal: ${goal}`);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean) as GeneratedPromptVariant[];

    if (!Array.isArray(parsed) || parsed.length !== 3) {
      throw new Error('Invalid variants response structure');
    }

    return parsed;
  } catch (error) {
    console.error('Gemini generateVariants error:', error);
    throw new Error('Failed to generate variants. Please try again.');
  }
}

// ============================================================
// determinePromptStatus – Decide status based on AI score
// ============================================================
export function determinePromptStatus(score: number): {
  status: 'published' | 'published_with_note' | 'rejected';
  is_featured: boolean;
} {
  if (score >= 4.5) {
    return { status: 'published', is_featured: true };
  } else if (score >= 4.0) {
    return { status: 'published', is_featured: false };
  } else if (score >= 3.0) {
    return { status: 'published_with_note', is_featured: false };
  } else {
    return { status: 'rejected', is_featured: false };
  }
}
