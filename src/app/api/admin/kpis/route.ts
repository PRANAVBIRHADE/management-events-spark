import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { verifyJwt } from '@/lib/jwt';
import User from '@/models/User';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';

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
  const [totalUsers, totalEvents, totalRegistrations, approvedRegistrations] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: 'approved' }),
  ]);
  return NextResponse.json({ totalUsers, totalEvents, totalRegistrations, approvedRegistrations });
}
