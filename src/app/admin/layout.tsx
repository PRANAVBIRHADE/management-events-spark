import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-r from-gradientStart to-gradientEnd font-sans">
      <aside className="w-64 bg-black/30 p-6 flex flex-col gap-6 text-white min-h-screen">
        <div className="text-2xl font-bold text-primary mb-8">Admin Panel</div>
        <nav className="flex flex-col gap-4">
          <Link href="/admin" className="hover:text-primary transition">Dashboard</Link>
          <Link href="/admin/events" className="hover:text-primary transition">Events</Link>
          <Link href="/admin/users" className="hover:text-primary transition">Users</Link>
          <Link href="/admin/registrations" className="hover:text-primary transition">Registrations</Link>
          <Link href="/admin/analytics" className="hover:text-primary transition">Analytics</Link>
          <button className="mt-8 text-left hover:text-red-400 transition">Logout</button>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
