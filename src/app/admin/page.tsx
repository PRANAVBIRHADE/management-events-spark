"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<{ totalUsers: number; totalEvents: number; totalRegistrations: number; approvedRegistrations: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch('/api/admin/kpis', { headers: { Authorization: `Bearer ${token}` }})
      .then(r => r.json())
      .then(setKpis)
      .catch(() => setKpis(null));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Welcome, Admin!</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 rounded-xl p-4 text-white"><div className="text-sm">Users</div><div className="text-2xl font-bold">{kpis?.totalUsers ?? '-'}</div></div>
        <div className="bg-white/10 rounded-xl p-4 text-white"><div className="text-sm">Events</div><div className="text-2xl font-bold">{kpis?.totalEvents ?? '-'}</div></div>
        <div className="bg-white/10 rounded-xl p-4 text-white"><div className="text-sm">Registrations</div><div className="text-2xl font-bold">{kpis?.totalRegistrations ?? '-'}</div></div>
        <div className="bg-white/10 rounded-xl p-4 text-white"><div className="text-sm">Approved</div><div className="text-2xl font-bold">{kpis?.approvedRegistrations ?? '-'}</div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <a href="/admin/events" className="bg-white/10 rounded-xl p-6 text-white hover:bg-primary/20 transition shadow-lg">
          <h2 className="text-xl font-bold mb-2">Manage Events</h2>
          <p>Create, edit, and delete college events.</p>
        </a>
        <a href="/admin/users" className="bg-white/10 rounded-xl p-6 text-white hover:bg-primary/20 transition shadow-lg">
          <h2 className="text-xl font-bold mb-2">View Users</h2>
          <p>See all registered users and their registrations.</p>
        </a>
        <a href="/admin/registrations" className="bg-white/10 rounded-xl p-6 text-white hover:bg-primary/20 transition shadow-lg">
          <h2 className="text-xl font-bold mb-2">Payment Verification</h2>
          <p>Approve or reject paid event registrations.</p>
        </a>
        <a href="/admin/analytics" className="bg-white/10 rounded-xl p-6 text-white hover:bg-primary/20 transition shadow-lg">
          <h2 className="text-xl font-bold mb-2">Analytics & Export</h2>
          <p>View stats and export participant lists.</p>
        </a>
      </div>
    </div>
  );
}
