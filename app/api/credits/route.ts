import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyRaysRegen,
  getDbUser,
  isPremiumActive,
  nextRayAt,
  RAYS_MAX,
} from "@/lib/credits";

export const dynamic = "force-dynamic";

// Devuelve saldo de créditos IA, rayitos, estado premium e historial.
export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  // Regeneración perezosa de rayitos antes de leer el saldo.
  const current = await applyRaysRegen(user);

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

  return NextResponse.json({
    ok: true,
    credits: current.credits,
    rays: current.rays,
    raysMax: RAYS_MAX,
    raysNextAt: nextRayAt(current),
    isPremium: current.isPremium,
    isPremiumActive: isPremiumActive(current),
    premiumUntil: current.premiumUntil,
    history,
  });
}
