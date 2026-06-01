// src/components/ui/toaster.tsx
"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Omit<ToastMessage, "id">;
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...detail, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 shadow-lg pointer-events-auto min-w-[280px] max-w-sm animate-in slide-in-from-bottom-2",
            toast.variant === "destructive"
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : "bg-card border-border text-foreground"
          )}
        >
          {toast.variant === "destructive" ? (
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-400" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
