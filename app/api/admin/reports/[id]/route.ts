import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/credits";
import { notifyUser } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const actionSchema = z.object({
  action: z.enum(["hide", "remove", "dismiss"]),
  note: z.string().trim().max(500).optional(),
});

interface Ctx {
  params: { id: string };
}

// Solo un admin puede ocultar, borrar o desestimar. Nunca se borra la fila del
// prompt: se marca como REMOVED para conservar el historial y poder revertirlo.
export async function PATCH(req: Request, ctx: Ctx) {
  const admin = await getDbUser();
  if (!admin) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }
  if (admin.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo un administrador puede moderar." },
      { status: 403 }
    );
  }

  const { id: reportId } = ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  const { action, note } = parsed.data;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      prompt: { select: { id: true, title: true } },
      author: { select: { id: true } },
    },
  });
  if (!report) {
    return NextResponse.json({ error: "Reporte no encontrado." }, { status: 404 });
  }

  const now = new Date();

  if (action === "dismiss") {
    await prisma.report.update({
      where: { id: report.id },
      data: {
        status: "DISMISSED",
        resolution: note ?? "Desestimado por un administrador",
        resolvedBy: admin.id,
        resolvedAt: now,
      },
    });
    return NextResponse.json({ ok: true, action });
  }

  const moderationStatus = action === "hide" ? "UNDER_REVIEW" : "REMOVED";
  const resolutionText =
    note ??
    (action === "hide"
      ? "Ocultado: pendiente de revisión"
      : "Retirado por incumplir las normas");

  await prisma.$transaction([
    prisma.prompt.update({
      where: { id: report.promptId },
      data: { moderationStatus, moderationNote: resolutionText },
    }),
    // Se resuelven también los demás reportes pendientes de ESTE prompt: la
    // acción del admin ya los cubre a todos, y si no la cola se llenaría de
    // duplicados del mismo prompt.
    prisma.report.updateMany({
      where: { promptId: report.promptId, status: "PENDING" },
      data: {
        status: "RESOLVED",
        resolution: resolutionText,
        resolvedBy: admin.id,
        resolvedAt: now,
      },
    }),
  ]);

  await notifyUser({
    userId: report.author.id,
    type: action === "hide" ? "PROMPT_UNDER_REVIEW" : "PROMPT_REMOVED",
    title:
      action === "hide"
        ? "Tu prompt está en revisión"
        : `Tu prompt "${report.prompt.title}" fue retirado`,
    message:
      action === "hide"
        ? `Un administrador está revisando "${report.prompt.title}". Mientras tanto no aparece en el catálogo. Motivo: ${resolutionText}`
        : `"${report.prompt.title}" se retiró del catálogo por incumplir las normas. Motivo: ${resolutionText}`,
    link: `/prompt/${report.promptId}`,
  });

  return NextResponse.json({ ok: true, action, moderationStatus });
}
