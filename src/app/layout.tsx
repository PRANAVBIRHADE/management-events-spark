import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToasterProvider } from "@/components/Toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MPGI SOE Event Portal",
    template: "%s | MPGI SOE",
  },
  description: "Register and participate in college events: sports, cultural, and technical workshops.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "MPGI SOE Event Portal",
    description: "Discover and register for college events.",
    type: "website",
    url: "https://localhost:3000/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-r from-gradientStart to-gradientEnd`}>
        <ToasterProvider>
          <Navbar />
          {children}
        </ToasterProvider>
      </body>
    </html>
  );
}
