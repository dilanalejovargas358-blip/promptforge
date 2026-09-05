"use client";

import { useEffect, useState } from "react";

const AD_SECONDS = 15;

interface AdModalProps {
  open: boolean;
  onClose: () => void;
  /** Se llama con el nuevo saldo cuando el anuncio es reclamado. */
  onCredited: (credits: number) => void;
  adType?: "GOOGLE" | "SPONSOR";
}

/**
 * Modal de anuncio con temporizador de 15s. Al terminar, permite reclamar +1 crédito.
 * El anuncio mostrado es un placeholder estilizado: aquí se insertaría el
 * bloque de Google AdSense o de un patrocinador real.
 */
export default function AdModal({
  open,
  onClose,
  onCredited,
  adType = "GOOGLE",
}: AdModalProps) {
  const [remaining, setRemaining] = useState(AD_SECONDS);
  const [busy, setBusy] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reiniciar estado al abrir.
  useEffect(() => {
    if (open) {
      setRemaining(AD_SECONDS);
      setClaimed(false);
      setError(null);
      setBusy(false);
    }
  }, [open]);

  // Cuenta atrás.
  useEffect(() => {
    if (!open || claimed || remaining <= 0) return;
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [open, claimed, remaining]);

  async function claim() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adType }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setClaimed(true);
        onCredited(data.credits);
      } else {
        setError(data?.error ?? "No se pudo reclamar el crédito.");
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const canClaim = !claimed && remaining <= 0 && !busy;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Anuncio"
    >
      <div className="glass-strong w-full max-w-md rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-secondary">
            Anuncio {adType === "SPONSOR" ? "patrocinado" : "Google AdSense"}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Placeholder del anuncio: sustituir por bloque real de AdSense/patrocinador */}
        <div className="mt-4 flex aspect-video flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 text-center">
          <span className="text-4xl">{adType === "SPONSOR" ? "🎯" : "📢"}</span>
          <p className="text-sm font-bold">Espacio publicitario</p>
          <p className="px-6 text-xs text-muted">
            Aquí se renderiza el bloque de anuncio (Google AdSense o patrocinador).
          </p>
          <span className="mt-1 rounded-full bg-white/5 px-3 py-0.5 text-[10px] uppercase text-muted">
            Ad {adType}
          </span>
        </div>

        {/* Cuenta atrás / acción */}
        <div className="mt-5 text-center">
          {claimed ? (
            <p className="text-sm font-semibold text-secondary">✅ +1 crédito reclamado</p>
          ) : (
            <>
              <p className="text-xs text-muted">
                {remaining > 0
                  ? `Mantente en la página… ${remaining}s`
                  : "Anuncio completado"}
              </p>
              {remaining > 0 && (
                <div className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-linear"
                    style={{ width: `${(remaining / AD_SECONDS) * 100}%` }}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={claim}
                disabled={!canClaim}
                className="btn-primary mt-4 w-full shadow-glow-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Reclamando…" : canClaim ? "Reclamar +1 crédito" : `Espera ${remaining}s`}
              </button>
            </>
          )}
          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
