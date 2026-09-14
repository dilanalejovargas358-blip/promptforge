import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser, isPremiumActive } from "@/lib/credits";

export const dynamic = "force-dynamic";

// Registra la intención de pago del usuario. NO activa nada: la cola se revisa a
// mano en /admin/premium, porque el pago (YOLO Pago o Binance) se confirma fuera
// del sitio.
export async function POST(req: Request) {
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

  // El cuerpo es opcional: el cliente manda `{ method }`, pero si viniera vacío
  // o con un valor inesperado se cae a "yolo", el flujo de siempre.
  const body = await req.json().catch(() => null);
  const method = body?.method === "binance" ? "binance" : "yolo";

  const request = await prisma.premiumRequest.create({
    data: { userId: user.id, status: "PENDING", method },
  });

  return NextResponse.json({ ok: true, request }, { status: 201 });
}
