"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Event {
  _id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  freeYears?: number[];
}

export default function Upcoming() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then((data: Event[]) => {
        const now = new Date();
        const upcoming = data
          .filter(e => new Date(e.date) >= now)
          .sort((a,b) => +new Date(a.date) - +new Date(b.date))
          .slice(0,3);
        setEvents(upcoming);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white text-center">Loading...</div>;
  if (events.length === 0) return <div className="text-white text-center">No upcoming events.</div>;

  function freeYearsText(yrs?: number[]) {
    if (!yrs || yrs.length === 0) return null;
    const map: Record<number,string> = {1:'1st',2:'2nd',3:'3rd',4:'4th'};
    return `Free for: ${yrs.map(y => map[y]).join(', ')}`;
  }

  return (
    <div className="flex flex-wrap justify-center gap-8">
      {events.map(ev => (
        <div key={ev._id} className="bg-white/10 rounded-xl p-6 w-full max-w-xs min-h-[200px] flex flex-col shadow-lg">
          <h3 className="text-primary text-xl font-bold mb-2">{ev.title}</h3>
          <div className="text-white/90 mb-1">{new Date(ev.date).toLocaleDateString()} {ev.time}</div>
          <div className="text-white/80 mb-1">{ev.venue}</div>
          {ev.freeYears && ev.freeYears.length > 0 && (
            <div className="text-green-300 text-sm mb-1">{freeYearsText(ev.freeYears)}</div>
          )}
          <div className="text-white/80 mb-3">{ev.price === 0 ? "Free" : `₹${ev.price}`}</div>
          <Link href={`/events/${ev._id}`} className="mt-auto bg-primary text-white px-4 py-2 rounded font-semibold hover:brightness-110 transition text-center">View Details</Link>
        </div>
      ))}
    </div>
  );
}
