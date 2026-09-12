import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/credits";
import { notifyUser } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const CREDITS = 25;

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("reject"),
    reason: z.string().trim().min(5).max(500),
  }),
]);

interface Ctx {
  params: { id: string };
}

export async function PATCH(req: Request, ctx: Ctx) {
  const admin = await getDbUser();
  if (!admin) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }
  if (admin.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo un administrador puede resolver solicitudes." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  const request = await prisma.premiumRequest.findUnique({
    where: { id: ctx.params.id },
    select: { id: true, userId: true, status: true },
  });
  if (!request) {
    return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
  }

  const now = new Date();

  if (parsed.data.action === "reject") {
    const reason = parsed.data.reason;

    // El WHERE exige PENDING: si otro admin se adelantó, no se pisa su decisión.
    const claimed = await prisma.premiumRequest.updateMany({
      where: { id: request.id, status: "PENDING" },
      data: {
        status: "REJECTED",
        resolvedAt: now,
        resolvedBy: admin.id,
        rejectionReason: reason,
      },
    });
    if (claimed.count === 0) {
      return NextResponse.json(
        { error: "Esta solicitud ya fue resuelta." },
        { status: 409 }
      );
    }

    await notifyUser({
      userId: request.userId,
      type: "PREMIUM_REJECTED",
      title: "Tu solicitud de Premium fue rechazada",
      message: `No pudimos activar tu Premium. Motivo: ${reason}`,
      link: "/profile/premium-manual",
    });

    return NextResponse.json({ ok: true, action: "reject" });
  }

  // Aprobar. Todo en una transacción: si se acreditasen los créditos sin marcar
  // la solicitud, un segundo clic los daría otra vez. Mismo blindaje que el
  // webhook de Stripe, que ya se cuidaba de no acreditar dos veces.
  //
  // +30 días y no setMonth(+1): sumar un mes a una fecha como el 31 de enero
  // desborda al 3 de marzo, porque Date solo avanza el mes y deja el día.
  const premiumUntil = new Date();
  premiumUntil.setDate(premiumUntil.getDate() + 30);

  const resolved = await prisma.$transaction(async (tx) => {
    const claimed = await tx.premiumRequest.updateMany({
      where: { id: request.id, status: "PENDING" },
      data: { status: "APPROVED", resolvedAt: now, resolvedBy: admin.id },
    });
    if (claimed.count === 0) return false;

    await tx.user.update({
      where: { id: request.userId },
      data: { isPremium: true, premiumUntil, credits: { increment: CREDITS } },
    });

    await tx.transaction.create({
      data: {
        userId: request.userId,
        type: "PREMIUM",
        amount: CREDITS,
        description: "Suscripción Premium — QR Bolivia",
      },
    });

    return true;
  });

  if (!resolved) {
    return NextResponse.json(
      { error: "Esta solicitud ya fue resuelta." },
      { status: 409 }
    );
  }

  // Fuera de la transacción a propósito: notifyUser usa el cliente global, y con
  // connection_limit=1 meterlo dentro del $transaction lo dejaría esperando la
  // única conexión del pool.
  await notifyUser({
    userId: request.userId,
    type: "PREMIUM_APPROVED",
    title: "Tu Premium está activo",
    message: "Tu Premium está activo. ¡Disfruta los 25 créditos IA!",
    link: "/profile",
  });

  return NextResponse.json({ ok: true, action: "approve" });
}
