import type { User as PrismaUser } from "@prisma/client";

// Roles disponibles en la plataforma
export type UserRole = "USER" | "ADMIN";

// Extiende el usuario de Prisma para el frontend
export type PublicUser = Pick<
  PrismaUser,
  | "id"
  | "name"
  | "email"
  | "image"
  | "bio"
  | "credits"
  | "role"
  | "isPremium"
  | "premiumUntil"
  | "createdAt"
>;

export interface NavLink {
  label: string;
  href: string;
}

export interface PromptCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  model: string;
  price: number;
  isPaid: boolean;
  isFeatured: boolean;
  isSponsored?: boolean;
  views: number;
  savesCount: number;
  totalCredits: number;
  createdAt: Date | string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// Movimiento contable para mostrar historial en el perfil
export interface CreditTransaction {
  id: string;
  type: "EARN" | "SPEND" | "DONATE" | "PREMIUM";
  amount: number;
  description: string;
  createdAt: Date | string;
}

// Resultado que devuelve el endpoint de apoyo
export interface SupportResult {
  ok: boolean;
  credits?: number;
  totalCredits?: number;
  message?: string;
  error?: string;
}

export interface PromptFilters {
  query?: string;
  category?: string;
  model?: string;
  sort?: "recent" | "popular" | "views";
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}
