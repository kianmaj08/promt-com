import type { Category, AiTool } from '@/types';

// ============================================================
// CATEGORIES – All 15 with subcategories, icons, slugs
// ============================================================
export const CATEGORIES: Omit<Category, 'id' | 'created_at'>[] = [
  {
    name: 'Image Generation',
    slug: 'image-generation',
    icon: '🎨',
    description: 'Prompts for Midjourney, DALL-E, Stable Diffusion & more',
    subcategories: ['Portraits', 'Landscapes', 'Logos', 'Concept Art', 'Product Photos', 'Anime', 'Realism'],
    sort_order: 1,
  },
  {
    name: 'Writing & Text',
    slug: 'writing-text',
    icon: '✍️',
    description: 'Blog posts, emails, stories, scripts and more',
    subcategories: ['Blog Posts', 'Emails', 'Stories', 'Poems', 'Scripts', 'Letters', 'Social Media'],
    sort_order: 2,
  },
  {
    name: 'Business & Marketing',
    slug: 'business-marketing',
    icon: '📈',
    description: 'Ads, pitches, SEO, product descriptions, branding',
    subcategories: ['Ads', 'Pitches', 'SEO', 'Product Descriptions', 'Press Releases', 'Branding'],
    sort_order: 3,
  },
  {
    name: 'Coding & Dev',
    slug: 'coding-dev',
    icon: '💻',
    description: 'Code generation, debugging, architecture, tests',
    subcategories: ['Generate Code', 'Debugging', 'Explain Code', 'Architecture', 'Tests'],
    sort_order: 4,
  },
  {
    name: 'Learning & Education',
    slug: 'learning-education',
    icon: '🎓',
    description: 'Explanations, flashcards, summaries, exam prep',
    subcategories: ['Explanations', 'Flashcards', 'Summaries', 'Exam Prep', 'Tutorials'],
    sort_order: 5,
  },
  {
    name: 'Gaming & Fun',
    slug: 'gaming-fun',
    icon: '🎮',
    description: 'RPGs, worldbuilding, NPC dialogues, quests, lore',
    subcategories: ['Roleplays', 'Worldbuilding', 'NPC Dialogues', 'Quests', 'Lore'],
    sort_order: 6,
  },
  {
    name: 'Music & Creativity',
    slug: 'music-creativity',
    icon: '🎵',
    description: 'Song lyrics, concepts, music descriptions, album covers',
    subcategories: ['Song Lyrics', 'Concepts', 'Music Descriptions', 'Album Cover Prompts'],
    sort_order: 7,
  },
  {
    name: 'Productivity',
    slug: 'productivity',
    icon: '⚡',
    description: 'To-do, planning, brainstorming, meeting summaries',
    subcategories: ['To-Do', 'Planning', 'Brainstorming', 'Meeting Summaries', 'Goal Setting'],
    sort_order: 8,
  },
  {
    name: 'Chatbots & Personas',
    slug: 'chatbots-personas',
    icon: '🤖',
    description: 'System prompts, characters, roles, custom GPTs',
    subcategories: ['System Prompts', 'Characters', 'Roles', 'Custom GPTs', 'Personas'],
    sort_order: 9,
  },
  {
    name: 'Science & Research',
    slug: 'science-research',
    icon: '🔬',
    description: 'Analyses, paper summaries, hypotheses',
    subcategories: ['Analyses', 'Paper Summaries', 'Hypotheses', 'Data Interpretation'],
    sort_order: 10,
  },
  {
    name: 'Video & Film',
    slug: 'video-film',
    icon: '🎬',
    description: 'Scripts, storyboards, YouTube scripts, reels',
    subcategories: ['Scripts', 'Storyboards', 'Scene Ideas', 'YouTube Scripts', 'Reels'],
    sort_order: 11,
  },
  {
    name: 'E-Commerce',
    slug: 'e-commerce',
    icon: '🛒',
    description: 'Product texts, reviews, FAQ, customer support',
    subcategories: ['Product Texts', 'Reviews', 'FAQ', 'Customer Support', 'Listings'],
    sort_order: 12,
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    icon: '💪',
    description: 'Nutrition plans, workouts, meditation guides',
    subcategories: ['Nutrition Plans', 'Workout Ideas', 'Meditation Guides', 'Mental Health'],
    sort_order: 13,
  },
  {
    name: 'Law & Finance',
    slug: 'law-finance',
    icon: '⚖️',
    description: 'Contract templates, financial analyses, explanations',
    subcategories: ['Contract Templates', 'Financial Analyses', 'Legal Explanations', 'Tax Tips'],
    sort_order: 14,
  },
  {
    name: 'Translation & Languages',
    slug: 'translation-languages',
    icon: '🌍',
    description: 'Translations, language learning, dialects',
    subcategories: ['Translations', 'Language Learning', 'Dialects', 'Grammar Help'],
    sort_order: 15,
  },
];

