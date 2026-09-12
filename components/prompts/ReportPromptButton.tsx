"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const MIN = 10;
const MAX = 500;

/**
 * Botón de reporte con modal. Requiere sesión: sin ella muestra un enlace a
 * /login en lugar del formulario.
 */
export default function ReportPromptButton({
  promptId,
  className = "",
}: {
  promptId: string;
  className?: string;
}) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isLoggedIn = status === "authenticated";
  const tooShort = reason.trim().length < MIN;

  function close() {
    setOpen(false);
    // El estado de éxito se limpia al cerrar, para poder reportar otro prompt.
    if (done) {
      setDone(false);
      setReason("");
    }
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/prompts/${promptId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "No se pudo enviar el reporte.");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de conexión.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          "rounded-full px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-red-400"
        }
      >
        🚩 Reportar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Reportar prompt"
          onClick={close}
        >
          <div
            className="glass-strong w-full max-w-md rounded-2xl p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold">Reportar prompt</h3>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="text-xl leading-none text-muted transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>

            {!isLoggedIn ? (
              <>
                <p className="mt-3 text-sm text-muted">
                  Necesitas una cuenta para reportar contenido. Así podemos
                  revisar el reporte y avisarte del resultado.
                </p>
                <Link
                  href="/login"
                  className="btn-primary mt-5 w-full !py-2.5 text-sm"
                >
                  Iniciar sesión
                </Link>
              </>
            ) : done ? (
              <>
                <p className="mt-4 rounded-xl bg-secondary/10 px-4 py-4 text-sm font-semibold text-secondary">
                  ✅ Reporte enviado, gracias. Un administrador lo revisará.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="btn-secondary mt-4 w-full !py-2.5 text-sm"
                >
                  Cerrar
                </button>
              </>
            ) : (
              <form onSubmit={submit}>
                <p className="mt-2 text-sm text-muted">
                  Cuéntanos qué incumple este prompt. El contenido seguirá visible
                  hasta que un administrador lo revise.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  maxLength={MAX}
                  autoFocus
                  placeholder="Describe el problema (mínimo 10 caracteres)…"
                  className="field-glow mt-4 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted/60"
                />
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className={tooShort ? "text-muted" : "text-secondary"}>
                    {reason.trim().length}/{MAX}
                  </span>
                  {tooShort && (
                    <span className="text-muted">
                      Faltan {MIN - reason.trim().length} caracteres
                    </span>
                  )}
                </div>

                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={tooShort || sending}
                    className="flex-1 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? "Enviando…" : "Enviar reporte"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
