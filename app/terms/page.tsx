import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { getLegalContext } from "@/lib/legal/context";
import { getLocale } from "@/lib/legal/locale-server";
import { terms } from "@/lib/legal/terms";

// Esta ruta es dinámica a propósito: getLocale() lee la cookie de idioma y
// getLegalContext() lee el precio de la BD. NO añadir `revalidate`: si la página
// se sirviera desde caché, la cookie no se leería y el selector de idioma
// dejaría de funcionar en silencio.

export async function generateMetadata(): Promise<Metadata> {
  const doc = terms(await getLegalContext())[getLocale()];
  return {
    title: doc.title,
    description: doc.subtitle,
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsPage() {
  const doc = terms(await getLegalContext())[getLocale()];
  return <LegalPageShell doc={doc} locale={getLocale()} />;
}