// ---- Helper to find category by slug ----
export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function getCategoryByName(name: string) {
  return CATEGORIES.find((c) => c.name === name) ?? null;
}

// ============================================================
// AI TOOLS
// ============================================================
export const AI_TOOLS: AiTool[] = [
  'ChatGPT',
  'GPT-4',
  'Claude',
  'Gemini',
  'Midjourney',
  'DALL-E',
  'Stable Diffusion',
  'Firefly',
  'Runway',
  'Suno',
  'Udio',
  'Perplexity',
  'Copilot',
  'LLaMA',
  'Other',
];

// ============================================================
// LANGUAGES
// ============================================================
export const LANGUAGES = [
  'English',
  'German',
  'Spanish',
  'French',
  'Italian',
  'Portuguese',
  'Dutch',
  'Polish',
  'Russian',
  'Japanese',
  'Chinese',
  'Korean',
  'Arabic',
  'Turkish',
  'Hindi',
  'Other',
];

// ============================================================
// SORT OPTIONS
// ============================================================
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'trending', label: 'Trending' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'most_copied', label: 'Most Copied' },
] as const;

// ============================================================
// TONE OPTIONS (for generator)
// ============================================================
export const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal', emoji: '👔' },
  { value: 'casual', label: 'Casual', emoji: '😊' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'technical', label: 'Technical', emoji: '🔧' },
  { value: 'friendly', label: 'Friendly', emoji: '🤝' },
] as const;

// ============================================================
// LENGTH OPTIONS (for generator)
// ============================================================
export const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short', description: '1–3 sentences' },
  { value: 'medium', label: 'Medium', description: '4–8 sentences' },
  { value: 'long', label: 'Long', description: '9+ sentences / structured' },
] as const;

// ============================================================
// GENERATOR GOAL SUGGESTIONS (Quick Chips)
// ============================================================
export const GOAL_SUGGESTIONS: Record<string, string[]> = {
  'image-generation': [
    'A cinematic portrait of a cyberpunk character',
    'A logo for a tech startup',
    'An aerial landscape of a fantasy world',
  ],
  'writing-text': [
    'Write a blog post about AI trends',
    'Draft a professional cold email',
    'Create a short story opening',
  ],
  'coding-dev': [
    'Generate a REST API in TypeScript',
    'Debug this React component',
    'Explain a complex algorithm',
  ],
  'business-marketing': [
    'Write a product launch announcement',
    'Create ad copy for social media',
    'Build a pitch deck outline',
  ],
  default: [
    'Help me brainstorm ideas',
    'Write content for my project',
    'Explain a complex topic simply',
  ],
};

// ============================================================
// APP CONSTANTS
// ============================================================
export const APP_NAME = 'Prompt.com';
export const APP_DESCRIPTION = 'Community Platform for High-Quality AI Prompts';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const PROMPTS_PER_PAGE = 12;
export const MAX_PROMPT_LENGTH = 5000;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_TAGS = 10;
export const MAX_BIO_LENGTH = 300;

export const FEATURED_THRESHOLD = 4.5; // AI score >= this → featured
export const PUBLISH_THRESHOLD = 3.0;  // AI score >= this → published

// ============================================================
// STATS (placeholder for landing page, replace with DB queries)
// ============================================================
export const PLATFORM_STATS = [
  { label: 'Prompts', value: '10,000+' },
  { label: 'Contributors', value: '500+' },
  { label: 'Categories', value: '15' },
  { label: 'AI Tools', value: '15+' },
];
