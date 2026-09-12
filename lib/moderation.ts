// Filtro automático de contenido. Módulo NEUTRAL: no importa prisma, ni
// next-auth, ni nada de servidor, para poder usarlo también desde componentes
// cliente (validación previa antes de enviar el formulario).
//
// Es una primera barrera determinista, no un moderador completo: pilla el
// contenido dañino evidente sin coste ni latencia. Las barreras siguientes son
// el clasificador de DeepSeek (lib/moderation-server.ts), el system prompt
// restrictivo de DeepSeek (lib/deepseek.ts) y el reporte manual con revisión
// humana (/admin/reports).

export type ModerationCategory =
  | "violence"
  | "hate"
  | "sexual"
  | "self_harm"
  | "drugs_weapons"
  | "malware"
  | "fraud"
  | "profanity";

export interface ModerationResult {
  ok: boolean;
  /** Mensaje genérico para el usuario. No revela el término detectado. */
  reason?: string;
  category?: ModerationCategory;
  /** Término que disparó la detección. Solo para logs internos. */
  matchedTerm?: string;
}

/** Mensaje que ve el usuario para cada categoría. */
export const MESSAGES: Record<ModerationCategory, string> = {
  violence: "No podemos procesar contenido que promueva violencia.",
  hate: "No permitimos contenido de odio o discriminación.",
  sexual: "No permitimos contenido sexual explícito.",
  self_harm:
    "Si necesitas ayuda, contacta una línea de crisis. No procesamos este contenido.",
  drugs_weapons: "No permitimos contenido sobre drogas o armas.",
  malware: "No permitimos contenido sobre hacking malicioso.",
  fraud: "No permitimos contenido sobre estafas o fraudes.",
  profanity: "Evita el lenguaje ofensivo.",
};

// Términos por categoría, en ES / EN / PT.
//
// NOTA sobre `sexual`: la lista es deliberadamente corta y NO incluye
// vocabulario gráfico ni términos de CSAM. Marcar esa casuística con precisión
// requiere una lista externa o un servicio de moderación dedicado; aquí solo se
// cubren las señales de intención más evidentes. Los aciertos se revisan a mano
// en /admin/reports.
const TERMS: Record<ModerationCategory, string[]> = {
  violence: [
    // ES
    "matar", "asesinar", "asesinato", "masacre", "bomba", "bombas",
    "explosivo", "terrorista", "terrorismo", "secuestrar", "secuestro",
    "torturar", "tortura", "degollar", "apuñalar",
    // EN
    "kill", "murder", "massacre", "bomb", "explosive", "terrorist",
    "terrorism", "kidnap", "torture", "behead", "stab",
    // PT
    "assassinar", "massacre", "explosivo", "terrorista", "sequestrar",
    "torturar", "esfaquear",
  ],
  hate: [
    // Insultos y consignas supremacistas (ES / EN / PT)
    "supremacia blanca", "white supremacy", "supremacia branca",
    "supremacista blanco", "white supremacist",
    "neonazi", "neonazista", "neonazi",
    "limpieza etnica", "ethnic cleansing", "limpeza etnica",
    "antisemita", "antisemitic", "antissemita",
    "islamofobo", "islamophobic", "islamofobico",
    "homofobo", "homophobic", "homofobico",
    "transfobo", "transphobic", "transfobico",
    "muerte a los", "death to all",
  ],
  sexual: [
    // Señales de intención sin vocabulario gráfico (ver NOTA arriba).
    "csam", "pornografia infantil", "child porn", "child sexual",
    "underage", "menor de edad", "loli", "pornografia explicita",
    "explicit sexual", "sexualmente explicito",
  ],
  self_harm: [
    // ES
    "suicidio", "suicidarse", "suicida", "autolesion", "cortarse",
    "quitarme la vida", "acabar con mi vida",
    // EN
    "suicide", "self harm", "selfharm", "kill myself", "end my life",
    // PT
    "suicidio", "auto mutilacao", "automutilacao", "me matar",
  ],
  drugs_weapons: [
    // ES
    "cocaina", "metanfetamina", "heroina", "fentanilo", "droga",
    "pistola casera", "arma casera", "fusil", "municiones",
    // EN
    "cocaine", "methamphetamine", "meth", "heroin", "fentanyl",
    "ghost gun", "home made gun", "ammunition", "ak 47", "ak47",
    // PT
    "metanfetamina", "heroina", "fentanilo", "droga",
    "arma caseira", "municoes",
  ],
  malware: [
    // ES / EN / PT comparten casi todos los términos técnicos
    "keylogger", "ransomware", "phishing", "troyano", "malware",
    "ddos", "botnet", "rootkit", "sql injection", "inyeccion sql",
    "robar contrasenas", "steal passwords", "crackear contrasenas",
    "explotar vulnerabilidad", "exploit vulnerabilit",
  ],
  // VACÍA A PROPÓSITO: el fraude lo caza solo el clasificador (capa 2).
  //
  // "Estafa" y "fraude" no son actos como "matar" o "bomba": son el vocabulario
  // de la prevención, así que no codifican intención. Medido con estos términos
  // puestos, la capa 1 bloqueaba "cómo proteger a mis padres de las estafas
  // telefónicas", "escribe un artículo sobre cómo detectar fraudes financieros"
  // y "analiza este correo para saber si es un scam". La lista local no distingue
  // "cómo estafar" de "cómo protegerse de estafas"; el clasificador sí, y ese
  // caso está verificado que devuelve `deepseek:fraud`.
  //
  // Descartados además "golpe" (corriente en español: "un golpe de suerte",
  // "golpe de estado") y "timo" (dentro de "timonel"/"Timo"), mismo criterio por
  // el que no se incluye "con" en inglés.
  //
  // Si algún día se añaden términos aquí, recordar que el matcher aplica \w{0,4}
  // al final: "estafa" ya cubriría "estafador" y "fraud" cubriría "fraude".
  fraud: [],
  profanity: [
    "hijo de puta", "hijueputa", "puta madre", "malparido",
    "fuck you", "motherfucker", "piece of shit",
    "filho da puta", "caralho",
  ],
};

