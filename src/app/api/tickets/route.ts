import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { verifyJwt } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let userId;
  try {
    const token = auth.replace('Bearer ', '');
    const payload = verifyJwt(token) as any;
    userId = payload.userId;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const tickets = await Ticket.find({ userId }).populate('eventId');
  return NextResponse.json(tickets);
}
