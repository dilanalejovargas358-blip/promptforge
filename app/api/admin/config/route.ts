import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/credits";
import { getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    usdToBobRate: z.number().positive().max(1000).optional(),
    premiumPriceUsd: z.number().positive().max(1000).optional(),
    // Ni http:// ni esquemas raros: o una ruta local de /public o https.
    qrImageUrl: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), {
        message: "Debe ser una ruta local o una URL https.",
      })
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "No hay nada que actualizar.",
  });

/** Respuesta de error si quien llama no es admin; null si lo es. */
async function denyNonAdmin(): Promise<NextResponse | null> {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo un administrador puede cambiar la configuración." },
      { status: 403 }
    );
  }
  return null;
}

export async function GET() {
  const denied = await denyNonAdmin();
  if (denied) return denied;
  return NextResponse.json(await getConfig());
}

export async function PATCH(req: Request) {
  const denied = await denyNonAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos." },
      { status: 400 }
    );
  }

  // Upsert y no update: si alguien borró la fila, el PATCH la recrea en vez de
  // fallar con P2025.
  const updated = await prisma.config.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: parsed.data,
  });

  return NextResponse.json({
    usdToBobRate: updated.usdToBobRate,
    premiumPriceUsd: updated.premiumPriceUsd,
    qrImageUrl: updated.qrImageUrl,
  });
}
