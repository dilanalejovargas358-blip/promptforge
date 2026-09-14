import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { getLegalContext } from "@/lib/legal/context";
import { getLocale } from "@/lib/legal/locale-server";
import { privacy } from "@/lib/legal/privacy";

// Ruta dinámica a propósito: getLocale() lee la cookie de idioma.
// NO añadir `revalidate`: el selector de idioma dejaría de funcionar.

export async function generateMetadata(): Promise<Metadata> {
  const doc = privacy(await getLegalContext())[getLocale()];
  return {
    title: doc.title,
    description: doc.subtitle,
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const doc = privacy(await getLegalContext())[getLocale()];
  return <LegalPageShell doc={doc} locale={getLocale()} />;
}
