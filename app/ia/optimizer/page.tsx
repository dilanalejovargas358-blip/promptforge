"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type OptimizeResult = {
  ok: boolean;
  optimizedPrompt?: string;
  improvements?: string[];
  scoreBefore?: number | null;
  scoreAfter?: number | null;
  error?: string;
};

export default function OptimizerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [prompt, setPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [improvements, setImprovements] = useState<string[]>([]);
  const [scoreBefore, setScoreBefore] = useState<number | null>(null);
  const [scoreAfter, setScoreAfter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [error, setError] = useState("");

  // Sin sesión no se puede usar la herramienta: a /login, y que vuelva aquí.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
    }
  }, [status, router]);

  const outOfCredits =
    status === "authenticated" && (session?.user?.credits ?? 0) < 1;

  // Convierte "...{cambio}..." en texto normal + <span> en verde para los cambios.
  function renderMarked(text: string) {
    const parts = text.split(/(\{[^{}]*\})/g);
    return parts.map((part, i) => {
      if (part.startsWith("{") && part.endsWith("}") && part.length > 2) {
        return (
          <span key={i} className="font-medium text-green-400">
            {part.slice(1, -1)}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  async function handleOptimize() {
    if (!prompt.trim() || loading || outOfCredits) return;

    setLoading(true);
    setError("");
    setSaveError("");
    setOptimizedPrompt("");
    setImprovements([]);
    setScoreBefore(null);
    setScoreAfter(null);

    try {
      const res = await fetch("/api/ia/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data: OptimizeResult = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Hubo un error al optimizar. Intenta de nuevo.");
        return;
      }

      setOptimizedPrompt(data.optimizedPrompt || "");
      setImprovements(data.improvements || []);
      setScoreBefore(data.scoreBefore ?? null);
      setScoreAfter(data.scoreAfter ?? null);
    } catch {
      setError("Hubo un error al optimizar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!optimizedPrompt) return;

    if (status !== "authenticated" || !session?.user) {
      alert("Debes iniciar sesión para guardar prompts.");
      router.push("/login");
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/ia/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: prompt.trim(),
          optimizedPrompt,
          improvements,
          scoreBefore,
          scoreAfter,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSaveError(data.error || "No se pudo guardar. Intenta de nuevo.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    navigator.clipboard?.writeText(optimizedPrompt.replace(/[{}]/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoggedIn = status === "authenticated";

  // Mientras NextAuth resuelve la sesión no pintamos nada (evita el parpadeo
  // del formulario antes de redirigir a /login).
  if (status === "loading") {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-4 py-12 md:px-6">
        {/* Encabezado */}
        <div className="fade-up text-center">
          <button
            onClick={() => router.push("/ia")}
            className="mb-4 text-sm font-semibold text-muted transition-colors hover:text-secondary"
          >
            ← Volver a IA Tools
          </button>
          <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            <span className="gradient-text">🔧 Optimizar Prompt</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Pega tu prompt y la IA lo mejorará. Las mejoras se resaltan en rojo.
          </p>
        </div>

        {/* Área de entrada */}
        <div className="fade-up mt-8" style={{ animationDelay: "100ms" }}>
          <div className="glass p-5 sm:p-6">
            <label className="mb-2 block text-sm font-medium text-muted">
              Tu prompt original
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Ej: 'Dame 10 ideas para un negocio de IA'"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-muted/60 focus:border-secondary focus:outline-none"
            />
            {outOfCredits ? (
              <div className="mt-4 flex flex-col items-stretch gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                <p className="text-sm text-white">
                  🚫 Te quedaste sin créditos IA. Suscríbete por $1.99 y obtén 25
                  más.
                </p>
                <button
                  onClick={() => router.push("/profile")}
                  className="btn-primary w-full shrink-0 text-sm sm:w-auto"
                >
                  Hacerme Premium
                </button>
              </div>
            ) : (
              <button
                onClick={handleOptimize}
                disabled={loading || !prompt.trim()}
                className="btn-primary mt-4 w-full disabled:opacity-60"
              >
                {loading ? "⏳ Optimizando..." : "🚀 Optimizar con IA"}
              </button>
            )}
            {error && (
              <p className="mt-3 text-sm font-medium text-red-400">{error}</p>
            )}
          </div>
        </div>

        {/* Resultado */}
        {optimizedPrompt && (
          <div className="fade-up mt-8" style={{ animationDelay: "200ms" }}>
            {/* Puntuaciones */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="glass rounded-full px-4 py-2 text-sm">
                Antes:{" "}
                <span className="font-bold text-red-400">
                  {scoreBefore ?? "–"}/100
                </span>
              </div>
              <div className="glass rounded-full px-4 py-2 text-sm">
                Después:{" "}
                <span className="font-bold text-secondary">
                  {scoreAfter ?? "–"}/100
                </span>
              </div>
              {typeof scoreBefore === "number" &&
                typeof scoreAfter === "number" &&
                scoreAfter > scoreBefore && (
                  <span className="text-sm font-bold text-secondary">
                    +{scoreAfter - scoreBefore} puntos
                  </span>
                )}
            </div>

            {/* Prompt mejorado */}
            <div className="glass p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">Prompt mejorado</h3>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <button
                    onClick={handleCopy}
                    disabled={!optimizedPrompt}
                    className="flex-1 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/10 disabled:opacity-60 sm:flex-none sm:py-1.5"
                  >
                    {copied ? "✅ ¡Copiado!" : "📋 Copiar"}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !optimizedPrompt}
                    className="flex-1 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/10 disabled:opacity-60 sm:flex-none sm:py-1.5"
                  >
                    {saving
                      ? "⏳ Guardando..."
                      : saved
                      ? "✅ Guardado"
                      : "💾 Guardar"}
                  </button>
                </div>
              </div>
              {!isLoggedIn && (
                <p className="mb-3 text-xs text-muted">
                  Inicia sesión para guardar el resultado en tu biblioteca.
                </p>
              )}
              <div className="whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-sm leading-relaxed text-white/90 sm:text-base">
                {renderMarked(optimizedPrompt)}
              </div>
              {saveError && (
                <p className="mt-3 text-sm font-medium text-red-400">
                  {saveError}
                </p>
              )}
            </div>

            {/* Mejoras */}
            {improvements.length > 0 && (
              <div className="glass mt-4 p-5 sm:p-6">
                <h4 className="mb-3 font-bold text-secondary">
                  ✨ Mejoras aplicadas
                </h4>
                <ul className="space-y-2">
                  {improvements.map((imp, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted"
                    >
                      <span className="text-secondary">•</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
