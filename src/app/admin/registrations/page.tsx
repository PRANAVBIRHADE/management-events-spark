"use client";
import { useEffect, useState } from "react";

interface Ticket {
  _id: string;
  userId: { name: string; email: string };
  eventId: { title: string; price: number };
  paymentScreenshot?: string;
  status: string;
}

export default function AdminRegistrationsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  async function fetchTickets() {
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    const res = await fetch("/api/admin/registrations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setTickets(data);
      setError(null);
      setSelected({});
    } else {
      setError("Failed to load registrations");
    }
    setLoading(false);
  }

  useEffect(() => { fetchTickets(); }, []);

  async function handleAction(id: string, status: "approved" | "rejected") {
    setActionLoading(id + status);
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    setActionLoading(null);
    if (res.ok) fetchTickets();
    else alert("Failed to update ticket");
  }

  async function handleBulk(status: "approved" | "rejected") {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (ids.length === 0) return;
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`/api/admin/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids, status })
    });
    if (res.ok) fetchTickets(); else alert('Bulk update failed');
  }

  const allSelected = tickets.length > 0 && tickets.every(t => selected[t._id]);
  function toggleAll() {
    const next: Record<string, boolean> = {};
    const value = !allSelected;
    tickets.forEach(t => next[t._id] = value);
    setSelected(next);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Payment Verification</h1>
      <div className="flex gap-3 mb-4">
        <button onClick={() => handleBulk('approved')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Approve Selected</button>
        <button onClick={() => handleBulk('rejected')} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Reject Selected</button>
      </div>
      {loading ? (
        <div className="text-white">Loading registrations...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-white">No pending registrations.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/10 rounded-xl text-white">
            <thead>
              <tr>
                <th className="p-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <th className="p-2">User</th>
                <th className="p-2">Event</th>
                <th className="p-2">Price</th>
                <th className="p-2">Payment Screenshot</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t._id} className="border-b border-white/10 align-top">
                  <td className="p-2"><input type="checkbox" checked={!!selected[t._id]} onChange={(e) => setSelected(s => ({ ...s, [t._id]: e.target.checked }))} /></td>
                  <td className="p-2">
                    <div className="font-semibold">{t.userId.name}</div>
                    <div className="text-xs text-gray-200">{t.userId.email}</div>
                  </td>
                  <td className="p-2">{t.eventId.title}</td>
                  <td className="p-2">₹{t.eventId.price}</td>
                  <td className="p-2">
                    {t.paymentScreenshot ? (
                      <a href={t.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="underline text-primary">View</a>
                    ) : (
                      <span className="text-gray-300">None</span>
                    )}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => handleAction(t._id, "approved")} disabled={actionLoading === t._id + "approved"} className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-60">{actionLoading === t._id + "approved" ? "Approving..." : "Approve"}</button>
                    <button onClick={() => handleAction(t._id, "rejected")} disabled={actionLoading === t._id + "rejected"} className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-60">{actionLoading === t._id + "rejected" ? "Rejecting..." : "Reject"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
