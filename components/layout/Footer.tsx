"use client";

import Link from "next/link";
import { useState } from "react";

const FOOTER_COLS = [
  {
    title: "Plataforma",
    links: [
      { label: "Explorar Prompts", href: "/explore" },
      { label: "Subir un Prompt", href: "/prompt/nuevo" },
      { label: "Mi Perfil", href: "/profile" },
    ],
  },
  {
    title: "Comunidad",
    links: [
      { label: "Creadores", href: "/explore" },
      { label: "Términos de uso", href: "/terms" },
      { label: "Privacidad", href: "/privacy" },
    ],
  },
];

const SOCIAL = [
  { label: "X", href: "https://x.com" },
  { label: "Discord", href: "https://discord.com" },
  { label: "GitHub", href: "https://github.com" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  return (
    <footer className="relative mt-20 px-3 pb-6">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-accent/10 to-transparent" />

      <div className="glass-strong relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-8 py-12 md:px-12">
        {/* Resplandor decorativo */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-[100px]" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-secondary/15 blur-[100px]" />

        <div className="relative grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          {/* Marca */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-yellow-brand to-secondary text-lg font-black text-background">
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

            {/* Redes */}
            <div className="mt-5 flex gap-2.5">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-muted transition-all duration-200 hover:-translate-y-1 hover:border-secondary/50 hover:text-white"
                >
                  {s.label.charAt(0)}
                </a>
              ))}
            </div>
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
                      className="text-sm text-muted transition-colors hover:text-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Newsletter
            </h4>
            <p className="mt-4 text-sm text-muted">
              Recibe los mejores prompts gratis cada semana.
            </p>
            {subscribed ? (
              <div className="gradient-border mt-4 rounded-2xl bg-secondary/10 px-4 py-4 text-sm font-semibold text-secondary">
                ✅ ¡Listo! Revisa tu bandeja de entrada.
              </div>
            ) : (
              <form onSubmit={subscribe} className="mt-4 space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="field-glow w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-muted/70"
                />
                <button type="submit" className="btn-primary w-full !py-2.5 text-sm">
                  Suscribirme
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Línea inferior */}
        <div className="relative mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} PromptForge Pro. Todos los derechos
            reservados.
          </p>
          <p className="flex items-center gap-1.5">
            Hecho con <span className="text-primary">♥</span> para la comunidad
            de IA
          </p>
        </div>
      </div>
    </footer>
  );
}
