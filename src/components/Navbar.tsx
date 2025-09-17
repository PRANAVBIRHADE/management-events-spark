"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname.startsWith("/admin")) return null;

  const [hasUser, setHasUser] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);

  async function refreshAuth() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setHasUser(!!data.user);
        setHasAdmin(!!data.admin);
      } else {
        setHasUser(false);
        setHasAdmin(false);
      }
    } catch {
      setHasUser(false);
      setHasAdmin(false);
    }
  }

  useEffect(() => { refreshAuth(); }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setHasUser(false);
    setHasAdmin(false);
    router.push('/');
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-transparent">
      <div className="flex items-center gap-2">
        <span className="text-primary text-2xl">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#22d47b" d="M2 19.5V6.75C2 5.231 3.231 4 4.75 4h14.5C20.769 4 22 5.231 22 6.75v12.75a.75.75 0 0 1-1.5 0V6.75a1.25 1.25 0 0 0-1.25-1.25H4.75A1.25 1.25 0 0 0 3.5 6.75v12.75a.75.75 0 0 1-1.5 0Z"/><rect width="18" height="2.5" x="3" y="8" fill="#22d47b" rx="1.25"/></svg>
        </span>
        <span className="text-white font-bold text-xl tracking-wide">MPGI SOE</span>
      </div>
      <div className="hidden md:flex gap-8 text-white font-medium text-lg">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <Link href="/events" className="hover:text-primary transition">Events</Link>
        <Link href="#" className="hover:text-primary transition">Sports</Link>
        <Link href="#" className="hover:text-primary transition">Cultural</Link>
        <Link href="#" className="hover:text-primary transition">Technical</Link>
        <Link href="#" className="hover:text-primary transition">Contact</Link>
      </div>
      <div className="flex gap-3">
        {hasUser ? (
          <>
            <Link href="/my-tickets" className="bg-primary text-white font-semibold px-5 py-2 rounded-md hover:brightness-110 transition">My Tickets</Link>
            <button onClick={handleLogout} className="border border-white text-white font-semibold px-5 py-2 rounded-md hover:bg-white hover:text-gradientEnd transition">Logout</button>
          </>
        ) : (
          <>
            <Link href="/register" className="bg-primary text-white font-semibold px-5 py-2 rounded-md hover:brightness-110 transition">Register</Link>
            <Link href="/login" className="border border-white text-white font-semibold px-5 py-2 rounded-md hover:bg-white hover:text-gradientEnd transition">Login</Link>
          </>
        )}
        {hasAdmin ? (
          <Link href="/admin" className="border border-white text-white font-semibold px-5 py-2 rounded-md hover:bg-white hover:text-gradientEnd transition">Admin</Link>
        ) : (
          <Link href="/admin-login" className="border border-white text-white font-semibold px-5 py-2 rounded-md hover:bg-white hover:text-gradientEnd transition">Admin Login</Link>
        )}
      </div>
    </nav>
  );
}
