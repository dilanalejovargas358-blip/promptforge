import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/credits";

export const dynamic = "force-dynamic";

// Notificaciones NO leídas del usuario de la sesión.
export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id, read: false },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      link: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, notifications });
}
