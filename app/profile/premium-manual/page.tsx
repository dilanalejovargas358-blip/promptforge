import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPremiumActive } from "@/lib/credits";
import PremiumManualOptions from "@/components/profile/PremiumManualOptions";

export const metadata: Metadata = {
  title: "Hazte Premium",
};

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

  return (
    <PremiumManualOptions
      isPremium={isPremiumActive(user)}
      hasPending={pending !== null}
    />
  );
}
