import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/webhooks/clerk
// This endpoint is called by Clerk when a user is created/updated
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'user.created') {
      const username =
        data.username ??
        data.email_addresses?.[0]?.email_address?.split('@')[0] ??
        `user_${data.id.slice(-8)}`;

      await supabaseAdmin.from('users').insert({
        clerk_id: data.id,
        username,
        avatar_url: data.image_url ?? null,
        bio: null,
      });
    }

    if (type === 'user.updated') {
      await supabaseAdmin
        .from('users')
        .update({
          avatar_url: data.image_url ?? null,
        })
        .eq('clerk_id', data.id);
    }

    if (type === 'user.deleted') {
      await supabaseAdmin.from('users').delete().eq('clerk_id', data.id);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('Clerk webhook error:', e);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
