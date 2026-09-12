"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
}

/**
 * Banner con las notificaciones NO leídas del usuario. Al pulsar una se marca
 * como leída y desaparece del banner (el historial completo queda en la BD).
 */
export default function NotificationBanner() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.ok) setItems(d.notifications ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function markRead(id: string) {
    // Optimista: el banner responde al instante y no espera a la red.
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // Si falla, la notificación sigue sin leer en la BD y volverá a salir.
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {items.map((n) => (
        <div
          key={n.id}
          className={`glass flex flex-col gap-5 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between ${boxClass(n.type)}`}
        >
          <div className="min-w-0">
            <p className={`font-bold ${titleClass(n.type)}`}>
              {n.type === "PREMIUM_APPROVED" ? "✅" : "⚠️"} {n.title}
            </p>
            <p className="mt-1 text-sm text-white/85">{n.message}</p>
            <p className="mt-1.5 text-xs text-muted">{formatDate(n.createdAt)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {n.link && (
              <Link
                href={n.link}
                onClick={() => markRead(n.id)}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                Ver más
              </Link>
            )}
            <button
              type="button"
              onClick={() => markRead(n.id)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-white"
            >
              Marcar como leída
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// El banner nace para avisos de moderación (rojos). El Premium aprobado es una
// buena noticia y se pinta en verde; el rechazo usa el estilo por defecto y se
// distingue por el motivo que va en el mensaje.
function boxClass(type: string): string {
  return type === "PREMIUM_APPROVED"
    ? "border-secondary/40 bg-secondary/10"
    : "border-red-500/30 bg-red-500/10";
}

function titleClass(type: string): string {
  return type === "PREMIUM_APPROVED" ? "text-secondary" : "text-red-400";
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
