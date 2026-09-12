import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser, isPremiumActive } from "@/lib/credits";

export const dynamic = "force-dynamic";

// Registra la intención de pago del usuario. NO activa nada: la cola se revisa a
// mano en /admin/premium, porque el pago por YOLO Pago llega por correo.
export async function POST() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  if (isPremiumActive(user)) {
    return NextResponse.json({ error: "Ya eres Premium." }, { status: 400 });
  }

  // Idempotente: si ya hay una solicitud en la cola se devuelve esa misma, para
  // que pulsar dos veces el botón no llene la cola de duplicados.
  const existing = await prisma.premiumRequest.findFirst({
    where: { userId: user.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return NextResponse.json({ ok: true, request: existing, alreadyPending: true });
  }

  const request = await prisma.premiumRequest.create({
    data: { userId: user.id, status: "PENDING" },
  });

  return NextResponse.json({ ok: true, request }, { status: 201 });
}
