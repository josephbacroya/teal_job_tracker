// src/hooks/use-toast.ts
import { useCallback } from "react";

interface ToastInput {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = useCallback((input: ToastInput) => {
    const event = new CustomEvent("toast", { detail: input });
    window.dispatchEvent(event);
  }, []);

  return { toast };
}
