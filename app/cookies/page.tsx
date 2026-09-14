import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { cookiesPolicy } from "@/lib/legal/cookies";
import { getLegalContext } from "@/lib/legal/context";
import { getLocale } from "@/lib/legal/locale-server";

// Ruta dinámica a propósito: getLocale() lee la cookie de idioma.
// NO añadir `revalidate`: el selector de idioma dejaría de funcionar.

export async function generateMetadata(): Promise<Metadata> {
  const doc = cookiesPolicy(await getLegalContext())[getLocale()];
  return {
    title: doc.title,
    description: doc.subtitle,
    alternates: { canonical: "/cookies" },
  };
}

export default async function CookiesPage() {
  const doc = cookiesPolicy(await getLegalContext())[getLocale()];
  return <LegalPageShell doc={doc} locale={getLocale()} />;
}
