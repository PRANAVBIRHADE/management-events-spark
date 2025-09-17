"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

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

interface Ticket {
  _id: string;
  status: string;
  qrCode?: string;
  paymentScreenshot?: string;
}

function freeYearsText(yrs?: number[]) {
  if (!yrs || yrs.length === 0) return null;
  const map: Record<number,string> = {1:'1st',2:'2nd',3:'3rd',4:'4th'};
  return `Free for: ${yrs.map(y => map[y]).join(', ')}`;
}

export default function EventDetailsPage() {
  const { id } = useParams() as { id: string };
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(() => setError("Failed to load event"))
      .finally(() => setLoading(false));
  }, [id]);

  // Check if user already registered
  useEffect(() => {
    fetch('/api/auth/me').then(async (r) => {
      if (!r.ok) return;
      const session = await r.json();
      if (!session.user) return;
      fetch("/api/tickets")
        .then(res => res.json())
        .then(tickets => {
          const t = tickets.find((t: any) => t.eventId?._id === id);
          if (t) setTicket(t);
        });
    });
  }, [id]);

  async function handleRegister() {
    setRegLoading(true);
    setRegError(null);
    setRegSuccess(null);
    let paymentScreenshotUrl = undefined;
    if (event?.price && screenshot) {
      paymentScreenshotUrl = await toBase64(screenshot);
    }
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: id, paymentScreenshot: paymentScreenshotUrl }),
    });
    const data = await res.json();
    setRegLoading(false);
    if (res.ok) {
      setTicket(data);
      setRegSuccess("Registration successful!");
    } else {
      setRegError(data.error || "Registration failed");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setScreenshot(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setScreenshotUrl(url);
    } else {
      setScreenshotUrl(null);
    }
  }

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // simple static UPI QR placeholder (replace with generated one later)
  const upiQrPlaceholder = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="white"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14">UPI QR</text></svg>');

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {loading ? (
        <div className="text-white">Loading event...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : !event ? (
        <div className="text-white">Event not found.</div>
      ) : (
        <div className="bg-white/10 rounded-xl p-8 shadow-lg flex flex-col gap-4">
          {event.poster && <img src={event.poster} alt="Event Poster" className="w-full max-h-64 object-cover rounded mb-4" />}
          <h1 className="text-3xl font-bold text-primary mb-2">{event.title}</h1>
          <div className="text-white/90 mb-1">{new Date(event.date).toLocaleDateString()} {event.time}</div>
          <div className="text-white/80 mb-1">{event.venue}</div>
          {event.freeYears && event.freeYears.length > 0 && (
            <div className="text-green-300">{freeYearsText(event.freeYears)}</div>
          )}
          <div className="text-white/80 mb-2">{event.price === 0 ? "Free" : `₹${event.price}`}</div>
          <p className="text-white/90 mb-4">{event.description}</p>

          {/* Registration logic */}
          {ticket ? (
            <div className="bg-white/20 rounded p-4 text-center">
              <div className="mb-2 font-semibold text-white">You are registered for this event.</div>
              <div className="mb-2">
                Status: {ticket.status === 'approved' ? <span className="text-green-400 font-bold">Approved</span> : ticket.status === 'pending' ? <span className="text-yellow-400 font-bold">Pending</span> : <span className="text-red-400 font-bold">Rejected</span>}
              </div>
              {ticket.qrCode && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <img src={ticket.qrCode} alt="QR Code" className="w-40 h-40 bg-white rounded" />
                  <a href={ticket.qrCode} download={`ticket_${event.title}.png`} className="text-primary underline">Download Ticket</a>
                </div>
              )}
              {ticket.paymentScreenshot && (
                <div className="mt-2">
                  <a href={ticket.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Payment Screenshot</a>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {event.price > 0 && (
                <div className="bg-white/20 rounded p-4 text-center">
                  <div className="mb-2 text-white">This is a paid event. Pay via UPI and upload screenshot:</div>
                  <img src={upiQrPlaceholder} alt="UPI QR" className="w-40 h-40 bg-white rounded mx-auto mb-2" />
                  <div className="font-bold text-primary text-lg mb-2">upi-id@bank</div>
                  <input type="file" accept="image/*" ref={fileInput} onChange={handleFileChange} className="mb-2" />
                  {screenshotUrl && <img src={screenshotUrl} alt="Screenshot preview" className="w-32 h-32 object-cover rounded mx-auto" />}
                </div>
              )}
              <button onClick={handleRegister} disabled={regLoading || (event.price > 0 && !screenshot)} className="bg-primary text-white px-6 py-2 rounded font-semibold hover:brightness-110 transition w-full max-w-xs mx-auto disabled:opacity-60">
                {regLoading ? "Registering..." : "Register"}
              </button>
              {regError && <div className="text-red-400 text-center">{regError}</div>}
              {regSuccess && <div className="text-green-400 text-center">{regSuccess}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
