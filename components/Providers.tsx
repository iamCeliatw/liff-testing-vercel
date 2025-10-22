"use client";
import { LiffProvider } from "@/contexts/LiffContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <LiffProvider>{children}</LiffProvider>;
}
