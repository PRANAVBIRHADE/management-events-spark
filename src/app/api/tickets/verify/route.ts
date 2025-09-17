import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('ticketId');
  if (!id) return NextResponse.json({ valid: false, reason: 'missing' }, { status: 400 });
  const ticket = await Ticket.findById(id);
  if (!ticket) return NextResponse.json({ valid: false, reason: 'not_found' });
  return NextResponse.json({ valid: ticket.status === 'approved', status: ticket.status });
}
