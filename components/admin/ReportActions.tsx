"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, EyeOff, LoaderCircle, Trash2 } from "lucide-react";

type Action = "hide" | "remove" | "dismiss";

const LABELS: Record<Action, string> = {
  hide: "Ocultar",
  remove: "Borrar",
  dismiss: "Desestimar",
};

/**
 * Acciones de moderación de un reporte. "Ocultar" y "Borrar" piden una nota
 * (se le envía al autor en la notificación); "Desestimar" no.
 */
export default function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Action, note?: string) {
    setPending(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "No se pudo completar la acción.");
        return;
      }
      // El reporte sale de la cola: se refresca la lista del servidor.
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setPending(null);
    }
  }

  function handleClick(action: Action) {
    if (action === "dismiss") {
      run(action);
      return;
    }
    const label = action === "hide" ? "ocultar" : "borrar";
    const note = window.prompt(
      `Motivo por el que vas a ${label} este prompt (se le enviará al autor):`,
      ""
    );
    // Cancelar el prompt cancela la acción.
    if (note === null) return;
    run(action, note.trim() || undefined);
  }

  const base =
    "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleClick("hide")}
          disabled={pending !== null}
          className={`${base} inline-flex items-center gap-1.5 bg-warning/15 text-warning hover:bg-warning/25`}
        >
          {pending === "hide" ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
          {LABELS.hide}
        </button>
        <button
          type="button"
          onClick={() => handleClick("remove")}
          disabled={pending !== null}
          className={`${base} inline-flex items-center gap-1.5 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20`}
        >
          {pending === "remove" ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
          {LABELS.remove}
        </button>
        <button
          type="button"
          onClick={() => handleClick("dismiss")}
          disabled={pending !== null}
          className={`${base} inline-flex items-center gap-1.5 bg-white/5 text-muted hover:bg-white/10 hover:text-white`}
        >
          {pending === "dismiss" ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CircleCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
          {LABELS.dismiss}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
