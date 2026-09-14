import { cache } from "react";
import { getConfig, totalBob } from "@/lib/config";
import type { LegalContext } from "./types";

/**
 * Precio Premium vigente, leído de la BD.
 *
 * No se hardcodea en los textos legales a propósito: el precio es editable en
 * /admin/config (`lib/config.ts`), así que una cifra fija en los términos
 * acabaría contradiciendo lo que se cobra de verdad.
 *
 * `cache()` deduplica la consulta dentro de la misma petición: `generateMetadata`
 * y la página la piden por separado y sin esto serían dos lecturas a Prisma.
 */
export const getLegalContext = cache(async (): Promise<LegalContext> => {
  const config = await getConfig();
  return {
    priceUsd: config.premiumPriceUsd,
    priceBob: totalBob(config),
  };
});
