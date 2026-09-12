"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type AnalyzeResult = {
  ok?: boolean;
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  error?: string;
  code?: string;
};

// Escala para la barra circular.
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreColor(score: number): string {
  if (score >= 75) return "#4ECDC4"; // secondary
  if (score >= 50) return "#C084FC"; // accent
  return "#FF6B6B"; // primary
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excelente";
  if (score >= 75) return "Muy bueno";
  if (score >= 60) return "Bueno";
  if (score >= 50) return "Regular";
  if (score >= 30) return "Débil";
  return "Muy débil";
}

function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score);
  const filled = (score / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
      <div className="relative h-32 w-32 sm:h-36 sm:w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="12"
          />
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRCUMFERENCE - filled}`}
            style={{
              transition: "stroke-dasharray 1s ease-out, stroke 0.3s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold" style={{ color }}>
            {score}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            /100
          </span>
        </div>
      </div>
      <div>
        <p className="text-lg font-bold" style={{ color }}>
          {scoreLabel(score)}
        </p>
        <p className="mt-1 max-w-[180px] text-sm text-muted">
          Nivel general del prompt
        </p>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  items,
  tone,
}: {
  icon: string;
  title: string;
  items: string[];
  tone: "good" | "bad" | "neutral";
}) {
  if (items.length === 0) return null;
  const marker =
    tone === "good"
      ? "text-secondary"
      : tone === "bad"
      ? "text-red-400"
      : "text-accent";
  const bullet = tone === "good" ? "✓" : tone === "bad" ? "✗" : "•";

  return (
    <div className="glass fade-up p-5 sm:p-6">
      <h4 className="mb-4 flex items-center gap-2 font-bold">
        <span className="text-lg">{icon}</span>
        <span
          className={
            tone === "good"
              ? "text-secondary"
              : tone === "bad"
              ? "text-red-400"
              : "text-accent"
          }
        >
          {title}
        </span>
      </h4>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/85">
            <span className={`mt-0.5 font-bold ${marker}`}>{bullet}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnalyzerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
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

  async function handleAnalyze() {
    const trimmed = prompt.trim();
    if (!trimmed || loading || outOfCredits) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ia/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data: AnalyzeResult = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setError(
            "Te quedaste sin créditos IA. Suscríbete por $1.99 y obtén 25 más."
          );
        } else {
          setError(data.error || "Hubo un error al analizar. Intenta de nuevo.");
        }
        return;
      }

      setResult(data);
    } catch {
      setError("Hubo un error al analizar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // Mientras NextAuth resuelve la sesión no pintamos nada (evita el parpadeo
  // del formulario antes de redirigir a /login).
  if (status === "loading") {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-accent/10 via-primary/5 to-transparent" />

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
            <span className="gradient-text">📊 Analizar Prompt</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Pega tu prompt y la IA lo puntuará de 0 a 100, señalando sus
            fortalezas y qué mejorar.
          </p>
          <p className="mt-2 text-xs text-muted/70">Cada análisis cuesta 1 crédito IA.</p>
        </div>

        {/* Área de entrada */}
        <div className="fade-up mt-8" style={{ animationDelay: "100ms" }}>
          <div className="glass p-5 sm:p-6">
            <label className="mb-2 block text-sm font-medium text-muted">
              Tu prompt a analizar
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Ej: 'Actúa como experto en marketing y dame una campaña para mi cafetería'"
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
                onClick={handleAnalyze}
                disabled={loading || !prompt.trim()}
                className="btn-primary mt-4 w-full disabled:opacity-60"
              >
                {loading ? "⏳ Analizando..." : "📊 Analizar con IA"}
              </button>
            )}

            {error && (
              <p className="mt-3 text-sm font-medium text-red-400">{error}</p>
            )}
          </div>
        </div>

        {/* Resultado */}
        {result && typeof result.score === "number" && (
          <div className="mt-8 space-y-4" style={{ animationDelay: "200ms" }}>
            {/* Puntuación circular */}
            <div className="glass fade-up flex flex-col items-center gap-6 rounded-2xl p-6 sm:flex-row sm:justify-center">
              <ScoreRing score={result.score} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Section
                icon="💪"
                title="Fortalezas"
                items={result.strengths ?? []}
                tone="good"
              />
              <Section
                icon="⚠️"
                title="Áreas de mejora"
                items={result.weaknesses ?? []}
                tone="bad"
              />
            </div>

            <Section
              icon="🚀"
              title="Recomendaciones"
              items={result.recommendations ?? []}
              tone="neutral"
            />
          </div>
        )}
      </div>
    </div>
  );
}
