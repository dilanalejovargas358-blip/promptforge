import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/credits";

export const dynamic = "force-dynamic";

interface Ctx {
  params: { id: string };
}

// Marca una notificación como leída. El `userId` va en el WHERE para que nadie
// pueda marcar como leídas las notificaciones de otro usuario.
export async function PATCH(_req: Request, ctx: Ctx) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const updated = await prisma.notification.updateMany({
    where: { id: ctx.params.id, userId: user.id },
    data: { read: true },
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Notificación no encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
