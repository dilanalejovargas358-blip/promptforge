import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./types";

/**
 * Idioma activo, leído de la cookie. SOLO Server Components.
 *
 * OJO: llamar a `cookies()` marca como DINÁMICA la ruta que lo ejecuta. Por eso
 * este módulo no puede importarse desde `app/layout.tsx`, `Navbar.tsx` ni
 * `Footer.tsx`: esas piezas están en el árbol del layout raíz de TODAS las
 * rutas, y llamarlo desde ahí convertiría "/" y "/explore" en dinámicas (son ISR
 * con `revalidate = 30`) sin dar ningún error de compilación.
 *
 * Se comprueba en la tabla de rutas de `next build`: "/" y "/explore" deben
 * seguir saliendo como `○`, no como `ƒ`.
 *
 * En Next 14.2 `cookies()` es síncrono; en Next 15 pasa a `await cookies()`.
 */
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
