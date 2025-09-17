import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { verifyJwt } from '@/lib/jwt';
import { generateQrCode } from '@/lib/qrcode';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
  const { status } = await req.json();
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const ticket = await Ticket.findById(params.id);
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  ticket.status = status;
  if (status === 'approved' && !ticket.qrCode) {
    ticket.qrCode = await generateQrCode(`${ticket.userId}:${ticket.eventId}:${Date.now()}`);
  }
  if (status === 'rejected') {
    ticket.qrCode = undefined;
  }
  await ticket.save();
  return NextResponse.json(ticket);
}
