import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// ---- Standard JSON responses ----
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// ---- Get authenticated user (clerk_id → db user) ----
export async function getAuthUser() {
  const { userId: clerkId } = auth();
  if (!clerkId) return null;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  return user;
}

// ---- Require auth, return 401 if not ----
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) return { user: null, response: err('Unauthorized', 401) };
  return { user, response: null };
}

// ---- Parse pagination params ----
export function parsePagination(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '12')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}
