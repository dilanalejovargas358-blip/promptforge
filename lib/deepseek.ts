import OpenAI from "openai";
import { isModelRefusal } from "@/lib/moderation";

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

// Segunda barrera de moderación (la primera es el filtro local de
// lib/moderation.ts). Va en los TRES system prompts: el modelo se niega a
// trabajar con contenido dañino incluso cuando el filtro local no lo pilló.
// El prefijo "RECHAZADO:" es el contrato con las rutas de /api/ia/*.
const SAFETY_BLOCK = `
Eres un asistente de prompts. RECHAZA cualquier petición que involucre:
violencia, contenido sexual, odio o discriminación, autolesión, drogas,
armas, malware o hacking malicioso.

Si detectas contenido dañino, responde EXACTAMENTE con:
"RECHAZADO: <categoría> — <motivo breve>"
No generes el contenido bajo ninguna circunstancia, ni siquiera como ejemplo.`;

export async function callDeepSeek(
  prompt: string,
  systemPrompt?: string
) {
  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat", // DeepSeek-V3
      messages: [
        { role: "system", content: systemPrompt || "Eres un asistente útil." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000, // Suficiente para prompts optimizados
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error en DeepSeek:", error);
    throw error;
  }
}

// Resultado estructurado de un análisis de prompt.
export interface PromptAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const ANALYZE_SYSTEM_PROMPT = `Eres un experto evaluador de prompts para IA.
${SAFETY_BLOCK}

Salvo el caso de rechazo anterior, analiza el prompt que el usuario te pasa y puntúalo de 0 a 100 evaluando cinco criterios:
- Claridad: ¿se entiende qué quiere el usuario?
- Estructura: ¿tiene una organización lógica y ordenada?
- Especificidad: ¿define detalle, tono, público o límites concretos?
- Contexto: ¿aporta la información de fondo necesaria?
- Formato: ¿indica cómo debe ser la respuesta de la IA?

Responde ÚNICAMENTE con un JSON válido —salvo que apliques el rechazo indicado arriba—, sin texto antes ni después, con esta forma exacta:
{"score": 85, "strengths": ["..."], "weaknesses": ["..."], "recommendations": ["..."]}

Reglas:
- score: número entero entre 0 y 100.
- strengths, weaknesses y recommendations: cada uno con 2 a 5 frases breves y accionables en español.
- No inventes marcadores ni añadas comentarios fuera del JSON.`;

// Resultado del análisis: o una evaluación, o el rechazo del modelo.
export type AnalyzeOutcome =
  | { refused: false; analysis: PromptAnalysis }
  | { refused: true; raw: string };

// Analiza un prompt y devuelve la evaluación estructurada.
// Si el modelo rechaza la petición, lo propaga para que la ruta no cobre.
export async function analyzePrompt(rawPrompt: string): Promise<AnalyzeOutcome> {
  const content = await callDeepSeek(rawPrompt, ANALYZE_SYSTEM_PROMPT);

  if (isModelRefusal(content)) return { refused: true, raw: content };

  const parsed = extractAnalysisJson(content);
  if (parsed) return { refused: false, analysis: parsed };

  // Si el modelo no respetó el JSON, caemos a una heurística local básica.
  return {
    refused: false,
    analysis: {
      score: heuristicScore(rawPrompt),
      strengths: [
        "El prompt contiene una intención clara de lo que quieres conseguir.",
        "Tiene una longitud suficiente para dar instrucciones a la IA.",
      ],
      weaknesses: [
        "No pudimos estructurar el análisis con la IA; revisa tu conexión y reintenta.",
      ],
      recommendations: [
        "Prueba de nuevo el análisis si esperabas una respuesta detallada.",
        "Añade contexto, formato de salida y restricciones a tu prompt.",
      ],
    },
  };
}

const OPTIMIZE_SYSTEM_PROMPT = `Eres un experto en ingeniería de prompts.
${SAFETY_BLOCK}

Mejora el prompt que el usuario te pasa manteniendo intacta su intención original.
Responde EXACTAMENTE en este formato, con los marcadores ---NOMBRE---, sin texto fuera de ellos:

---PROMPT_MEJORADO---
(aquí el prompt completo mejorado; encierra entre llaves {} las palabras o frases que añadas o cambies)
---MEJORAS---
- (mejora aplicada 1)
- (mejora aplicada 2)
---PUNTUACION---
Antes: XX/100
Después: YY/100

Reglas:
- PROMPT_MEJORADO: texto íntegro del prompt optimizado, sin comillas envolventes.
- MEJORAS: entre 2 y 6 frases breves explicando qué mejoraste.
- PUNTUACION: dos números enteros de 0 a 100 (la "Después" debe ser mayor que la "Antes").`;

// Mejora un prompt y devuelve la respuesta cruda con marcadores
// (---PROMPT_MEJORADO--- / ---MEJORAS--- / ---PUNTUACION---) para que la ruta los procese.
export async function optimizePrompt(rawPrompt: string): Promise<string> {
  return callDeepSeek(rawPrompt, OPTIMIZE_SYSTEM_PROMPT);
}

const GENERATE_SYSTEM_PROMPT = `Actúa como un experto en ingeniería de prompts.
${SAFETY_BLOCK}

A partir de la descripción que te dé el usuario, genera UN prompt profesional y detallado que incluya:
- Rol que debe adoptar la IA
- Contexto claro
- Instrucciones paso a paso
- Formato de respuesta esperado

Responde EXACTAMENTE en este formato, con los marcadores ---NOMBRE--- en líneas separadas y sin texto fuera de ellos:

---PROMPT---
(aquí el prompt completo listo para usar, sin comillas envolventes)
---RESUMEN---
(una frase breve que resuma el propósito de este prompt)`;

// Genera un prompt profesional a partir de una descripción y devuelve la
// respuesta cruda con marcadores (---PROMPT--- / ---RESUMEN---) para que la ruta los procese.
export async function generatePrompt(description: string): Promise<string> {
  return callDeepSeek(description, GENERATE_SYSTEM_PROMPT);
}

// Extrae y valida el objeto JSON de la respuesta del modelo.
function extractAnalysisJson(text: string): PromptAnalysis | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    const data = JSON.parse(candidate.slice(start, end + 1));
    const score = Number(data.score);
    const strengths = toStringArray(data.strengths);
    const weaknesses = toStringArray(data.weaknesses);
    const recommendations = toStringArray(data.recommendations);
    if (!Number.isFinite(score) || score < 0 || score > 100) return null;
    return { score: Math.round(score), strengths, weaknesses, recommendations };
  } catch {
    return null;
  }
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

// Puntuación heurística de respaldo (0-100) en caso de fallo del modelo.
function heuristicScore(prompt: string): number {
  const text = prompt.trim();
  if (!text) return 0;
  const words = text.split(/\s+/).length;

  let score = 30;
  // Claridad / estructura: más palabras, más detalles aportados (hasta un tope).
  score += Math.min(35, Math.floor(words / 15));
  // Especificidad: pedir formato/salida.
  if (/formato|respuesta|lista|pasos?|ejemplo|salida|output/i.test(text)) score += 10;
  // Contexto: rol o audiencia.
  if (/act[uá]a como|rol|contexto|audiencia|p[uú]blico|para\s+[a-záéíóú]+/i.test(text)) score += 10;
  // Restricciones / límites.
  if (/no\s+uses|evita|sin\s+|m[aá]ximo|l[ií]mite|solo\s+(los|estos)?\s*:/i.test(text)) score += 10;

  return Math.max(0, Math.min(100, score));
}