"use client";
import { useEffect, useState } from "react";

interface Ticket {
  _id: string;
  status: string;
  eventId: { _id: string; title: string };
}
interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  tickets: Ticket[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers(await res.json());
      setError(null);
    } else {
      setError("Failed to load users");
    }
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Registered Users</h1>
      {loading ? (
        <div className="text-white">Loading users...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/10 rounded-xl text-white">
            <thead>
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Verified</th>
                <th className="p-2">Registrations</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b border-white/10 align-top">
                  <td className="p-2 font-semibold">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.isVerified ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}</td>
                  <td className="p-2">
                    {user.tickets.length === 0 ? (
                      <span className="text-gray-300">None</span>
                    ) : (
                      <ul className="space-y-1">
                        {user.tickets.map(t => (
                          <li key={t._id} className="flex gap-2 items-center">
                            <span className="font-medium">{t.eventId?.title || "(deleted event)"}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.status === 'approved' ? 'bg-green-500/80' : t.status === 'pending' ? 'bg-yellow-500/80' : 'bg-red-500/80'} text-white`}>{t.status}</span>
                          </li>
                        ))}
                      </ul>
                    )}
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
