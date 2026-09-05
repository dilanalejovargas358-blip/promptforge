import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyPremiumDailyCredits,
  getDbUser,
  isPremiumActive,
  recordTransaction,
} from "@/lib/credits";

export const dynamic = "force-dynamic";

interface Ctx {
  params: { id: string };
}

// Apoyar un prompt: cuesta 1 crédito y suma 1 al creador + al total del prompt.
// Los usuarios Premium activos pueden apoyar sin gastar créditos ("créditos ilimitados").
export async function POST(_req: Request, ctx: Ctx) {
  const supporter = await getDbUser();
  if (!supporter) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { id: promptId } = ctx.params;
  if (!promptId) {
    return NextResponse.json({ error: "Prompt no válido." }, { status: 400 });
  }

  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: {
      id: true,
      title: true,
      authorId: true,
      author: { select: { id: true, name: true } },
    },
  });
  if (!prompt) {
    return NextResponse.json({ error: "Prompt no encontrado." }, { status: 404 });
  }

  // No se puede auto-apoyar el propio prompt.
  if (prompt.authorId === supporter.id) {
    return NextResponse.json(
      { error: "No puedes apoyar tu propio prompt." },
      { status: 400 }
    );
  }

  const supporterFresh = await applyPremiumDailyCredits(supporter);
  const premium = isPremiumActive(supporterFresh);

  // Los no Premium deben tener al menos 1 crédito para apoyar.
  if (!premium && supporterFresh.credits < 1) {
    return NextResponse.json(
      { error: "No tienes créditos. Mira un anuncio para ganar créditos." },
      { status: 402 }
    );
  }

  // Descontar crédito al que apoya (solo si no es Premium).
  let supporterFinal = supporterFresh;
  if (!premium) {
    supporterFinal = await prisma.user.update({
      where: { id: supporterFresh.id },
      data: { credits: { decrement: 1 } },
    });
    await recordTransaction(
      supporterFresh.id,
      "SPEND",
      1,
      `Apoyaste "${prompt.title}" (-1 crédito)`
    );
  }
  await recordTransaction(
    supporterFresh.id,
    "DONATE",
    1,
    premium
      ? `Apoyo Premium a "${prompt.title}"`
      : `Apoyo a "${prompt.title}"`
  );

  // El creador recibe 1 crédito en su saldo y suma al total del prompt.
  await prisma.user.update({
    where: { id: prompt.authorId },
    data: { credits: { increment: 1 } },
  });
  const updatedPrompt = await prisma.prompt.update({
    where: { id: prompt.id },
    data: { totalCredits: { increment: 1 } },
    select: { totalCredits: true },
  });
  await recordTransaction(
    prompt.authorId,
    "EARN",
    1,
    `Recibiste apoyo en "${prompt.title}" (+1 crédito)`
  );

  return NextResponse.json({
    ok: true,
    message: "¡Gracias por apoyar este prompt!",
    credits: supporterFinal.credits,
    totalCredits: updatedPrompt.totalCredits,
  });
}
