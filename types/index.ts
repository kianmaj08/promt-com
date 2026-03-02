// ============================================================
// PROMPT.COM – TypeScript Types & Interfaces
// ============================================================

// ---- USER ----
export interface User {
  id: string;
  clerk_id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_prompts: number;
  total_saves: number;
  total_copies: number;
  total_views: number;
  avg_rating: number;
}

export interface UserWithStats extends User {
  stats: UserStats;
}

// ---- CATEGORY ----
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  subcategories: string[];
  sort_order: number;
  created_at: string;
}

// ---- PROMPT ----
export type PromptStatus = 'pending' | 'published' | 'published_with_note' | 'rejected';

export type AiTool =
  | 'ChatGPT'
  | 'GPT-4'
  | 'Claude'
  | 'Gemini'
  | 'Midjourney'
  | 'DALL-E'
  | 'Stable Diffusion'
  | 'Firefly'
  | 'Runway'
  | 'Suno'
  | 'Udio'
  | 'Perplexity'
  | 'Copilot'
  | 'LLaMA'
  | 'Other';

export type SortOption = 'newest' | 'trending' | 'top_rated' | 'most_copied';

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  ai_tool: string;
  language: string;
  tags: string[];
  stars_ai: number;
  stars_community: number;
  rating_count: number;
  copies_count: number;
  saves_count: number;
  views_count: number;
  status: PromptStatus;
  is_featured: boolean;
  ai_feedback: AiFeedback | null;
  created_at: string;
  updated_at: string;
  // Joined
  author?: User;
  user_has_saved?: boolean;
  user_rating?: number;
}

export interface PromptWithAuthor extends Prompt {
  author: User;
}

// ---- AI EVALUATION ----
export interface AiCriterionScore {
  score: number;
  feedback: string;
}

export interface AiFeedback {
  total_score: number;
  breakdown: {
    clarity: AiCriterionScore;
    completeness: AiCriterionScore;
    reusability: AiCriterionScore;
    creativity: AiCriterionScore;
    specificity: AiCriterionScore;
  };
  overall_feedback: string;
  improvement_suggestions: string[];
}

// ---- RATING ----
export interface Rating {
  id: string;
  user_id: string;
  prompt_id: string;
  stars: number;
  created_at: string;
}

// ---- SAVE ----
export interface Save {
  id: string;
  user_id: string;
  prompt_id: string;
  created_at: string;
}

// ---- COLLECTION ----
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_emoji: string;
  created_at: string;
  updated_at: string;
  // Joined
  prompt_count?: number;
  prompts?: Prompt[];
  author?: User;
}

// ---- COMMENT ----
export interface Comment {
  id: string;
  user_id: string;
  prompt_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Joined
  author?: User;
}

// ---- GENERATOR ----
export type Tone = 'formal' | 'casual' | 'creative' | 'technical' | 'friendly';
export type PromptLength = 'short' | 'medium' | 'long';

export interface GeneratorParams {
  goal: string;
  category: string;
  ai_tool: string;
  tone: Tone;
  length: PromptLength;
  target_audience?: string;
  language: string;
  style?: string;
}

export interface GeneratedPromptVariant {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
}

// ---- API REQUEST / RESPONSE ----
export interface PromptsFilter {
  category?: string;
  subcategory?: string;
  ai_tool?: string;
  language?: string;
  min_stars?: number;
  sort?: SortOption;
  search?: string;
  page?: number;
  limit?: number;
  user_id?: string;
  is_featured?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// ---- FORM DATA ----
export interface SubmitPromptForm {
  title: string;
  content: string;
  description: string;
  category: string;
  subcategory: string;
  ai_tool: string;
  language: string;
  tags: string[];
}

export interface CreateCollectionForm {
  name: string;
  description: string;
  is_public: boolean;
  cover_emoji: string;
}

export interface UpdateProfileForm {
  username: string;
  bio: string;
  website: string;
  twitter: string;
}

// ---- LEADERBOARD ----
export interface LeaderboardEntry {
  user: User;
  prompt_count: number;
  total_stars: number;
  total_copies: number;
  rank: number;
}

// ---- SEARCH ----
export interface SearchResult {
  prompts: PromptWithAuthor[];
  total: number;
  query: string;
}
