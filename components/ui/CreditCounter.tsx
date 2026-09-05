"use client";

import { useCallback, useEffect, useState } from "react";

interface CreditCounterProps {
  initialCredits?: number | null;
  /** Cambia este valor (p. ej. tras ver un anuncio) para volver a leer el saldo. */
  refreshKey?: number;
  className?: string;
}

/**
 * Contador de créditos del usuario autenticado. Se auto-refresca desde /api/credits
 * cada vez que cambia `refreshKey` (por ejemplo al completar un anuncio).
 */
export default function CreditCounter({
  initialCredits = null,
  refreshKey = 0,
  className = "",
}: CreditCounterProps) {
  const [credits, setCredits] = useState<number | null>(initialCredits);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/credits", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setCredits(data.credits);
      } else {
        setCredits(initialCredits);
      }
    } catch {
      setCredits(initialCredits);
    } finally {
      setReady(true);
    }
  }, [initialCredits]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-muted ${className}`}
      title="Tus créditos"
    >
      💳
      <span className="tabular-nums font-semibold text-white">
        {ready ? (credits ?? "–") : "…"}
      </span>
    </span>
  );
}
