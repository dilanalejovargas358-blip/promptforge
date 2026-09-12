"use client";

import { useCallback, useEffect, useState } from "react";
import { RAYS_MAX } from "@/lib/constants";

interface RayCounterProps {
  initialRays?: number | null;
  /** Cambia este valor para forzar una nueva lectura del saldo. */
  refreshKey?: number;
  className?: string;
}

/**
 * Contador de rayitos del usuario autenticado. Se auto-refresca desde
 * /api/credits cada vez que cambia `refreshKey`. Muestra ⚡ X/RAYS_MAX y, en el
 * tooltip, cuánto falta para el siguiente rayito (solo si no está al tope).
 */
export default function RayCounter({
  initialRays = null,
  refreshKey = 0,
  className = "",
}: RayCounterProps) {
  const [rays, setRays] = useState<number | null>(initialRays);
  const [max, setMax] = useState(RAYS_MAX);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/credits", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRays(data.rays);
        setMax(data.raysMax ?? RAYS_MAX);
        setNextAt(data.raysNextAt ?? null);
      } else {
        setRays(initialRays);
      }
    } catch {
      setRays(initialRays);
    } finally {
      setReady(true);
    }
  }, [initialRays]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // "en 42 min" / "ya" — solo si todavía no está al tope.
  const title =
    rays !== null && nextAt !== null && rays < max
      ? `Rayitos: ${rays}/${max}. Siguiente en ${formatRemaining(nextAt)}`
      : `Rayitos: ${rays ?? "–"}/${max}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-muted ${className}`}
      title={title}
    >
      ⚡
      <span className="tabular-nums font-semibold text-white">
        {ready ? `${rays ?? "–"}/${max}` : "…"}
      </span>
    </span>
  );
}

/** "en 42 min" o "en 3 h" a partir de un timestamp en ms. */
function formatRemaining(targetMs: number): string {
  const diff = Math.max(0, targetMs - Date.now());
  const minutes = Math.ceil(diff / 60_000);
  if (minutes <= 1) return "menos de 1 min";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.ceil(minutes / 60)} h`;
}
