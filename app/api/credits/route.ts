import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AD_COOLDOWN_MS,
  applyPremiumDailyCredits,
  getDbUser,
  isPremiumActive,
} from "@/lib/credits";

export const dynamic = "force-dynamic";

// Devuelve saldo, estado premium e historial del usuario autenticado.
export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  // Top-up perezoso del crédito diario Premium antes de leer el saldo.
  const current = await applyPremiumDailyCredits(user);

  const history = await prisma.transaction.findMany({
    where: { userId: current.id },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      type: true,
      amount: true,
      description: true,
      createdAt: true,
    },
  });

  const now = Date.now();
  const lastAd = await prisma.adView.findFirst({
    where: { userId: current.id },
    orderBy: { viewedAt: "desc" },
  });
  const cooldownRemaining = lastAd
    ? Math.max(0, AD_COOLDOWN_MS - (now - new Date(lastAd.viewedAt).getTime()))
    : 0;

  return NextResponse.json({
    ok: true,
    credits: current.credits,
    isPremium: current.isPremium,
    isPremiumActive: isPremiumActive(current),
    premiumUntil: current.premiumUntil,
    canWatchAd: !isPremiumActive(current) && cooldownRemaining === 0,
    cooldownRemaining,
    history,
  });
}
