"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { RAYS_MAX } from "@/lib/constants";

interface NavLink {
  label: string;
  href: string;
  /** Requiere sesión: se oculta del Navbar si el usuario no ha iniciado sesión. */
  private?: boolean;
  /** Solo para admins: se oculta salvo que el rol del usuario sea ADMIN. */
  adminOnly?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "IA Tools", href: "/ia" },
  { label: "Explorar", href: "/explore" },
  { label: "Ranking", href: "/ranking" },
  { label: "Subir Prompt", href: "/prompt/nuevo", private: true },
  { label: "Mi Perfil", href: "/profile", private: true },
  { label: "Admin", href: "/admin", private: true, adminOnly: true },
];

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isLoggedIn = status === "authenticated";
  const rays = session?.user?.rays ?? 0;

  const isAdmin = session?.user?.role === "ADMIN";

  // Los enlaces privados (p. ej. "Mi Perfil") solo se muestran con sesión, y los
  // de admin (p. ej. "Admin") solo con rol ADMIN. Ocultar no es proteger: la
  // puerta real es el guard de app/admin/layout.tsx.
  const visibleLinks = NAV_LINKS.filter(
    (l) => (!l.private || isLoggedIn) && (!l.adminOnly || isAdmin)
  );

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
  }

  function handleSignOut() {
    setMenuOpen(false);
    signOut({ callbackUrl: "/" });
  }

  return (
    <header className="sticky top-0 z-50 px-2 pt-3 md:px-4 md:pt-4">
      <nav className="glass-strong mx-auto flex max-w-6xl items-center gap-2 rounded-2xl px-3 py-2.5 sm:gap-3 md:px-5">
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-yellow-brand to-secondary text-lg font-black text-background shadow-glow-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
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
          {visibleLinks.map((link) => {
            const isCta = link.href === "/prompt/nuevo";
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={
                    isCta
                      ? "rounded-lg bg-gradient-to-r from-secondary to-accent px-4 py-2 text-sm font-bold text-background shadow-glow-primary transition-transform duration-200 hover:scale-105"
                      : "nav-link rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:text-secondary"
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Botones de sesión */}
        <div className="ml-auto hidden items-center gap-2.5 md:flex lg:ml-0">
          {isLoggedIn ? (
            <>
              <span
                title="Tus rayitos para apoyar prompts"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-2 text-sm font-semibold text-white"
              >
                ⚡ <span className="tabular-nums">{rays}/{RAYS_MAX}</span>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
              >
                Salir
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Botón hamburguesa (móvil) */}
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen((v) => !v)}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-2xl leading-none text-white transition-colors hover:bg-white/10 md:hidden lg:ml-0"
          aria-expanded={menuOpen}
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
            {visibleLinks.map((link) => {
              const isCta = link.href === "/prompt/nuevo";
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={
                      isCta
                        ? "block w-full rounded-xl bg-gradient-to-r from-secondary to-accent px-4 py-3 text-center text-sm font-bold text-background shadow-glow-primary"
                        : "block min-h-[44px] rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5 hover:text-secondary"
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <span className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                  ⚡ <span className="tabular-nums">{rays}/{RAYS_MAX}</span>{" "}
                  <span className="font-normal text-muted">rayitos</span>
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-full border border-red-500/30 bg-red-500/10 px-[1.9rem] py-[0.8rem] text-[0.95rem] font-extrabold text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
