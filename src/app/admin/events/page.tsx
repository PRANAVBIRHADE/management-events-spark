"use client";
import { useEffect, useState } from "react";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  poster?: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<Partial<Event>>({});
  const [saving, setSaving] = useState(false);

  async function fetchEvents() {
    setLoading(true);
    const res = await fetch("/api/events");
    if (res.ok) {
      setEvents(await res.json());
      setError(null);
    } else {
      setError("Failed to load events");
    }
    setLoading(false);
  }

  useEffect(() => { fetchEvents(); }, []);

  function openCreate() {
    setEditEvent(null);
    setForm({});
    setShowForm(true);
  }
  function openEdit(ev: Event) {
    setEditEvent(ev);
    setForm(ev);
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditEvent(null);
    setForm({});
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    if (!form.title || !form.description || !form.date || !form.time || !form.venue || form.price === undefined) {
      setError('Please fill all fields');
      setSaving(false);
      return;
    }
    if (Number(form.price) < 0) {
      setError('Price cannot be negative');
      setSaving(false);
      return;
    }
    const method = editEvent ? "PUT" : "POST";
    const url = editEvent ? `/api/events/${editEvent._id}` : "/api/events";
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken") || ''}`,
      },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      closeForm();
      fetchEvents();
    } else {
      setError("Failed to save event");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchEvents();
    else setError("Failed to delete event");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Events</h1>
        <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded font-semibold hover:brightness-110 transition">+ Create Event</button>
      </div>
      {loading ? (
        <div className="text-white">Loading events...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/10 rounded-xl text-white">
            <thead>
              <tr>
                <th className="p-2">Title</th>
                <th className="p-2">Date</th>
                <th className="p-2">Venue</th>
                <th className="p-2">Price</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev._id} className="border-b border-white/10">
                  <td className="p-2 font-semibold">{ev.title}</td>
                  <td className="p-2">{new Date(ev.date).toLocaleDateString()}</td>
                  <td className="p-2">{ev.venue}</td>
                  <td className="p-2">{ev.price === 0 ? "Free" : `₹${ev.price}`}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => openEdit(ev)} className="px-3 py-1 rounded bg-primary/80 hover:bg-primary text-white">Edit</button>
                    <button onClick={() => handleDelete(ev._id)} className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal/Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form onSubmit={handleSave} className="bg-zinc-900 text-white rounded-xl p-8 w-full max-w-md flex flex-col gap-4 relative shadow-2xl">
            <button type="button" onClick={closeForm} className="absolute top-2 right-4 text-xl">×</button>
            <h2 className="text-xl font-bold mb-2">{editEvent ? "Edit Event" : "Create Event"}</h2>
            <input type="text" placeholder="Title" className="px-3 py-2 rounded border border-zinc-700 bg-zinc-800 placeholder-zinc-400" value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <textarea placeholder="Description" className="px-3 py-2 rounded border border-zinc-700 bg-zinc-800 placeholder-zinc-400" value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            <input type="date" className="px-3 py-2 rounded border border-zinc-700 bg-zinc-800 placeholder-zinc-400" value={form.date ? form.date.slice(0,10) : ""} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <input type="time" className="px-3 py-2 rounded border border-zinc-700 bg-zinc-800 placeholder-zinc-400" value={form.time || ""} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
            <input type="text" placeholder="Venue" className="px-3 py-2 rounded border border-zinc-700 bg-zinc-800 placeholder-zinc-400" value={form.venue || ""} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} required />
            <input type="number" placeholder="Price (0 for free)" className="px-3 py-2 rounded border border-zinc-700 bg-zinc-800 placeholder-zinc-400" value={form.price ?? ""} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required min={0} />
            <div className="text-sm text-zinc-300">Select years with free entry:</div>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4].map(y => (
                <label key={y} className="flex items-center gap-2 text-zinc-200">
                  <input
                    type="checkbox"
                    checked={Array.isArray(form.freeYears) ? form.freeYears.includes(y as any) : false}
                    onChange={(e) => {
                      const current = Array.isArray(form.freeYears) ? [...(form.freeYears as any[])] : [];
                      if (e.target.checked) {
                        if (!current.includes(y as any)) current.push(y as any);
                      } else {
                        const idx = current.indexOf(y as any);
                        if (idx >= 0) current.splice(idx,1);
                      }
                      setForm(f => ({ ...f, freeYears: current as any }));
                    }}
                  />
                  {y} yr
                </label>
              ))}
            </div>
            <input type="text" placeholder="Poster URL (optional)" className="px-3 py-2 rounded border border-zinc-700 bg-zinc-800 placeholder-zinc-400" value={form.poster || ""} onChange={e => setForm(f => ({ ...f, poster: e.target.value }))} />
            <button type="submit" className="bg-primary text-white font-bold py-2 rounded hover:brightness-110 transition" disabled={saving}>{saving ? "Saving..." : editEvent ? "Update" : "Create"}</button>
            {error && <div className="text-red-400 text-center">{error}</div>}
          </form>
        </div>
      )}
    </div>
  );
}
