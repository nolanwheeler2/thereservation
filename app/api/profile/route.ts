import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Profile } from '../../../types/supabase';

export async function GET(_req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { data, error } = await supabase.from<Profile>('profiles').select('*').eq('id', user.id).single();

  if (error && error.code === 'PGRST116') {
    // no row
    return new Response(JSON.stringify({ data: null }), { status: 200 });
  }

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ data }), { status: 200 });
}

export async function PUT(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await req.json();

  const updates = {
    id: user.id,
    username: body.username ?? null,
    full_name: body.full_name ?? null,
    updated_at: new Date().toISOString()
  } as Partial<Profile> & { id: string };

  const { data, error } = await supabase.from('profiles').upsert(updates).select().single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ data }), { status: 200 });
}

export async function DELETE(_req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { error } = await supabase.from('profiles').delete().eq('id', user.id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ status: 'deleted' }), { status: 200 });
}