"use client";

import { useState } from "react";

interface SupportPromptButtonProps {
  promptId: string;
  initialCredits: number; // totalCredits del prompt (apoyos recibidos)
  className?: string;
}

/**
 * Botón "Apoyar". Cuesta 1 rayito del usuario y suma 1 al total del prompt
 * (que es lo que alimenta el ranking). Gestiona login/sin rayitos/auto-apoyo.
 */
export default function SupportPromptButton({
  promptId,
  initialCredits,
  className = "",
}: SupportPromptButtonProps) {
  const [total, setTotal] = useState(initialCredits);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function support() {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/prompts/${promptId}/support`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTotal(data.totalCredits ?? total + 1);
        setMessage({ text: "¡Gracias por apoyar! ❤️", ok: true });
      } else {
        setMessage({ text: data?.error ?? "No se pudo apoyar.", ok: false });
      }
    } catch {
      setMessage({ text: "Error de conexión.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`inline-flex flex-col items-end gap-1 ${className}`}>
      <button
        type="button"
        onClick={support}
        disabled={busy}
        aria-label="Apoyar este prompt con 1 rayito"
        className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-60"
      >
        {busy ? "…" : `⚡ Apoyar · ${total}`}
      </button>
      {message && (
        <span
          className={`text-[11px] leading-tight ${
            message.ok ? "text-secondary" : "text-red-400"
          }`}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
