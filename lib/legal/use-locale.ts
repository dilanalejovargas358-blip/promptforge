"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./types";

/** Avisa al resto de componentes cliente de que el idioma ha cambiado. */
const LOCALE_EVENT = "ppf:locale-change";

function readCookie(): Locale {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`)
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Idioma activo en el cliente.
 *
 * El estado arranca SIEMPRE en DEFAULT_LOCALE y se corrige en un efecto: así el
 * primer render del cliente coincide con el del servidor y no hay desajuste de
 * hidratación. `mounted` permite saber si el valor ya es el real.
 */
export function useLocale() {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocaleState(readCookie());
    setMounted(true);

    // Si el toggle cambia el idioma, cualquier otro componente que use el hook
    // se entera. Sin esto, un componente ya montado se quedaría con el valor
    // viejo: `router.refresh()` re-renderiza el servidor, no el estado cliente.
    const sync = () => setLocaleState(readCookie());
    window.addEventListener(LOCALE_EVENT, sync);
    return () => window.removeEventListener(LOCALE_EVENT, sync);
  }, []);

  // <html lang> correcto sin tocar el layout raíz (que debe seguir estático).
  useEffect(() => {
    if (mounted) document.documentElement.lang = locale;
  }, [mounted, locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === readCookie()) return;

      // La cookie va PRIMERO: tiene que existir antes del fetch RSC que dispara
      // router.refresh(), o el servidor devolvería la página en el idioma viejo.
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;

      setLocaleState(next);
      window.dispatchEvent(new Event(LOCALE_EVENT));
      startTransition(() => router.refresh());
    },
    [router]
  );

  return { locale, mounted, isPending, setLocale };
}
