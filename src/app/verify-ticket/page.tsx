"use client";
import { useState } from "react";

export default function VerifyTicketPage() {
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState<null | { valid: boolean; status?: string; reason?: string }>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/tickets/verify?ticketId=${encodeURIComponent(ticketId)}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gradientStart to-gradientEnd px-4">
      <form onSubmit={handleVerify} className="bg-white/10 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white text-center">Verify Ticket</h1>
        <input value={ticketId} onChange={e => setTicketId(e.target.value)} placeholder="Paste Ticket ID" className="px-4 py-2 rounded bg-white/80" required />
        <button type="submit" className="bg-primary text-white font-bold py-2 rounded hover:brightness-110 transition" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
        {result && (
          <div className={`text-center font-semibold ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
            {result.valid ? `Valid (${result.status})` : `Invalid (${result.reason || result.status})`}
          </div>
        )}
        <div className="text-white/80 text-sm text-center">Tip: The QR payload can encode the Ticket ID to verify quickly.</div>
      </form>
    </div>
  );
}
