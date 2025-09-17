import Image from "next/image";
import Link from "next/link";
import Upcoming from "@/components/Upcoming";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gradientStart to-gradientEnd font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-16 px-4">
        <h2 className="text-white font-semibold text-lg mb-2">Welcome to MPGI SOE</h2>
        <h1 className="text-primary font-extrabold text-5xl md:text-6xl mb-4">Event Portal</h1>
        <p className="text-white text-lg md:text-xl max-w-2xl mb-8">
          Register & Participate in College Events Easily. Discover sports tournaments, cultural festivals, and technical workshops happening around campus.
        </p>
        <Link href="/events" className="bg-primary text-white font-bold text-lg px-8 py-3 rounded-md flex items-center gap-2 hover:brightness-110 transition">
          View Events
          <span className="text-2xl">→</span>
        </Link>
      </section>

      {/* Upcoming Events */}
      <section className="px-4 pb-16">
        <h2 className="text-white text-3xl font-bold text-center mb-10">Upcoming Events</h2>
        <Upcoming />
      </section>
    </div>
  );
}
