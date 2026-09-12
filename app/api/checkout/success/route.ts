import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/credits";

export const dynamic = "force-dynamic";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

// Página de retorno tras pagar en Stripe: verifica la sesión y activa Premium.
// En producción se recomienda usar además un webhook para mayor robustez.
export async function GET(req: Request) {
  const user = await getDbUser();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const sessionId = new URL(req.url).searchParams.get("session_id");

  if (!user || !sessionId) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  if (!STRIPE_SECRET) {
    return NextResponse.redirect(`${appUrl}/profile?upgrade=error`);
  }

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${STRIPE_SECRET}` },
    });
    const data = await res.json();

    if (!res.ok || data.payment_status !== "paid") {
      console.error("Stripe verification failed:", data);
      return NextResponse.redirect(`${appUrl}/profile?upgrade=error`);
    }

    // Activa Premium 1 mes para que el usuario lo vea al volver del pago.
    // Los créditos IA NO se acreditan aquí: los concede el webhook de Stripe
    // (checkout.session.completed), que es la única fuente de verdad. Si se
    // acreditasen en ambos sitios, un solo pago daría 50 créditos.
    const premiumUntil = new Date();
    premiumUntil.setMonth(premiumUntil.getMonth() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: { isPremium: true, premiumUntil },
    });

    return NextResponse.redirect(`${appUrl}/profile?upgrade=success`);
  } catch (error) {
    console.error("Error activando premium:", error);
    return NextResponse.redirect(`${appUrl}/profile?upgrade=error`);
  }
}
