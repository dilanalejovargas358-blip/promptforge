import { prisma } from "@/lib/prisma";

const SINGLETON = "singleton";

/** Valores de fábrica. Solo se usan si la fila todavía no existe. */
const DEFAULTS = {
  usdToBobRate: 9.15,
  premiumPriceUsd: 1.99,
  qrImageUrl: "/images/yolo-qr-promptforge.png",
};

export interface PricingConfig {
  usdToBobRate: number;
  premiumPriceUsd: number;
  qrImageUrl: string;
}

/**
 * Configuración de precios del flujo Premium. La fila es única (id fijo) y se
 * crea de forma perezosa en la primera lectura, para no depender de un script
 * de arranque.
 */
export async function getConfig(): Promise<PricingConfig> {
  // Lectura primero: en el camino caliente no se escribe nada. Solo si falta la
  // fila se paga el upsert (y ahí el ON CONFLICT resuelve la carrera entre dos
  // peticiones concurrentes).
  const found = await prisma.config.findUnique({ where: { id: SINGLETON } });
  if (found) return pick(found);

  const created = await prisma.config.upsert({
    where: { id: SINGLETON },
    update: {},
    create: { id: SINGLETON, ...DEFAULTS },
  });
  return pick(created);
}

/** Total en bolivianos, redondeado hacia arriba. Fuente única del cálculo. */
export function totalBob(
  config: Pick<PricingConfig, "usdToBobRate" | "premiumPriceUsd">
): number {
  return Math.ceil(config.premiumPriceUsd * config.usdToBobRate);
}

function pick(c: {
  usdToBobRate: number;
  premiumPriceUsd: number;
  qrImageUrl: string;
}): PricingConfig {
  return {
    usdToBobRate: c.usdToBobRate,
    premiumPriceUsd: c.premiumPriceUsd,
    qrImageUrl: c.qrImageUrl,
  };
}
