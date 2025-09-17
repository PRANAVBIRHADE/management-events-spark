import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
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
  const events = await Event.find();
  const result = [];
  for (const event of events) {
    const tickets = await Ticket.find({ eventId: event._id }).populate('userId', 'name email');
    const stats = { approved: 0, pending: 0, rejected: 0 };
    const participants = tickets.map(t => {
      stats[t.status]++;
      return {
        name: t.userId?.name || '',
        email: t.userId?.email || '',
        status: t.status,
      };
    });
    result.push({
      eventId: event._id,
      title: event.title,
      stats,
      participants,
    });
  }
  return NextResponse.json(result);
}
