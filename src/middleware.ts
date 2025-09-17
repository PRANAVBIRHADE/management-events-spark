import { NextResponse, NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

const rateLimitMap = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQ = 60; // 60 requests/minute per IP

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Simple rate limiting for APIs
  if (pathname.startsWith('/api')) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const rec = rateLimitMap.get(ip as string);
    if (!rec || now - rec.ts > WINDOW_MS) {
      rateLimitMap.set(ip as string, { count: 1, ts: now });
    } else {
      rec.count += 1;
      if (rec.count > MAX_REQ) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const adminToken = req.cookies.get('adminToken')?.value;
    if (!adminToken) return NextResponse.redirect(new URL('/admin-login', req.url));
    try {
      const payload = verifyJwt(adminToken) as any;
      if (!payload.admin) throw new Error('not admin');
    } catch {
      return NextResponse.redirect(new URL('/admin-login', req.url));
    }
  }
  // Protect user-only routes
  if (pathname.startsWith('/my-tickets')) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    try {
      verifyJwt(token);
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/my-tickets'],
};
