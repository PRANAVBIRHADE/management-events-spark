"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  poster?: string;
  freeYears?: number[];
}

function freeYearsText(yrs?: number[]) {
  if (!yrs || yrs.length === 0) return null;
  const map: Record<number,string> = {1:'1st',2:'2nd',3:'3rd',4:'4th'};
  return `Free for: ${yrs.map(y => map[y]).join(', ')}`;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [freePaid, setFreePaid] = useState<"all" | "free" | "paid">("all");
  const [year, setYear] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(setEvents)
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search, freePaid, year]);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now);
  const past = events.filter(e => new Date(e.date) < now);

  function applyFilters(list: Event[]) {
    return list.filter(ev => {
      const matchesSearch = search.trim() === "" || ev.title.toLowerCase().includes(search.toLowerCase()) || ev.description.toLowerCase().includes(search.toLowerCase()) || ev.venue.toLowerCase().includes(search.toLowerCase());
      const matchesFreePaid = freePaid === "all" || (freePaid === "free" ? ev.price === 0 : ev.price > 0);
      const matchesYear = year === "all" || (Array.isArray(ev.freeYears) && ev.freeYears.includes(year as number));
      return matchesSearch && matchesFreePaid && matchesYear;
    });
  }

  const filteredUpcoming = useMemo(() => applyFilters(upcoming), [upcoming, search, freePaid, year]);
  const totalPages = Math.max(1, Math.ceil(filteredUpcoming.length / pageSize));
  const pagedUpcoming = filteredUpcoming.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Upcoming Events</h1>

      {/* Filters */}
      <div className="bg-white/10 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="px-3 py-2 rounded bg-white/80" />
        <select value={freePaid} onChange={e => setFreePaid(e.target.value as any)} className="px-3 py-2 rounded bg-white/80">
          <option value="all">All</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <select value={year} onChange={e => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="px-3 py-2 rounded bg-white/80">
          <option value="all">Any Year Free</option>
          <option value={1}>Free for 1st</option>
          <option value={2}>Free for 2nd</option>
          <option value={3}>Free for 3rd</option>
          <option value={4}>Free for 4th</option>
        </select>
        <button onClick={() => { setSearch(""); setFreePaid("all"); setYear("all"); }} className="bg-primary text-white rounded px-4">Reset</button>
      </div>

      {loading ? (
        <div className="text-white">Loading events...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : pagedUpcoming.length === 0 ? (
        <div className="text-white">No upcoming events.</div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pagedUpcoming.map(ev => (
            <div key={ev._id} className="bg-white/10 rounded-xl p-6 flex flex-col shadow-lg">
              <h2 className="text-primary text-xl font-bold mb-2">{ev.title}</h2>
              <div className="text-white/90 mb-1">{new Date(ev.date).toLocaleDateString()} {ev.time}</div>
              <div className="text-white/80 mb-1">{ev.venue}</div>
              {ev.freeYears && ev.freeYears.length > 0 && (
                <div className="text-green-300 text-sm mb-1">{freeYearsText(ev.freeYears)}</div>
              )}
              <div className="text-white/80 mb-2">{ev.price === 0 ? "Free" : `₹${ev.price}`}</div>
              <Link href={`/events/${ev._id}`} className="mt-auto bg-primary text-white px-4 py-2 rounded font-semibold hover:brightness-110 transition text-center">View Details</Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50">Prev</button>
          <span className="text-white">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50">Next</button>
        </div>
      )}

      <h1 className="text-3xl font-bold text-white mt-16 mb-8">Past Events</h1>
      {past.length === 0 ? (
        <div className="text-white">No past events.</div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {past.map(ev => (
            <div key={ev._id} className="bg-white/10 rounded-xl p-6 flex flex-col shadow-lg opacity-60">
              <h2 className="text-primary text-xl font-bold mb-2">{ev.title}</h2>
              <div className="text-white/90 mb-1">{new Date(ev.date).toLocaleDateString()} {ev.time}</div>
              <div className="text-white/80 mb-1">{ev.venue}</div>
              {ev.freeYears && ev.freeYears.length > 0 && (
                <div className="text-green-300 text-sm mb-1">{freeYearsText(ev.freeYears)}</div>
              )}
              <div className="text-white/80 mb-2">{ev.price === 0 ? "Free" : `₹${ev.price}`}</div>
              <Link href={`/events/${ev._id}`} className="mt-auto bg-primary/60 text-white px-4 py-2 rounded font-semibold text-center cursor-not-allowed">View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
