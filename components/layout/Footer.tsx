import Link from "next/link";
import { Heart } from "lucide-react";

// Solo rutas que existen de verdad: en su día hubo enlaces a /terms y /privacy
// que llevaban a un 404 y se quitaron. Ya existen esas páginas, así que están
// de vuelta en la columna "Legal".
//
// Esta columna va en español a propósito. El Footer es un Server Component que
// forma parte del árbol del layout raíz de TODAS las rutas: leer aquí la cookie
// de idioma con `cookies()` convertiría "/" y "/explore" en dinámicas (son ISR
// con revalidate = 30) sin dar ningún error de compilación. Las páginas legales
// sí son bilingües y llevan su propio selector.
const FOOTER_COLS = [
  {
    title: "Plataforma",
    links: [
      { label: "Explorar Prompts", href: "/explore" },
      { label: "IA Tools", href: "/ia" },
      { label: "Ranking", href: "/ranking" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { label: "Subir un Prompt", href: "/prompt/nuevo" },
      { label: "Mi Perfil", href: "/profile" },
      { label: "Crear cuenta", href: "/register" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos de Uso", href: "/terms" },
      { label: "Privacidad", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Reembolsos", href: "/refunds" },
      { label: "Contacto", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 px-3 pb-6">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-accent/10 to-transparent" />

      <div className="glass-strong relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-5 py-10 sm:px-8 md:px-12 md:py-12">
        {/* Resplandor decorativo */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-[100px]" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-accent/15 blur-[100px]" />

        <div className="relative grid gap-8 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-10">
          {/* Marca */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-black text-background">
                P
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                <span className="gradient-text">PromptForge</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              El mercado más seguro para compartir y vender prompts para IA.
              Forja tu creatividad con los mejores prompts curados.
            </p>
          </div>

          {/* Columnas de enlaces */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Línea inferior */}
        <div className="relative mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} PromptForge Pro. Todos los derechos
            reservados.
          </p>
          <p className="flex items-center gap-1.5">
            Hecho con <Heart className="h-4 w-4 fill-accent text-accent" /> para
            la comunidad de IA
          </p>
        </div>
      </div>
    </footer>
  );
}
