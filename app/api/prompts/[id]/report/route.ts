import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/credits";

export const dynamic = "force-dynamic";

const reportSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más: al menos 10 caracteres.")
    .max(500, "El motivo no puede pasar de 500 caracteres."),
});

interface Ctx {
  params: { id: string };
}

// Cualquier usuario con sesión puede reportar. El prompt reportado SIGUE
// VISIBLE hasta que un admin actúe desde /admin/reports.
export async function POST(req: Request, ctx: Ctx) {
  const reporter = await getDbUser();
  if (!reporter) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para reportar." },
      { status: 401 }
    );
  }

  const { id: promptId } = ctx.params;
  if (!promptId) {
    return NextResponse.json({ error: "Prompt no válido." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Motivo no válido." },
      { status: 400 }
    );
  }

  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: { id: true, authorId: true },
  });
  if (!prompt) {
    return NextResponse.json({ error: "Prompt no encontrado." }, { status: 404 });
  }

  // Reportar el propio prompt no tiene sentido y solo ensucia la cola de admin.
  if (prompt.authorId === reporter.id) {
    return NextResponse.json(
      { error: "No puedes reportar tu propio prompt." },
      { status: 400 }
    );
  }

  // Un mismo usuario no puede acumular reportes pendientes sobre el mismo
  // prompt. Si un admin ya lo desestimó, sí puede volver a reportarlo.
  const existing = await prisma.report.findFirst({
    where: {
      promptId: prompt.id,
      reporterId: reporter.id,
      status: "PENDING",
    },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "Ya reportaste este prompt. Está pendiente de revisión.",
        code: "ALREADY_REPORTED",
      },
      { status: 409 }
    );
  }

  // El motivo del reporte NO se modera a propósito, y no es un olvido: para
  // denunciar contenido dañino hay que describirlo, así que las dos capas
  // bloquearían justo los reportes más graves ("este prompt explica cómo
  // fabricar una bomba" → capa local, violence/bomba). Además este texto solo lo
  // ve el admin en /admin/reports, nunca se publica en una vista pública, así
  // que moderarlo no protege a nadie. Verificado: 8 de 11 motivos realistas
  // quedaban bloqueados. La única defensa que necesita es la longitud (500).
  await prisma.report.create({
    data: {
      reason: parsed.data.reason,
      promptId: prompt.id,
      reporterId: reporter.id,
      authorId: prompt.authorId,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Reporte enviado. Gracias por ayudarnos a cuidar la comunidad.",
  });
}
