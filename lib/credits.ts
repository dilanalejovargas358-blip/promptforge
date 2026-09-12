import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  IA_COST,
  PREMIUM_MONTHLY_CREDITS,
  PREMIUM_MONTHS,
  RAYS_MAX,
  RAYS_REGEN_MS,
  SIGNUP_CREDITS,
  SIGNUP_RAYS,
} from "@/lib/constants";
import type { User } from "@prisma/client";

// Las constantes de las dos economías viven en `lib/constants.ts` (módulo sin
// dependencias de servidor, para que también puedan importarlas los componentes
// cliente y `lib/auth.ts`). Se re-exportan aquí para no romper los imports
// existentes desde `@/lib/credits`.
export {
  IA_COST,
  PREMIUM_MONTHLY_CREDITS,
  PREMIUM_MONTHS,
  SIGNUP_CREDITS,
  RAYS_MAX,
  RAYS_REGEN_MS,
  SIGNUP_RAYS,
};

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

/**
 * Registra un movimiento contable.
 * EARN/SPEND/PREMIUM son créditos IA; RAY_EARN/RAY_SPEND son rayitos.
 */
export async function recordTransaction(
  userId: string,
  type: "EARN" | "SPEND" | "DONATE" | "PREMIUM" | "RAY_EARN" | "RAY_SPEND",
  amount: number,
  description: string
) {
  return prisma.transaction.create({
    data: { userId, type, amount, description },
  });
}

/** Suma el total de apoyos recibidos por los prompts de un autor. */
export async function authorEarnedCredits(authorId: string): Promise<number> {
  const agg = await prisma.prompt.aggregate({
    where: { authorId },
    _sum: { totalCredits: true },
  });
  return agg._sum.totalCredits ?? 0;
}

// --- Rayitos ----------------------------------------------------------------

/**
 * Regenera los rayitos de forma perezosa: +1 por cada hora transcurrida desde
 * `raysUpdatedAt`, con tope en RAYS_MAX. Se llama antes de leer el saldo.
 * Devuelve el usuario actualizado (o el mismo si no había nada que regenerar).
 */
export async function applyRaysRegen(user: User): Promise<User> {
  // Saldos heredados por encima del tope: recortarlos sin conceder nada.
  if (user.rays > RAYS_MAX) {
    return prisma.user.update({
      where: { id: user.id },
      data: { rays: RAYS_MAX, raysUpdatedAt: new Date() },
    });
  }

  if (user.rays >= RAYS_MAX) return user;

  // Los usuarios creados antes de la migración tienen `raysUpdatedAt` a null.
  // Hay que persistirlo para arrancar su reloj: si solo usásemos `now` en
  // memoria, cada lectura reiniciaría la cuenta y nunca recibirían un rayito.
  if (!user.raysUpdatedAt) {
    return prisma.user.update({
      where: { id: user.id },
      data: { raysUpdatedAt: new Date() },
    });
  }

  const now = Date.now();
  const last = new Date(user.raysUpdatedAt).getTime();
  const periods = Math.floor((now - last) / RAYS_REGEN_MS);
  if (periods <= 0) return user;

  // El tope se aplica DENTRO de la escritura (LEAST), no solo al calcular
  // `gained` en JS: el cliente sondea /api/credits desde Navbar, RayCounter y
  // ProfileWallet a la vez, y varias peticiones concurrentes parten del mismo
  // saldo obsoleto y suman cada una su parte (el admin llegó a 17/5).
  const gained = Math.min(periods, RAYS_MAX - user.rays);
  await prisma.$executeRaw`
    UPDATE "User"
    SET rays = LEAST(rays + ${gained}, ${RAYS_MAX})::int,
        "raysUpdatedAt" = ${new Date()}
    WHERE id = ${user.id} AND rays < ${RAYS_MAX}
  `;

  const updated = await prisma.user.findUnique({ where: { id: user.id } });
  if (!updated) return user;

  // Se registra el delta real aplicado por la BD, no el calculado en JS: si
  // otra petición concurrente ya llegó al tope, el UPDATE no toca nada.
  const delta = updated.rays - user.rays;
  if (delta > 0) {
    await recordTransaction(
      user.id,
      "RAY_EARN",
      delta,
      `Rayitos regenerados (+${delta})`
    );
  }
  return updated;
}

/** Timestamp (ms) del próximo rayito, o null si el usuario ya está al tope. */
export function nextRayAt(user: Pick<User, "rays" | "raysUpdatedAt">): number | null {
  if (user.rays >= RAYS_MAX) return null;
  const last = user.raysUpdatedAt ? new Date(user.raysUpdatedAt).getTime() : Date.now();
  return last + RAYS_REGEN_MS;
}

/** ¿Le quedan créditos IA al usuario para usar una herramienta? */
export async function canSpendIA(user: User, cost = IA_COST): Promise<boolean> {
  return user.credits >= cost;
}

/**
 * Descuenta créditos IA de forma atómica.
 * Devuelve false si el usuario no tenía saldo suficiente (nada se descuenta).
 */
export async function spendIA(
  userId: string,
  cost = IA_COST,
  description = "Uso de herramienta IA"
): Promise<boolean> {
  const deducted = await prisma.user.updateMany({
    where: { id: userId, credits: { gte: cost } },
    data: { credits: { decrement: cost } },
  });
  if (deducted.count === 0) return false;

  await recordTransaction(userId, "SPEND", -cost, description);
  return true;
}

/**
 * Devuelve créditos IA ya cobrados. Se usa cuando la petición se cobró pero la
 * IA la rechazó por moderación: el usuario no debe pagar por no recibir nada.
 */
export async function refundIA(
  userId: string,
  cost = IA_COST,
  description = "Reembolso: la IA rechazó la petición"
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: cost } },
  });
  await recordTransaction(userId, "EARN", cost, description);
}

/**
 * Descuenta 1 rayito de forma atómica.
 * Devuelve false si el usuario no tenía rayitos (nada se descuenta).
 *
 * Si el usuario estaba al tope, el contador de regeneración se reinicia a ahora:
 * de lo contrario, al bajar del tope `raysUpdatedAt` seguiría siendo antiguo y
 * la siguiente regeneración le devolvería el rayito al instante.
 */
export async function spendRay(
  userId: string,
  description = "Apoyo a prompt"
): Promise<boolean> {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { rays: true },
  });
  if (!current) return false;

  // Saldos heredados por encima del tope: se recortan ANTES de descontar, para
  // que gastar un rayito no deje al usuario igualmente por encima de RAYS_MAX.
  if (current.rays > RAYS_MAX) {
    await prisma.user.update({
      where: { id: userId },
      data: { rays: RAYS_MAX },
    });
    current.rays = RAYS_MAX;
  }

  if (current.rays < 1) return false;

  const wasAtMax = current.rays >= RAYS_MAX;
  const deducted = await prisma.user.updateMany({
    where: { id: userId, rays: { gte: 1 } },
    data: {
      rays: { decrement: 1 },
      ...(wasAtMax ? { raysUpdatedAt: new Date() } : {}),
    },
  });
  if (deducted.count === 0) return false;

  await recordTransaction(userId, "RAY_SPEND", -1, description);
  return true;
}

// NOTA: el top-up mensual de créditos IA (PREMIUM_MONTHLY_CREDITS) NO se aplica
// aquí de forma perezosa — lo concede el webhook de Stripe en cada pago
// (checkout.session.completed para el alta, invoice.payment_succeeded para las
// renovaciones). Así cada pago acredita exactamente una vez.

export type { User };
