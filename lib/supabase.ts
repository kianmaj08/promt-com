import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ---- Browser / Client-Side Client ----
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- Server-Side Client (with cookie-based auth) ----
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Can be ignored in Server Components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Can be ignored in Server Components
        }
      },
    },
  });
}

// ---- Admin / Service Role Client (bypasses RLS) ----
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ---- Type-safe DB helper types ----
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          twitter: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      prompts: {
        Row: {
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
          status: 'pending' | 'published' | 'published_with_note' | 'rejected';
          is_featured: boolean;
          ai_feedback: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prompts']['Row'], 'id' | 'created_at' | 'updated_at' | 'stars_ai' | 'stars_community' | 'rating_count' | 'copies_count' | 'saves_count' | 'views_count'>;
        Update: Partial<Database['public']['Tables']['prompts']['Insert']>;
      };
    };
  };
};
