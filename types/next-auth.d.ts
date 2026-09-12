import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      credits: number;
      rays: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    credits?: number;
    rays?: number;
    /** Marca de tiempo (ms) del último refresco contra la BD. */
    refreshedAt?: number;
  }
}
