// Constantes de las dos economías de la app (créditos IA y rayitos).
//
// Vive en un módulo SIN dependencias de servidor a propósito: así pueden
// importarlas tanto los componentes cliente (Navbar, RayCounter, ProfileWallet)
// como los módulos de servidor. En particular `lib/auth.ts` las necesita para
// asignar los saldos de bienvenida, y no puede importarlas de `lib/credits.ts`
// porque ese importa `authOptions` de `lib/auth` → ciclo de imports.
//
// `lib/credits.ts` las re-exporta para no romper los imports existentes.

// --- Créditos IA (herramientas de IA) ---------------------------------------
/** Créditos IA que otorga cada pago de la suscripción Premium. */
export const PREMIUM_MONTHLY_CREDITS = 25;
/** Meses de validez al contratar Premium. */
export const PREMIUM_MONTHS = 1;
/** Coste en créditos IA por uso de cualquier herramienta de IA. */
export const IA_COST = 1;
/** Créditos IA de regalo al crear la cuenta (una sola vez, de por vida). */
export const SIGNUP_CREDITS = 5;

// --- Rayitos (apoyos a prompts) ---------------------------------------------
/** Rayitos máximos acumulables. */
export const RAYS_MAX = 10;
/** Un rayito se regenera cada hora. */
export const RAYS_REGEN_MS = 60 * 60 * 1000;
/** Rayitos de regalo al crear la cuenta. */
export const SIGNUP_RAYS = 1;
