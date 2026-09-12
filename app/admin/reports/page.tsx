import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReportActions from "@/components/admin/ReportActions";
// La cola debe reflejar el estado real: nada de caché.
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" }, // los más antiguos primero
    include: {
      prompt: {
        select: {
          id: true,
          title: true,
          status: true,
          moderationStatus: true,
        },
      },
      reporter: { select: { name: true, email: true } },
      author: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="glass p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">Reportes pendientes</h2>
        <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-bold tabular-nums">
          {reports.length}
        </span>
      </div>

      {reports.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No hay reportes pendientes. 🎉
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-white/10">
          {reports.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/prompt/${r.prompt.id}`}
                  className="font-bold transition-colors hover:text-secondary"
                >
                  {r.prompt.title}
                </Link>

                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                  {r.prompt.status !== "PUBLISHED" && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted">
                      {r.prompt.status}
                    </span>
                  )}
                  {r.prompt.moderationStatus !== "OK" && (
                    <span className="rounded-full bg-yellow-brand/15 px-2 py-0.5 text-yellow-brand">
                      {r.prompt.moderationStatus}
                    </span>
                  )}
                  <span className="text-muted">
                    Reportado por {r.reporter.name ?? r.reporter.email}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-muted">
                    Autor: {r.author.name ?? r.author.email}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-muted">{formatDate(r.createdAt)}</span>
                </div>

                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/5 p-3 text-sm text-white/90">
                  {r.reason}
                </p>
              </div>

              <div className="shrink-0">
                <ReportActions reportId={r.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
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
