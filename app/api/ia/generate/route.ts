import { NextResponse } from "next/server";
import { generatePrompt } from "@/lib/deepseek";
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

export async function POST(req: Request) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para generar prompts." },
        { status: 401 }
      );
    }

    const { description } = await req.json();

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "La descripción es obligatoria" },
        { status: 400 }
      );
    }

    // Moderación en dos capas ANTES de cobrar: si no pasa, no se gasta crédito.
    const mod = await moderateTextDeep(description);
    if (!mod.ok) {
      console.warn(
        `Moderación: generación rechazada (${mod.category ?? "?"} · ${mod.matchedTerm ?? "?"}) por ${user.email}`
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
      "Generación de prompt con IA"
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

    console.log("📝 Generando prompt para:", description);
    const result = await generatePrompt(description);
    console.log("📥 Respuesta completa:", result);

    // Segunda barrera: la IA rechazó pese a pasar el filtro local. Se devuelve
    // el crédito, porque el usuario no recibe nada a cambio.
    if (isModelRefusal(result)) {
      await refundIA(
        user.id,
        IA_COST,
        "Reembolso: generación rechazada por la IA"
      );
      return NextResponse.json(
        { error: refusalMessage(result), code: "MODERATION_REJECTED" },
        { status: 400 }
      );
    }

    // Intentar parsear con diferentes formatos
    let prompt = result;
    let summary = "Prompt generado con éxito.";

    // Buscar marcadores
    if (result.includes("---PROMPT---") && result.includes("---RESUMEN---")) {
      const parts = result.split("---");
      // Buscar el índice correcto
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].trim() === "PROMPT") {
          prompt = parts[i + 1]?.trim() || prompt;
        }
        if (parts[i].trim() === "RESUMEN") {
          summary = parts[i + 1]?.trim() || summary;
        }
      }
    } else if (result.includes("```")) {
      // Si está en formato código
      const codeMatch = result.match(/```[\s\S]*?```/);
      if (codeMatch) {
        prompt = codeMatch[0].replace(/```/g, "").trim();
      }
      // Buscar resumen después del código
      const summaryMatch = result.match(/resumen:?\s*([\s\S]*?)$/i);
      if (summaryMatch) {
        summary = summaryMatch[1].trim();
      }
    } else {
      // Si no hay marcadores, usar todo como prompt
      prompt = result;
      // Intentar extraer resumen de la última parte
      const lines = result.split("\n");
      if (lines.length > 3) {
        const lastLines = lines.slice(-3).join("\n");
        if (lastLines.length < 200) {
          summary = lastLines;
        }
      }
    }

    console.log("✅ Prompt extraído:", prompt.substring(0, 100) + "...");
    console.log("✅ Resumen extraído:", summary);

    return NextResponse.json({
      prompt: prompt,
      summary: summary,
    });
  } catch (error) {
    console.error("Error generando prompt:", error);
    return NextResponse.json(
      { error: "Error al generar el prompt" },
      { status: 500 }
    );
  }
}