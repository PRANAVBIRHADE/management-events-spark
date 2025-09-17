import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import { verifyJwt } from '@/lib/jwt';
import { generateQrCode } from '@/lib/qrcode';

export async function POST(req: NextRequest) {
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
  const { eventId, paymentScreenshot } = await req.json();
  if (!eventId) return NextResponse.json({ error: 'Event required' }, { status: 400 });
  const event = await Event.findById(eventId);
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const existing = await Ticket.findOne({ userId, eventId });
  if (existing) return NextResponse.json({ error: 'Already registered' }, { status: 400 });

  const isFreeForYear = Array.isArray(event.freeYears) && event.freeYears.includes(Number(user.year));
  let status = 'pending', qrCode = undefined;
  if (event.price === 0 || isFreeForYear) {
    status = 'approved';
    qrCode = await generateQrCode(`${userId}:${eventId}:${Date.now()}`);
  }

  const ticket = await Ticket.create({
    userId,
    eventId,
    status,
    qrCode,
    paymentScreenshot,
  });
  user.tickets.push(ticket._id);
  await user.save();
  event.registrations.push(ticket._id);
  await event.save();
  return NextResponse.json(ticket);
}
