"use client";
import { useEffect, useState } from "react";

interface EventAnalytics {
  eventId: string;
  title: string;
  stats: { approved: number; pending: number; rejected: number };
  participants: { name: string; email: string; status: string }[];
}

function toCSV(rows: string[][]) {
  return rows.map(r => r.map(f => `"${f.replace(/"/g, '""')}"`).join(",")).join("\r\n");
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<EventAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalytics() {
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    const res = await fetch("/api/admin/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setData(await res.json());
      setError(null);
    } else {
      setError("Failed to load analytics");
    }
    setLoading(false);
  }

  useEffect(() => { fetchAnalytics(); }, []);

  function handleExport(event: EventAnalytics) {
    const rows = [
      ["Name", "Email", "Status"],
      ...event.participants.map(p => [p.name, p.email, p.status]),
    ];
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_participants.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Event Analytics & Export</h1>
      {loading ? (
        <div className="text-white">Loading analytics...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <div className="space-y-8">
          {data.map(ev => (
            <div key={ev.eventId} className="bg-white/10 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-primary mb-1">{ev.title}</h2>
                  <div className="flex gap-4 text-white/90">
                    <span>Approved: <b className="text-green-400">{ev.stats.approved}</b></span>
                    <span>Pending: <b className="text-yellow-400">{ev.stats.pending}</b></span>
                    <span>Rejected: <b className="text-red-400">{ev.stats.rejected}</b></span>
                  </div>
                </div>
                <button onClick={() => handleExport(ev)} className="bg-primary text-white px-4 py-2 rounded font-semibold hover:brightness-110 transition">Export CSV</button>
              </div>
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-white/90">
                  <thead>
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ev.participants.map((p, i) => (
                      <tr key={i} className="border-b border-white/10">
                        <td className="p-2">{p.name}</td>
                        <td className="p-2">{p.email}</td>
                        <td className="p-2 capitalize">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === 'approved' ? 'bg-green-500/80' : p.status === 'pending' ? 'bg-yellow-500/80' : 'bg-red-500/80'} text-white`}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
