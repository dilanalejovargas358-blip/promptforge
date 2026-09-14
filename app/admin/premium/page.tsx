import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PremiumActions from "@/components/admin/PremiumActions";

// La cola debe reflejar el estado real: nada de caché.
export const dynamic = "force-dynamic";

export default async function AdminPremiumPage() {
  const requests = await prisma.premiumRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" }, // las más recientes primero
    include: {
      user: {
        select: {
          name: true,
          email: true,
          isPremium: true,
        },
      },
    },
  });

  // La página es force-dynamic, así que la antigüedad se calcula al servirla. No
  // se refresca sola: el admin ve los minutos avanzar al recargar.
  const now = Date.now();

  return (
    <div className="glass p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Solicitudes de Premium</h2>
          <p className="mt-1 text-xs text-muted">
            Confirma solo si el pago llegó (QR Bolivia o Binance Pay). Al
            confirmar se activan 30 días y 25 créditos IA.
          </p>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-bold tabular-nums">
          {requests.length}
        </span>
      </div>

      {requests.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No hay solicitudes pendientes. 🎉
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-white/10">
          {requests.map((r) => {
            const mins = minutesSince(r.createdAt, now);
            const late = mins >= 15;
            const urgent = mins >= 60;
            return (
              <li
                key={r.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-bold">{r.user.name ?? r.user.email}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted">{r.user.email}</span>
                    <span className="text-muted">·</span>
                    <span className="text-muted">{formatDate(r.createdAt)}</span>
                    <span className="text-muted">·</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 font-semibold text-white/80">
                      {r.method === "binance" ? "Binance ₿" : "QR Bolivia 🇧🇴"}
                    </span>
                    <span className="text-muted">·</span>
                    <span
                      className={late ? "font-semibold text-red-400" : "text-muted"}
                    >
                      Esperando hace {formatElapsed(mins)}
                    </span>
                    {urgent && (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-bold text-red-400">
                        ⚠️ Urgente
                      </span>
                    )}
                    {r.user.isPremium && (
                      <span className="rounded-full bg-yellow-brand/15 px-2 py-0.5 text-yellow-brand">
                        ⚠️ ya es Premium
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <PremiumActions requestId={r.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/admin"
        className="mt-6 inline-block text-sm text-muted transition-colors hover:text-white"
      >
        ← Volver al panel
      </Link>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function minutesSince(date: Date, now: number): number {
  return Math.floor((now - date.getTime()) / 60000);
}

/** "23 min", "2 h 5 min"… para que el admin priorice de un vistazo. */
function formatElapsed(mins: number): string {
  if (mins < 1) return "menos de 1 min";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
