// Tipos y constantes del sistema de idioma de las páginas legales.
//
// Igual que `lib/constants.ts`, este módulo NO tiene dependencias de servidor a
// propósito: lo importan tanto el hook de cliente (`use-locale.ts`, que a su vez
// usa `LanguageToggle.tsx`) como el servidor (`locale-server.ts` y los módulos de
// contenido). Si `next/headers` entrara aquí, el bundle del cliente rompería el
// build con "You're importing a component that needs next/headers".

export type Locale = "es" | "en";

/** Cookie que guarda el idioma elegido. Sin ella se usa DEFAULT_LOCALE. */
export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE: Locale = "es";
export const LOCALES: readonly Locale[] = ["es", "en"];

export function isLocale(value: unknown): value is Locale {
  return value === "es" || value === "en";
}

// --- Datos fijos del operador ------------------------------------------------

/** Email de contacto de las páginas legales. */
export const SUPPORT_EMAIL = "soportepf@zohomail.com";
export const OPERATOR_NAME = "Dilan Alejo Vargas";

/** Última revisión de los textos legales (ISO). Editar al cambiarlos. */
export const LEGAL_UPDATED_AT = "2026-09-14";

// --- Estructura de los documentos --------------------------------------------

/** Valores que no viven en el código sino en la BD (ver `lib/config.ts`). */
export interface LegalContext {
  priceUsd: number;
  priceBob: number;
}

export type Block =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

export interface Section {
  /** Ancla y key de React. kebab-case, sin acentos. */
  id: string;
  heading: string;
  /** 2 = H2 (por defecto), 3 = H3. El H1 lo pone el renderizador. */
  level?: 2 | 3;
  blocks: Block[];
}

export interface Doc {
  /** `<title>` de la pestaña y `<h1>` de la página. */
  title: string;
  /** `<meta description>` y entradilla bajo el H1. */
  subtitle: string;
  /** Aviso destacado opcional, encima del índice. */
  notice?: string;
  sections: Section[];
}

export type LegalDocPair = Record<Locale, Doc>;
