"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Explorar", href: "/explore" },
  { label: "Ranking", href: "/ranking" },
  { label: "Subir Prompt", href: "/prompt/nuevo" },
  { label: "Mi Perfil", href: "/profile" },
];

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 px-2 pt-3 md:px-4 md:pt-4">
      <nav className="glass-strong mx-auto flex max-w-6xl items-center gap-3 rounded-2xl px-4 py-2.5 md:px-5">
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-yellow-brand to-secondary text-lg font-black text-background shadow-glow-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            P
          </span>
          <span className="hidden text-xl font-extrabold tracking-tight sm:block">
            <span className="gradient-text">PromptForge</span>
          </span>
        </Link>

        {/* Búsqueda (escritorio) */}
        <form
          onSubmit={submitSearch}
          className="mx-1 hidden flex-1 items-center md:flex"
        >
          <div className="group relative w-full max-w-xs">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
              🔍
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar prompts..."
              aria-label="Buscar prompts"
              className="field-glow w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-muted/70"
            />
          </div>
        </form>

        {/* Enlaces (escritorio) */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="nav-link rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:text-secondary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Botones de sesión */}
        <div className="ml-auto hidden items-center gap-2.5 md:flex lg:ml-0">
          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm font-semibold text-muted transition-colors hover:text-white"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="btn-primary !px-5 !py-2 text-sm shadow-glow-primary"
          >
            Registrarse
          </Link>
        </div>

        {/* Botón hamburguesa (móvil) */}
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen((v) => !v)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-xl text-white transition-colors hover:bg-white/10 md:hidden lg:ml-0"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="glass-strong mx-auto mt-2 max-w-6xl rounded-2xl px-5 py-4 md:hidden">
          {/* Búsqueda móvil */}
          <form onSubmit={submitSearch} className="relative mb-3">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
              🔍
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar prompts..."
              className="field-glow w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-muted/70"
            />
          </form>

          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 hover:text-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="btn-secondary w-full text-sm"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="btn-primary w-full text-sm"
            >
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
