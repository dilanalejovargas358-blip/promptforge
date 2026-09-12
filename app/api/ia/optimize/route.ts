import { NextResponse } from "next/server";
import { optimizePrompt } from "@/lib/deepseek";
import {
  canSpendIA,
  getDbUser,
  IA_COST,
  refundIA,
  spendIA,
} from "@/lib/credits";
import { isModelRefusal, refusalMessage } from "@/lib/moderation";
import { moderateTextDeep } from "@/lib/moderation-server";

export const dynamic = "force-dynamic";

// Extrae el contenido entre dos marcadores estilo "---NOMBRE---".
function sectionBetween(raw: string, start: string, end: string): string {
  const startRe = new RegExp(`---\\s*${start}\\s*---`, "i");
  const matchStart = raw.match(startRe);
  if (!matchStart || matchStart.index === undefined) return "";
  const from = matchStart.index + matchStart[0].length;

  if (end) {
    const endRe = new RegExp(`---\\s*${end}\\s*---`, "i");
    const matchEnd = raw.slice(from).match(endRe);
    if (matchEnd && matchEnd.index !== undefined) {
      return raw.slice(from, from + matchEnd.index);
    }
  }

  return raw.slice(from);
}

function extractScore(text: string, before = true): number | null {
  const re = before
    ? /antes[^0-9]{0,24}?(\d{1,3})/i
    : /despu[eé]s[^0-9]{0,24}?(\d{1,3})/i;
  const m = text.match(re);
  return m ? parseInt(m[1], 10) : null;
}

// Llama a Gemini en el servidor y devuelve el resultado ya estructurado.
export async function POST(req: Request) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para optimizar prompts." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const prompt: unknown = body?.prompt;
    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Escribe un prompt para optimizar." },
        { status: 400 }
      );
    }

    // Moderación en dos capas ANTES de cobrar: si no pasa, no se gasta crédito.
    const mod = await moderateTextDeep(prompt);
    if (!mod.ok) {
      console.warn(
        `Moderación: optimización rechazada (${mod.category ?? "?"} · ${mod.matchedTerm ?? "?"}) por ${user.email}`
      );
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
      "Optimización de prompt con IA"
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

    const raw = await optimizePrompt(prompt.trim());

    // Segunda barrera: la IA rechazó pese a pasar el filtro local. Se devuelve
    // el crédito, porque el usuario no recibe nada a cambio.
    if (isModelRefusal(raw)) {
      await refundIA(
        user.id,
        IA_COST,
        "Reembolso: optimización rechazada por la IA"
      );
      return NextResponse.json(
        { error: refusalMessage(raw), code: "MODERATION_REJECTED" },
        { status: 400 }
      );
    }

    // Si el modelo no respetó los marcadores, devolvemos el texto crudo.
    const hasMarkers = /---\s*PROMPT_MEJORADO\s*---/i.test(raw);

    const optimizedPrompt = hasMarkers
      ? sectionBetween(raw, "PROMPT_MEJORADO", "MEJORAS").trim()
      : raw.trim();

    const mejorasRaw = hasMarkers
      ? sectionBetween(raw, "MEJORAS", "PUNTUACION")
      : "";
    const improvements = mejorasRaw
      .split("\n")
      .map((l) => l.replace(/^[-*•\s]*(\d+[.)])?\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 8);

    const scoresRaw = hasMarkers ? sectionBetween(raw, "PUNTUACION", "") : "";
    const scoreBefore = extractScore(scoresRaw, true);
    const scoreAfter = extractScore(scoresRaw, false);

    return NextResponse.json({
      ok: true,
      optimizedPrompt: optimizedPrompt || raw.trim(),
      improvements,
      scoreBefore,
      scoreAfter,
    });
  } catch (error) {
    console.error("IA /optimize error:", error);
    return NextResponse.json(
      { error: "Hubo un error al optimizar. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
