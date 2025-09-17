import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Event from '@/models/Event';
import { verifyJwt } from '@/lib/jwt';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const event = await Event.findById(params.id);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
  const data = await req.json();
  const event = await Event.findByIdAndUpdate(params.id, data, { new: true });
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(event);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
  await Event.findByIdAndDelete(params.id);
  return NextResponse.json({ message: 'Deleted' });
}
