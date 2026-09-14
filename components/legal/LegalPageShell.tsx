import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import {
  LEGAL_UPDATED_AT,
  type Block,
  type Doc,
  type Locale,
} from "@/lib/legal/types";

// Server Component sin estado: las 5 páginas legales solo le pasan su `Doc` y el
// idioma, así que el markup vive en un único sitio.

const UI = {
  es: {
    badge: "Legal",
    updated: "Última actualización",
    toc: "Índice",
    back: "Volver al inicio",
  },
  en: {
    badge: "Legal",
    updated: "Last updated",
    toc: "Contents",
    back: "Back to home",
  },
} as const;

const DATE_LOCALE: Record<Locale, string> = { es: "es-BO", en: "en-US" };

function formatDate(locale: Locale): string {
  // La fecha se guarda como "YYYY-MM-DD" sin hora: se interpreta en UTC para que
  // no se muestre un día antes en zonas con desfase negativo.
  return new Date(`${LEGAL_UPDATED_AT}T00:00:00Z`).toLocaleDateString(
    DATE_LOCALE[locale],
    { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
  );
}

export default function LegalPageShell({
  doc,
  locale,
}: {
  doc: Doc;
  locale: Locale;
}) {
  const t = UI[locale];
  const headings = doc.sections.filter((s) => (s.level ?? 2) === 2);

  return (
    <div className="relative min-h-screen">
      {/* Fondo ambiental, igual que el resto del sitio */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-accent/10 via-primary/5 to-transparent" />

      {/* `lang` marca el contenido en inglés para lectores de pantalla (el
          <html lang="es"> del layout raíz no se toca: leerlo con cookies() ahí
          haría dinámico todo el sitio y tiraría el ISR de "/" y "/explore"). */}
      <article
        lang={locale}
        className="relative mx-auto max-w-3xl px-4 py-12 md:px-6"
      >
        <div className="glass-strong fade-up rounded-3xl p-6 sm:p-8 md:p-12">
          <header>
            {/* El selector vive aquí y no en el Navbar: solo estas 5 páginas son
                bilingües, así que en el resto del sitio no tendría efecto. */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                {t.badge}
              </p>
              <LanguageToggle />
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              <span className="gradient-text">{doc.title}</span>
            </h1>
            <p className="mt-3 text-muted">{doc.subtitle}</p>
            <p className="mt-2 text-xs text-muted/70">
              {t.updated}: {formatDate(locale)}
            </p>
          </header>

          {doc.notice && (
            <p className="glass mt-8 border-l-2 border-l-secondary/60 p-4 text-sm leading-relaxed text-muted">
              {doc.notice}
            </p>
          )}

          {headings.length > 1 && (
            <nav aria-label={t.toc} className="glass mt-8 rounded-2xl p-5">
              <ol className="space-y-2 text-sm">
                {headings.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-muted transition-colors hover:text-secondary"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mt-10 space-y-8">
            {doc.sections.map((section) => {
              const Heading = section.level === 3 ? "h3" : "h2";
              return (
                // scroll-mt-24: el Navbar es sticky (top-0) y sin esto las anclas
                // del índice aterrizarían por debajo de él.
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <Heading
                    className={
                      section.level === 3
                        ? "text-lg font-semibold text-white/90"
                        : "text-xl font-bold text-white"
                    }
                  >
                    {section.heading}
                  </Heading>
                  <div className="mt-3 space-y-3">
                    {section.blocks.map((block, index) => (
                      <BlockView key={index} block={block} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <Link href="/" className="btn-secondary w-full sm:w-auto">
              {t.back}
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "p":
      return <p className="text-sm leading-relaxed text-muted">{block.text}</p>;
    case "ul":
      return (
        <ul className="ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-muted marker:text-secondary">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="ml-5 list-decimal space-y-1.5 text-sm leading-relaxed text-muted marker:text-secondary">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      );
  }
}
