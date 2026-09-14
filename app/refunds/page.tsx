import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { getLegalContext } from "@/lib/legal/context";
import { getLocale } from "@/lib/legal/locale-server";
import { refunds } from "@/lib/legal/refunds";

// Ruta dinámica a propósito: getLocale() lee la cookie de idioma y
// getLegalContext() lee el precio de la BD.
// NO añadir `revalidate`: el selector de idioma dejaría de funcionar.

export async function generateMetadata(): Promise<Metadata> {
  const doc = refunds(await getLegalContext())[getLocale()];
  return {
    title: doc.title,
    description: doc.subtitle,
    alternates: { canonical: "/refunds" },
  };
}

export default async function RefundsPage() {
  const doc = refunds(await getLegalContext())[getLocale()];
  return <LegalPageShell doc={doc} locale={getLocale()} />;
}
