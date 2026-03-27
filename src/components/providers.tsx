"use client";

import type { ReactNode } from "react";
import { FirebaseProvider } from "@/providers/firebase-provider";

export function Providers({ children }: { children: ReactNode }) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
