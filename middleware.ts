import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({
    req,
    res,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Protect the /profile page and profile API routes
  const pathname = req.nextUrl.pathname;

  const protectedPaths = ['/profile'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p)) || pathname.startsWith('/api/profile');

  if (isProtected && !user) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/profile/:path*', '/api/profile/:path*', '/profile']
};
