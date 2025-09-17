import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { verifyJwt } from '@/lib/jwt';
import { generateQrCode } from '@/lib/qrcode';

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
  const tickets = await Ticket.find({ status: 'pending' })
    .populate('userId', 'name email')
    .populate('eventId', 'title price');
  return NextResponse.json(tickets);
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
  const { ids, status } = await req.json();
  if (!Array.isArray(ids) || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const updates = [] as any[];
  for (const id of ids) {
    const t = await Ticket.findById(id);
    if (!t) continue;
    t.status = status;
    if (status === 'approved') {
      t.qrCode = await generateQrCode(`${t.userId}:${t.eventId}:${Date.now()}`);
    } else {
      t.qrCode = undefined;
    }
    updates.push(t.save());
  }
  await Promise.all(updates);
  return NextResponse.json({ ok: true });
}
