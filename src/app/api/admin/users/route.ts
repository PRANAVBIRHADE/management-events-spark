import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyJwt } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const token = auth.replace('Bearer ', '');
    const payload = verifyJwt(token) as any;
    if (!payload.admin) throw new Error();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = await User.find().select('-password -verificationToken').populate({
    path: 'tickets',
    populate: { path: 'eventId' }
  });
  return NextResponse.json(users);
}
