"use client";

import { useInitAuth } from "@/lib/auth/initAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useInitAuth();
  return <>{children}</>;
}

