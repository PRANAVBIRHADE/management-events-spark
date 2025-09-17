"use client";
import { useEffect, useState } from "react";

interface Ticket {
  _id: string;
  status: string;
  qrCode?: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    price: number;
  };
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tickets")
      .then(res => res.json())
      .then(setTickets)
      .catch(() => setError("Failed to load tickets"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">My Tickets</h1>
      {loading ? (
        <div className="text-white">Loading tickets...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-white">No tickets found.</div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {tickets.map(t => (
            <div key={t._id} className="bg-white/10 rounded-xl p-6 flex flex-col shadow-lg">
              <h2 className="text-primary text-xl font-bold mb-2">{t.eventId.title}</h2>
              <div className="text-white/90 mb-1">{new Date(t.eventId.date).toLocaleDateString()} {t.eventId.time}</div>
              <div className="text-white/80 mb-1">{t.eventId.venue}</div>
              <div className="mb-2">
                Status: {t.status === 'approved' ? <span className="text-green-400 font-bold">Approved</span> : t.status === 'pending' ? <span className="text-yellow-400 font-bold">Pending</span> : <span className="text-red-400 font-bold">Rejected</span>}
              </div>
              {t.qrCode && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <img src={t.qrCode} alt="QR Code" className="w-32 h-32 bg-white rounded" />
                  <a href={t.qrCode} download={`ticket_${t.eventId.title}.png`} className="text-primary underline">Download PNG</a>
                  <a href={`/api/tickets/${t._id}/pdf`} className="text-primary underline">Download PDF</a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