interface CompiledEntry {
  category: ModerationCategory;
  term: string;
  regex: RegExp;
}

/**
 * Quita las marcas diacríticas combinantes (U+0300–U+036F) que deja
 * normalize("NFD"). Se hace con charCodeAt en vez de un rango literal en el
 * regex para no depender de caracteres invisibles en el código fuente.
 */
function stripAccents(text: string): string {
  return Array.from(text.normalize("NFD"))
    .filter((c) => {
      const code = c.charCodeAt(0);
      return code < 0x0300 || code > 0x036f;
    })
    .join("");
}

/**
 * Normaliza el texto para comparar: minúsculas, sin acentos y con la puntuación
 * convertida en espacios.
 *
 * LIMITACIÓN CONOCIDA: la sustitución es por espacio, no por vacío, así que
 * atajar la evasión separando cada letra ("m-a-t-a-r") daría "m a t a r" y NO
 * matchea. Colapsar la puntuación en su lugar rompería los límites de palabra
 * y generaría falsos positivos graves ("skill" contiene "kill"). Esa evasión
 * queda cubierta por las otras dos capas: el system prompt de DeepSeek y el
 * reporte manual en /admin/reports.
 */
function normalize(text: string): string {
  return stripAccents(text.toLowerCase())
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Se compila una sola vez al cargar el módulo.
// `\w{0,4}` tolera terminaciones cortas (kill → kills/killed/killing,
// matar → matarlo/matando) sin abrir la puerta a falsos positivos largos
// (bomb NO matchea "bombastic", que son 5 caracteres de más).
const COMPILED: CompiledEntry[] = Object.entries(TERMS).flatMap(
  ([category, terms]) =>
    terms.map((term) => ({
      category: category as ModerationCategory,
      term,
      regex: new RegExp(`\\b${escapeRegex(term)}\\w{0,4}\\b`),
    }))
);

/**
 * Filtro local. Devuelve el primer término problemático encontrado.
 * Pensado para texto corto (título, descripción, contenido de un prompt).
 */
export function moderateText(text: string): ModerationResult {
  if (!text?.trim()) return { ok: true };

  const normalized = normalize(text);
  if (!normalized) return { ok: true };

  for (const entry of COMPILED) {
    if (entry.regex.test(normalized)) {
      return {
        ok: false,
        reason: MESSAGES[entry.category],
        category: entry.category,
        matchedTerm: entry.term,
      };
    }
  }

  return { ok: true };
}

/** ¿La respuesta del modelo es un rechazo explícito? */
export function isModelRefusal(text: string): boolean {
  return /^\s*RECHAZADO\s*:/i.test(text);
}

/** Extrae el motivo de una respuesta "RECHAZADO: <categoría> — <motivo>". */
export function parseModelRefusal(text: string): {
  category: string;
  detail: string;
} {
  const body = text.replace(/^\s*RECHAZADO\s*:\s*/i, "").trim();
  const [category, ...rest] = body.split(/[—–-]/);
  return {
    category: (category ?? "").trim() || "contenido no permitido",
    detail: rest.join(" ").trim(),
  };
}

/** Mensaje para el usuario cuando el modelo rechaza la petición. */
export function refusalMessage(text: string): string {
  const { category, detail } = parseModelRefusal(text);
  return detail
    ? `No podemos procesar esta petición (${category}): ${detail}`
    : `No podemos procesar esta petición (${category}).`;
}
