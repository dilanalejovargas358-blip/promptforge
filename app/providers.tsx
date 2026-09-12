"use client";

import { SessionProvider } from "next-auth/react";

// Envuelve toda la app para que los componentes cliente puedan usar useSession()
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
