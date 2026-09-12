import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRaysRegen, getDbUser, recordTransaction, spendRay } from "@/lib/credits";

export const dynamic = "force-dynamic";

interface Ctx {
  params: { id: string };
}

// Apoyar un prompt cuesta 1 rayito. El creador NO recibe moneda gastable:
// solo sube `totalCredits` del prompt (que alimenta el ranking).
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
    select: { id: true, title: true, authorId: true },
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

  // Regeneración perezosa antes de comprobar el saldo de rayitos.
  const supporterFresh = await applyRaysRegen(supporter);

  // Descuento atómico: si otra petición se adelantó, no se cobra dos veces.
  const charged = await spendRay(supporterFresh.id, `Apoyaste "${prompt.title}"`);
  if (!charged) {
    return NextResponse.json(
      {
        error: "No tienes rayitos. Se regeneran 1 por hora (máx 5).",
        code: "INSUFFICIENT_RAYS",
      },
      { status: 402 }
    );
  }

  // El creador solo suma al total del prompt (ranking), sin moneda gastable.
  const updatedPrompt = await prisma.prompt.update({
    where: { id: prompt.id },
    data: { totalCredits: { increment: 1 } },
    select: { totalCredits: true },
  });
  await recordTransaction(
    prompt.authorId,
    "RAY_EARN",
    1,
    `Recibiste apoyo en "${prompt.title}"`
  );

  const supporterFinal = await prisma.user.findUnique({
    where: { id: supporterFresh.id },
    select: { rays: true },
  });

  return NextResponse.json({
    ok: true,
    message: "¡Gracias por apoyar este prompt!",
    rays: supporterFinal?.rays ?? supporterFresh.rays - 1,
    totalCredits: updatedPrompt.totalCredits,
  });
}
