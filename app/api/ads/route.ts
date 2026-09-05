import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AD_CREDITS,
  AD_COOLDOWN_MS,
  applyPremiumDailyCredits,
  getDbUser,
  isPremiumActive,
  recordTransaction,
} from "@/lib/credits";

export const dynamic = "force-dynamic";

// Estado de elegibilidad (para ocultar el botón cuando hay cooldown).
export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ ok: false, canWatch: false }, { status: 401 });
  }

  const now = Date.now();
  const lastAd = await prisma.adView.findFirst({
    where: { userId: user.id },
    orderBy: { viewedAt: "desc" },
  });
  const cooldownRemaining = lastAd
    ? Math.max(0, AD_COOLDOWN_MS - (now - new Date(lastAd.viewedAt).getTime()))
    : 0;

  return NextResponse.json({
    ok: true,
    canWatch: !isPremiumActive(user) && cooldownRemaining === 0,
    cooldownRemaining,
    isPremiumActive: isPremiumActive(user),
  });
}

// Completar la visualización de un anuncio -> +1 crédito.
// El body puede indicar adType: "GOOGLE" | "SPONSOR".
export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  // Los usuarios Premium no ven anuncios.
  if (isPremiumActive(user)) {
    return NextResponse.json(
      { error: "Eres Premium, no necesitas ver anuncios." },
      { status: 403 }
    );
  }

  // Cooldown anti-abuso a nivel de servidor (15s).
  const now = Date.now();
  const lastAd = await prisma.adView.findFirst({
    where: { userId: user.id },
    orderBy: { viewedAt: "desc" },
  });
  if (lastAd && now - new Date(lastAd.viewedAt).getTime() < AD_COOLDOWN_MS) {
    const remaining = Math.max(
      0,
      Math.ceil((AD_COOLDOWN_MS - (now - new Date(lastAd.viewedAt).getTime())) / 1000)
    );
    return NextResponse.json(
      { error: `Espera ${remaining}s antes de ver otro anuncio.` },
      { status: 429 }
    );
  }

  let adType: "GOOGLE" | "SPONSOR" = "GOOGLE";
  try {
    const body = await req.json();
    if (body?.adType === "SPONSOR" || body?.adType === "GOOGLE") adType = body.adType;
  } catch {
    // body vacío u opcional; seguimos con GOOGLE.
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { credits: { increment: AD_CREDITS } },
  });

  await prisma.adView.create({
    data: { userId: user.id, adType, creditsEarned: AD_CREDITS },
  });
  await recordTransaction(
    user.id,
    "EARN",
    AD_CREDITS,
    `Anuncio visto (+${AD_CREDITS} crédito)`
  );

  return NextResponse.json({
    ok: true,
    credits: updated.credits,
    earned: AD_CREDITS,
  });
}
