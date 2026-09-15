"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";

const MIN_REASON = 5;

/**
 * Resolución de una solicitud de Premium. Confirmar es un clic; rechazar exige
 * motivo (mínimo 5 caracteres) y una segunda confirmación, porque el rechazo no
 * se puede deshacer y el motivo lo lee el usuario.
 */
export default function PremiumActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "reason" | "confirm">("idle");
  const [reason, setReason] = useState("");

  async function resolve(action: "approve" | "reject", motivo?: string) {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/premium/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "reject" ? { action, reason: motivo } : { action }
        ),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "No se pudo completar la acción.");
        setStep("idle");
        return;
      }
      // La solicitud sale de la cola: se refresca la lista del servidor.
      setStep("idle");
      setReason("");
      router.refresh();
    } catch {
      setError("Error de conexión.");
      setStep("idle");
    } finally {
      setBusy(null);
    }
  }

  const base =
    "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const canReject = reason.trim().length >= MIN_REASON;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => resolve("approve")}
          disabled={busy !== null}
          className={`${base} inline-flex items-center gap-1.5 bg-accent/15 text-accent hover:bg-accent/25`}
        >
          {busy === "approve" ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CircleCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => setStep("reason")}
          disabled={busy !== null}
          className={`${base} inline-flex items-center gap-1.5 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20`}
        >
          <CircleX className="h-3.5 w-3.5" strokeWidth={2.5} />
          Rechazar
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Paso 1: motivo */}
      {step === "reason" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="glass w-full max-w-md p-6">
            <h3 className="text-lg font-bold">Motivo del rechazo</h3>
            <p className="mt-1 text-xs text-muted">
              Se le enviará al usuario, así que explícale qué pasó. Mínimo{" "}
              {MIN_REASON} caracteres.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted/60 focus:border-accent focus:outline-none"
              placeholder="Ej: no encontramos tu pago de 19 Bs con ese comprobante"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("idle");
                  setReason("");
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!canReject}
                onClick={() => setStep("confirm")}
                className="btn-primary !px-4 !py-1.5 text-xs disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 2: confirmación */}
      {step === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="glass w-full max-w-md p-6">
            <h3 className="text-lg font-bold">¿Confirmar rechazo?</h3>
            <p className="mt-2 text-sm text-muted">
              Esta acción no se puede deshacer. Se rechazará la solicitud y el
              usuario recibirá este motivo:
            </p>
            <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/5 p-3 text-sm text-white/90">
              {reason.trim()}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep("reason")}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-white"
              >
                ← Volver
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => resolve("reject", reason.trim())}
                className={`${base} inline-flex items-center gap-1.5 border border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25`}
              >
                {busy === "reject" ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CircleX className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
                Rechazar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
