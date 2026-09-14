import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { contact } from "@/lib/legal/contact";
import { getLegalContext } from "@/lib/legal/context";
import { getLocale } from "@/lib/legal/locale-server";

// Ruta dinámica a propósito: getLocale() lee la cookie de idioma.
// NO añadir `revalidate`: el selector de idioma dejaría de funcionar.

export async function generateMetadata(): Promise<Metadata> {
  const doc = contact(await getLegalContext())[getLocale()];
  return {
    title: doc.title,
    description: doc.subtitle,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const doc = contact(await getLegalContext())[getLocale()];
  return <LegalPageShell doc={doc} locale={getLocale()} />;
}
