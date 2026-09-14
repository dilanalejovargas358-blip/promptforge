"use client";

import { useLocale } from "@/lib/legal/use-locale";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/legal/types";

const LABELS: Record<Locale, string> = { es: "ES", en: "EN" };

/**
 * Selector de idioma. Solo se monta en las 5 páginas legales, que son las
 * únicas bilingües: en el resto del sitio no tendría ningún efecto.
 *
 * Escribe la cookie `locale` y pide un `router.refresh()` para que el servidor
 * vuelva a renderizar la página en el idioma nuevo.
 */
export default function LanguageToggle() {
  const { locale, mounted, isPending, setLocale } = useLocale();

  // Antes de montar se muestra el idioma por defecto, que es también lo que
  // renderizó el servidor: así no hay desajuste de hidratación.
  const active = mounted ? locale : DEFAULT_LOCALE;

  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className={`inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/5 p-0.5 transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          aria-pressed={active === option}
          className={
            active === option
              ? "rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white"
              : "rounded-full px-2.5 py-1 text-xs font-bold text-muted transition-colors hover:text-white"
          }
        >
          {LABELS[option]}
        </button>
      ))}
    </div>
  );
}
