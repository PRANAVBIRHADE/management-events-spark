import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const adminToken = req.cookies.get('adminToken')?.value;
  if (adminToken) {
    try {
      const payload = verifyJwt(adminToken) as any;
      if (payload.admin) return NextResponse.json({ admin: true, email: payload.email });
    } catch {}
  }
  if (token) {
    try {
      const payload = verifyJwt(token) as any;
      return NextResponse.json({ user: { userId: payload.userId, email: payload.email, name: payload.name } });
    } catch {}
  }
  return NextResponse.json({ user: null }, { status: 401 });
}
