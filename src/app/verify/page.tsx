"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("No token provided.");
      return;
    }
    fetch(`/api/auth/verify?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) setMessage(data.message);
        else setError(data.error || "Verification failed");
      })
      .catch(() => setError("Verification failed"));
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gradientStart to-gradientEnd">
      <div className="bg-white/10 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-5 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Email Verification</h2>
        {message && <div className="text-green-400">{message}</div>}
        {error && <div className="text-red-400">{error}</div>}
      </div>
    </div>
  );
}
