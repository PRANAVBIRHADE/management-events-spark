import { NextRequest, NextResponse } from 'next/server';
import { signJwt } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = signJwt({ admin: true, email });
    const res = NextResponse.json({ ok: true });
    res.cookies.set('adminToken', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  }
  return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
}
