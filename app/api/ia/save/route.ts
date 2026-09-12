import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/credits";

export const dynamic = "force-dynamic";

// Guarda un prompt optimizado en la biblioteca del usuario logueado.
export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para guardar prompts." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const originalPrompt = typeof body?.originalPrompt === "string" ? body.originalPrompt : "";
    const optimizedPrompt = typeof body?.optimizedPrompt === "string" ? body.optimizedPrompt : "";

    if (!originalPrompt.trim() || !optimizedPrompt.trim()) {
      return NextResponse.json(
        { error: "Faltan datos para guardar." },
        { status: 400 }
      );
    }

    const improvements = Array.isArray(body?.improvements)
      ? body.improvements.filter((i: unknown): i is string => typeof i === "string")
      : [];
    const scoreBefore = typeof body?.scoreBefore === "number" ? body.scoreBefore : null;
    const scoreAfter = typeof body?.scoreAfter === "number" ? body.scoreAfter : null;

    const saved = await prisma.savedOptimization.create({
      data: {
        userId: user.id,
        originalPrompt,
        optimizedPrompt,
        improvements: JSON.stringify(improvements),
        scoreBefore,
        scoreAfter,
      },
    });

    return NextResponse.json({ ok: true, id: saved.id });
  } catch (error) {
    console.error("IA /save error:", error);
    return NextResponse.json(
      { error: "Hubo un error al guardar." },
      { status: 500 }
    );
  }
}
