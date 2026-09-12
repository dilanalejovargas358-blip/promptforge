import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/credits";

export const dynamic = "force-dynamic";

// Estado de la última solicitud del usuario. Lo sondea la pantalla de espera de
// /profile/premium-manual cada 10 s para detectar la aprobación sin recargar.
// Solo se expone lo que esa pantalla necesita: ni userId ni resolvedBy salen de aquí.
export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const request = await prisma.premiumRequest.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      status: true,
      rejectionReason: true,
      resolvedAt: true,
      createdAt: true,
    },
  });

  if (!request) {
    return NextResponse.json({ status: "NONE" });
  }

  return NextResponse.json({
    status: request.status,
    rejectionReason: request.rejectionReason ?? undefined,
    resolvedAt: request.resolvedAt,
    createdAt: request.createdAt,
  });
}
