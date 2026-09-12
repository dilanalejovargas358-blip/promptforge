import { NextResponse } from "next/server";
import { analyzePrompt } from "@/lib/deepseek";
import {
  canSpendIA,
  getDbUser,
  IA_COST,
  refundIA,
  spendIA,
} from "@/lib/credits";
import { refusalMessage } from "@/lib/moderation";
import { moderateTextDeep } from "@/lib/moderation-server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para analizar prompts." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const prompt: unknown = body?.prompt;
    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Escribe un prompt para analizar." },
        { status: 400 }
      );
    }

    // Moderación en dos capas ANTES de cobrar: si no pasa, no se gasta crédito.
    const mod = await moderateTextDeep(prompt);
    if (!mod.ok) {
      return NextResponse.json(
        { error: mod.reason, code: "MODERATION_REJECTED" },
        { status: 400 }
      );
    }

    if (!(await canSpendIA(user, IA_COST))) {
      return NextResponse.json(
        {
          error:
            "Te quedaste sin créditos IA. Suscríbete por $1.99 y obtén 25 más.",
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    // Descuento atómico: si otra petición se adelantó, no se cobra dos veces.
    const charged = await spendIA(
      user.id,
      IA_COST,
      "Análisis de prompt con IA"
    );
    if (!charged) {
      return NextResponse.json(
        {
          error:
            "Te quedaste sin créditos IA. Suscríbete por $1.99 y obtén 25 más.",
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    const outcome = await analyzePrompt(prompt.trim());

    // Segunda barrera: la IA rechazó pese a pasar el filtro local. Se devuelve
    // el crédito, porque el usuario no recibe nada a cambio.
    if (outcome.refused) {
      await refundIA(user.id, IA_COST, "Reembolso: análisis rechazado por la IA");
      return NextResponse.json(
        { error: refusalMessage(outcome.raw), code: "MODERATION_REJECTED" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, ...outcome.analysis });
  } catch (error) {
    console.error("IA /analyze error:", error);
    return NextResponse.json(
      { error: "Hubo un error al analizar el prompt. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
