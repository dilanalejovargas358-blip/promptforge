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

export default async function PremiumManualPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, isPremium: true, premiumUntil: true },
  });
  if (!user) redirect("/login");

  // Si ya hay una solicitud en la cola, el botón no debe ofrecer crear otra.
  const pending = await prisma.premiumRequest.findFirst({
    where: { userId: user.id, status: "PENDING" },
    select: { id: true },
  });

  // Secuencial a propósito: el pool tiene connection_limit=1 y un Promise.all
  // aquí provoca P2024 a los 10 s.
  const config = await getConfig();

  return (
    <PremiumManualOptions
      isPremium={isPremiumActive(user)}
      hasPending={pending !== null}
      priceUsd={config.premiumPriceUsd}
      exchangeRate={config.usdToBobRate}
      totalBs={totalBob(config)}
      qrImageUrl={config.qrImageUrl}
    />
  );
}
