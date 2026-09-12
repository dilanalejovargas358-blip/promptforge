// Segunda barrera de moderación: DeepSeek clasifica el texto (deepseek-chat).
//
// Este módulo es SOLO de servidor: lee DEEPSEEK_API_KEY. La contraparte neutral
// (importable desde componentes cliente) es lib/moderation.ts, que expone los
// tipos y el filtro local de términos.
//
// Se llama siempre a través de `moderateTextDeep`, que encadena las dos capas:
// primero la lista local —gratis y sin latencia— y solo si esa pasa se consulta
// la API. Así el contenido obvio no gasta una petición de red.

import {
  MESSAGES,
  moderateText,
  type ModerationCategory,
  type ModerationResult,
} from "@/lib/moderation";

// Mismos valores que lib/deepseek.ts, para no depender de dos configuraciones.
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

/**
 * Tiempo máximo que esperamos a DeepSeek antes de seguir sin su veredicto.
 *
 * 8 s y no menos: medido contra la API real, una clasificación tarda 0,9-2,8 s,
 * así que con 3 s el margen era de 157 ms y ~1 de cada 5 peticiones abortaba y
 * dejaba pasar el contenido sin moderar (fail-open). El coste de subirlo es solo
 * latencia al publicar, y solo cuando DeepSeek va lento.
 */
const TIMEOUT_MS = 8000;

/**
 * Categorías que el modelo puede devolver → nuestras ModerationCategory.
 *
 * Las seis del prompt coinciden con nuestras categorías de nombre, así que el
 * mapeo es la identidad; existe igualmente para (a) descartar cualquier cosa que
 * el modelo se invente y (b) dejar el contrato explícito si el prompt cambia.
 * `profanity` no se pide al modelo: la cubre la lista local, que es más fiable
 * para insultos concretos que un clasificador.
 */
const CATEGORY_MAP: Record<string, ModerationCategory> = {
  violence: "violence",
  hate: "hate",
  sexual: "sexual",
  self_harm: "self_harm",
  drugs_weapons: "drugs_weapons",
  malware: "malware",
};

const CLASSIFIER_SYSTEM_PROMPT = `Eres un clasificador de contenido. Analiza el siguiente texto y responde SOLO con un JSON:
{ "safe": true/false, "category": "violence|hate|sexual|self_harm|drugs_weapons|malware|null", "reason": "breve motivo" }

Categorías a detectar:
- violence: violencia explícita, guerra, tortura, asesinato
- hate: odio, discriminación, acoso
- sexual: contenido sexual explícito
- self_harm: autolesión, suicidio
- drugs_weapons: drogas, armas, explosivos
- malware: hacking malicioso, phishing

Responde solo el JSON, sin explicaciones.`;

interface DeepSeekChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

interface ClassifierVerdict {
  safe?: unknown;
  category?: unknown;
}

/**
 * Normaliza `safe`, que el modelo puede devolver como booleano o como cadena.
 * Solo un `false` explícito cuenta como inseguro: cualquier otra cosa (campo
 * ausente, tipo raro, JSON inesperado) no confirma peligro y deja pasar.
 */
function isExplicitlyUnsafe(value: unknown): boolean {
  if (value === false) return true;
  return typeof value === "string" && value.trim().toLowerCase() === "false";
}

/**
 * Extrae el JSON de la respuesta del modelo, que a veces lo envuelve en un
 * bloque ```json ... ``` o le añade texto alrededor.
 */
function parseVerdict(content: string): ClassifierVerdict | null {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    const data = JSON.parse(candidate.slice(start, end + 1));
    return typeof data === "object" && data !== null ? data : null;
  } catch {
    return null;
  }
}

/**
 * Doble barrera: filtro local y, si ese pasa, clasificación con DeepSeek.
 *
 * FAIL-OPEN a propósito. Si falta la clave, la API responde con error, se agota
 * el timeout o la respuesta no se puede parsear, se devuelve `ok: true` y se
 * deja pasar el contenido: un fallo de DeepSeek no debe impedir que un usuario
 * legítimo publique. Quedan por debajo el system prompt de DeepSeek y el reporte
 * manual con revisión humana.
 *
 * El resultado se marca en `matchedTerm` como "deepseek:<categoría>" para que el
 * log del llamante distinga un rechazo del clasificador de uno de la lista local.
 */
export async function moderateTextDeep(
  text: string
): Promise<ModerationResult> {
  const local = moderateText(text);
  if (!local.ok) return local;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn(
      "Moderación: falta DEEPSEEK_API_KEY, se omite la segunda barrera."
    );
    return { ok: true };
  }

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: CLASSIFIER_SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        // Clasificación: nada de creatividad y respuesta corta para no acercarse
        // al timeout.
        temperature: 0,
        max_tokens: 120,
        stream: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(
        `Moderación: DeepSeek respondió ${res.status}, se omite la segunda barrera.`
      );
      return { ok: true };
    }

    const data = (await res.json()) as DeepSeekChatResponse;
    const content = data.choices?.[0]?.message?.content ?? "";

    const verdict = parseVerdict(content);
    // Respuesta ilegible (prosa, JSON roto, vacío): no confirma peligro.
    if (!verdict || !isExplicitlyUnsafe(verdict.safe)) return { ok: true };

    const raw = typeof verdict.category === "string" ? verdict.category : "";
    const category = CATEGORY_MAP[raw.trim().toLowerCase()];

    // Marcado como inseguro pero sin categoría reconocible: se rechaza igual,
    // con un mensaje genérico, en vez de elegir uno al azar.
    if (!category) {
      return {
        ok: false,
        reason: "No podemos procesar este contenido.",
        matchedTerm: "deepseek:desconocida",
      };
    }

    return {
      ok: false,
      reason: MESSAGES[category],
      category,
      matchedTerm: `deepseek:${category}`,
    };
  } catch (error) {
    // Timeout (AbortSignal) o fallo de red. Fail-open, ver arriba.
    console.error(
      "Moderación: fallo al consultar DeepSeek, se omite la segunda barrera.",
      error
    );
    return { ok: true };
  }
}
