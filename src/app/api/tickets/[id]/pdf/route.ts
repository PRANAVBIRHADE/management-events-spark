import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import User from '@/models/User';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const ticket = await Ticket.findById(params.id);
  if (!ticket) return new Response('Not found', { status: 404 });
  const event = await Event.findById(ticket.eventId);
  const user = await User.findById(ticket.userId);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([420, 600]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width } = page.getSize();

  const drawText = (text: string, y: number, size = 14) => {
    page.drawText(text, { x: 40, y, size, font, color: rgb(0, 0, 0) });
  };

  // Header
  page.drawRectangle({ x: 0, y: 560, width, height: 40, color: rgb(0.13, 0.83, 0.48) });
  page.drawText('Event Ticket', { x: 40, y: 572, size: 18, font, color: rgb(1,1,1) });

  drawText(`Event: ${event?.title || ''}`, 520, 16);
  drawText(`Name: ${user?.name || ''}`, 490);
  drawText(`Email: ${user?.email || ''}`, 470);
  drawText(`Date: ${event ? new Date(event.date).toLocaleDateString() : ''}  Time: ${event?.time || ''}`, 450);
  drawText(`Venue: ${event?.venue || ''}`, 430);
  drawText(`Status: ${ticket.status}`, 410);

  if (ticket.qrCode) {
    try {
      const pngData = ticket.qrCode.split(',')[1];
      const bytes = Uint8Array.from(atob(pngData), c => c.charCodeAt(0));
      const png = await pdfDoc.embedPng(bytes);
      page.drawImage(png, { x: 120, y: 240, width: 180, height: 180 });
      drawText('Scan this QR at entry', 220, 12);
    } catch {}
  }

  const pdfBytes = await pdfDoc.save();
  return new Response(Buffer.from(pdfBytes), { headers: { 'Content-Type': 'application/pdf' } });
}
