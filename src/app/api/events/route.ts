import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Event from '@/models/Event';
import { verifyJwt } from '@/lib/jwt';

export async function GET() {
  await dbConnect();
  const events = await Event.find().sort({ date: 1 });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
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
  const { title, description, date, time, venue, price, poster } = await req.json();
  if (!title || !description || !date || !time || !venue || price === undefined) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  const event = await Event.create({ title, description, date, time, venue, price, poster });
  return NextResponse.json(event);
}
