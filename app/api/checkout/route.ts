import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/credits";

export const dynamic = "force-dynamic";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID; // Plan Premium recurrente ($1.99/mes)

// Crea una sesión de Checkout de Stripe (vía REST, sin SDK) y devuelve la URL.
export async function POST() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  if (!STRIPE_SECRET || !STRIPE_PRICE_ID) {
    return NextResponse.json(
      {
        error:
          "Stripe no está configurado. Define STRIPE_SECRET_KEY y STRIPE_PRICE_ID en .env.local.",
      },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("line_items[0][price]", STRIPE_PRICE_ID);
  form.set("line_items[0][quantity]", "1");
  form.set("success_url", `${appUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${appUrl}/profile?upgrade=cancelled`);
  form.set("client_reference_id", user.id);
  form.set("metadata[userId]", user.id);

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    const data = await res.json();

    if (!res.ok) {
      console.error("Stripe checkout error:", data);
      return NextResponse.json(
        { error: data?.error?.message ?? "No se pudo iniciar el pago." },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true, url: data.url });
  } catch (error) {
    console.error("Error creando checkout:", error);
    return NextResponse.json(
      { error: "Error al contactar con Stripe." },
      { status: 500 }
    );
  }
}
