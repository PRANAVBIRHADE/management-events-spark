"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: number; message: string; type?: 'success' | 'error' | 'info' };

const ToastCtx = createContext<{ toast: (msg: string, type?: Toast['type']) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToasterProvider>');
  return ctx.toast;
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {items.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded shadow text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-black/80'}`}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
