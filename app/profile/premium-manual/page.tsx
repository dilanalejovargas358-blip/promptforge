import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPremiumActive } from "@/lib/credits";
import { getConfig, totalBob } from "@/lib/config";
import PremiumManualOptions from "@/components/profile/PremiumManualOptions";

export const metadata: Metadata = {
  title: "Hazte Premium",
};

// El precio lo fija el admin en /admin/config: sin esto el cambio no se vería
// hasta el siguiente despliegue.
export const dynamic = "force-dynamic";

/** La columna es String en Prisma; aquí se estrecha a los dos valores reales. */
function asMethod(value: string | undefined): "yolo" | "binance" | null {
  if (!value) return null;
  return value === "binance" ? "binance" : "yolo";
}

export default async function PremiumManualPage() {
  // `getConfig` no depende de la sesión: lanzarlo a la vez ahorra un viaje de ida
  // y vuelta completo.
  const [session, config] = await Promise.all([
    getServerSession(authOptions),
    getConfig(),
  ]);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, isPremium: true, premiumUntil: true },
  });
  if (!user) redirect("/login");

  // Si ya hay una solicitud en la cola, el botón no debe ofrecer crear otra.
  // Se trae también el método para que la pantalla de espera pueda decir por
  // dónde pagó sin esperar al primer sondeo.
  const pending = await prisma.premiumRequest.findFirst({
    where: { userId: user.id, status: "PENDING" },
    select: { method: true },
  });

  return (
    <PremiumManualOptions
      isPremium={isPremiumActive(user)}
      pendingMethod={asMethod(pending?.method)}
      priceUsd={config.premiumPriceUsd}
      exchangeRate={config.usdToBobRate}
      totalBs={totalBob(config)}
      qrImageUrl={config.qrImageUrl}
    />
  );
}
