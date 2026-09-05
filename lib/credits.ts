import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

// Tiempo mínimo entre visualización de anuncios para evitar abuso.
export const AD_COOLDOWN_MS = 15_000;
// Créditos que otorga cada anuncio completado.
export const AD_CREDITS = 1;
// Créditos diarios que recibe un usuario Premium activo.
export const PREMIUM_DAILY_CREDITS = 5;
// Meses de validez al contratar Premium.
export const PREMIUM_MONTHS = 1;

/** Un usuario es Premium activo solo si la flag está activa y la fecha no ha expirado. */
export function isPremiumActive(
  user: Pick<User, "isPremium" | "premiumUntil">
): boolean {
  return (
    user.isPremium &&
    !!user.premiumUntil &&
    new Date(user.premiumUntil).getTime() > Date.now()
  );
}

/** Devuelve el usuario de BD de la sesión actual, o null si no hay sesión. */
export async function getDbUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}

/** Registra un movimiento contable de créditos. */
export async function recordTransaction(
  userId: string,
  type: "EARN" | "SPEND" | "DONATE" | "PREMIUM",
  amount: number,
  description: string
) {
  return prisma.transaction.create({
    data: { userId, type, amount, description },
  });
}

/**
 * Otorga el crédito diario (+5) a un usuario Premium activo, una única vez al día.
 * Se invoca de forma perezosa antes de leer el saldo. Devuelve el usuario actualizado.
 */
export async function applyPremiumDailyCredits(user: User): Promise<User> {
  if (!isPremiumActive(user)) return user;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const last = user.premiumDailyAt
    ? new Date(user.premiumDailyAt).toISOString().slice(0, 10)
    : null;
  if (last === today) return user;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { credits: { increment: PREMIUM_DAILY_CREDITS }, premiumDailyAt: new Date() },
  });
  await recordTransaction(
    user.id,
    "EARN",
    PREMIUM_DAILY_CREDITS,
    `Crédito diario Premium (+${PREMIUM_DAILY_CREDITS})`
  );
  return updated;
}

/** Suma el total de créditos recibidos por los prompts de un autor. */
export async function authorEarnedCredits(authorId: string): Promise<number> {
  const agg = await prisma.prompt.aggregate({
    where: { authorId },
    _sum: { totalCredits: true },
  });
  return agg._sum.totalCredits ?? 0;
}

export type { User };
