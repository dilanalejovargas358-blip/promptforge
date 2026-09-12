import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Índice del panel: antes redirigía a /admin/reports. Ahora muestra las dos
// colas para que un admin vea de un vistazo qué tiene pendiente.
export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const premiumRequests = await prisma.premiumRequest.count({
    where: { status: "PENDING" },
  });
  const reports = await prisma.report.count({ where: { status: "PENDING" } });

  const queues = [
    {
      href: "/admin/premium",
      title: "Solicitudes Premium",
      detail: "Pagos por QR (Bolivia) esperando confirmación",
      count: premiumRequests,
    },
    {
      href: "/admin/reports",
      title: "Reportes pendientes",
      detail: "Prompts reportados por la comunidad",
      count: reports,
    },
    {
      href: "/admin/config",
      title: "Configuración",
      detail: "Precio de Premium, tipo de cambio y QR de pago",
      count: null,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {queues.map((q) => (
        <Link
          key={q.href}
          href={q.href}
          className="glass p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/40"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold">{q.title}</h2>
            {q.count !== null && (
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold tabular-nums ${
                  q.count > 0
                    ? "bg-red-500/15 text-red-400"
                    : "bg-white/5 text-muted"
                }`}
              >
                {q.count}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted">{q.detail}</p>
          <span className="mt-4 inline-block text-sm text-secondary">
            Abrir →
          </span>
        </Link>
      ))}
    </div>
  );
}
