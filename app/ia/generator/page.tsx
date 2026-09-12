"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function GeneratorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [description, setDescription] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
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

  async function handleGenerate() {
    if (!description.trim() || outOfCredits) return;

    setLoading(true);
    setError("");
    setGeneratedPrompt("");
    setSummary("");

    try {
      const res = await fetch("/api/ia/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Hubo un error al generar el prompt. Intenta de nuevo.");
        return;
      }

      setGeneratedPrompt(data.prompt);
      setSummary(data.summary);
    } catch {
      setError("Hubo un error al generar el prompt. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!session) {
      alert("Debes iniciar sesión para guardar prompts.");
      return;
    }

    try {
      const res = await fetch("/api/ia/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: description,
          optimizedPrompt: generatedPrompt,
          improvements: [`Prompt generado desde: "${description}"`],
          scoreBefore: 0,
          scoreAfter: 100,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error guardando:", error);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Mientras NextAuth resuelve la sesión no pintamos nada (evita el parpadeo
  // del formulario antes de redirigir a /login).
  if (status === "loading") {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-secondary/10 via-accent/5 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-4 py-12 md:px-6">
        <div className="fade-up text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            <span className="gradient-text">✨ Generar Prompt</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Describe lo que quieres hacer y la IA creará un prompt profesional para ti.
          </p>
        </div>

        <div className="fade-up mt-8" style={{ animationDelay: "100ms" }}>
          <div className="glass p-5 sm:p-6">
            <label className="mb-2 block text-sm font-medium text-muted">
              ¿Qué quieres hacer?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Ej: Quiero un prompt para crear landing pages de alto rendimiento"
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
                onClick={handleGenerate}
                disabled={loading || !description.trim()}
                className="btn-primary mt-4 w-full disabled:opacity-60"
              >
                {loading ? "⏳ Generando..." : "✨ Generar Prompt con IA"}
              </button>
            )}

            {error && (
              <p className="mt-3 text-sm font-medium text-red-400">{error}</p>
            )}
          </div>
        </div>

        {generatedPrompt && (
          <div className="fade-up mt-8" style={{ animationDelay: "200ms" }}>
            {summary && (
              <div className="glass mb-4 p-4">
                <h4 className="mb-1 text-sm font-bold text-secondary">📌 Resumen</h4>
                <p className="text-sm text-muted">{summary}</p>
              </div>
            )}

            <div className="glass p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">Prompt generado</h3>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <button
                    onClick={handleCopy}
                    className="flex-1 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/10 sm:flex-none sm:py-1.5"
                  >
                    {copied ? "✅ ¡Copiado!" : "📋 Copiar"}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/10 sm:flex-none sm:py-1.5"
                  >
                    {saved ? "✅ Guardado" : "💾 Guardar"}
                  </button>
                </div>
              </div>
              <div className="whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-sm leading-relaxed text-white/90 sm:text-base">
                {generatedPrompt}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
