import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Ranking de Creadores",
  description: "Los creadores que más créditos reciben por sus prompts en PromptForge.",
};

// Se recalcula en cada visita para reflejar los apoyos (recientes o históricos).
export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

type Period = "week" | "month" | "all";

// Etiquetas y ventanas (ms) de cada período.
const PERIOD_META: Record<Period, { label: string; lengthMs: number | null }> = {
  week: { label: "Esta semana", lengthMs: 7 * 24 * 3600 * 1000 },
  month: { label: "Este mes", lengthMs: 30 * 24 * 3600 * 1000 },
  all: { label: "Siempre", lengthMs: null },
};

function isPeriod(v: unknown): v is Period {
  return v === "week" || v === "month" || v === "all";
}

interface Row {
  rank: number;
  author: { id: string; name: string | null; image: string | null };
  earned: number;
  promptCount: number;
  // Movimiento de apoyos frente al período anterior (solo week/month). null = no aplica.
  trend: number | null;
}

// Suma de apoyos (EARN por apoyo) por autor dentro de [start, end).
async function supportsBetween(
  start: Date,
  end?: Date
): Promise<Map<string, number>> {
  const agg = await prisma.transaction.groupBy({
    by: ["userId"],
    where: {
      type: "EARN",
      createdAt: end ? { gte: start, lt: end } : { gte: start },
      description: { contains: "Recibiste apoyo" },
    },
    _sum: { amount: true },
  });
  const map = new Map<string, number>();
  for (const a of agg) {
    const sum = a._sum?.amount ?? 0;
    if (sum > 0) map.set(a.userId, sum);
  }
  return map;
}

async function buildRows(period: Period): Promise<Row[]> {
  // ---- "Siempre": suma del totalCredits acumulado de cada creador. ----
  if (period === "all") {
    const ranks = await prisma.prompt.groupBy({
      by: ["authorId"],
      where: { status: "PUBLISHED", moderationStatus: "OK" },
      _sum: { totalCredits: true },
      _count: { _all: true },
      orderBy: { _sum: { totalCredits: "desc" } },
      take: 20,
    });

    const ids = ranks.map((r) => r.authorId);
    const authors = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, image: true },
    });
    const authorMap = new Map(authors.map((a) => [a.id, a]));

    const rows: Row[] = [];
    for (let i = 0; i < ranks.length; i++) {
      const r = ranks[i];
      const author = authorMap.get(r.authorId);
      const earned = r._sum?.totalCredits ?? 0;
      if (!author || earned <= 0) continue;
      rows.push({
        rank: i + 1,
        author,
        earned,
        promptCount: r._count?._all ?? 0,
        trend: null,
      });
    }
    return rows;
  }

  // ---- "Semana"/"Mes": apoyos registrados en la ventana. ----
  const { lengthMs } = PERIOD_META[period];
  const now = Date.now();
  const start = new Date(now - lengthMs!);

  const earnedMap = await supportsBetween(start);
  if (earnedMap.size === 0) return [];

  // Ordenar autores por apoyos en el período.
  const sortedIds = Array.from(earnedMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([id]) => id);

  // Las tres consultas dependen solo de sortedIds, no entre sí: en paralelo.
  const prevStart = new Date(start.getTime() - lengthMs!);
  const [authors, promptCounts, prevMap] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: sortedIds } },
      select: { id: true, name: true, image: true },
    }),
    prisma.prompt.groupBy({
      by: ["authorId"],
      where: {
        authorId: { in: sortedIds },
        status: "PUBLISHED",
        moderationStatus: "OK",
      },
      _count: { _all: true },
    }),
    // Apoyos en el período inmediatamente anterior (para la tendencia ↑/↓).
    supportsBetween(prevStart, start),
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a]));
  const countMap = new Map(promptCounts.map((c) => [c.authorId, c._count._all]));

  const rows: Row[] = [];
  for (let i = 0; i < sortedIds.length; i++) {
    const authorId = sortedIds[i];
    const author = authorMap.get(authorId);
    if (!author) continue;
    const earned = earnedMap.get(authorId)!;
    const prev = prevMap.get(authorId) ?? 0;
    rows.push({
      rank: i + 1,
      author,
      earned,
      promptCount: countMap.get(authorId) ?? 0,
      trend: earned - prev,
    });
  }
  return rows;
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const period: Period = isPeriod(searchParams.period) ? searchParams.period : "all";
  const rows = await buildRows(period);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />

      <div className="relative mx-auto max-w-3xl px-4 py-12 md:px-6">
        <div className="fade-up text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            <span className="gradient-text">Ranking de Creadores</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Los creadores que más apoyos reciben de la comunidad. Apoya sus prompts
            para subirlos en el ranking.
          </p>
        </div>

        {/* Filtros por período */}
        <div className="fade-up mt-6 flex flex-wrap items-center justify-center gap-2">
          {(Object.keys(PERIOD_META) as Period[]).map((p) => (
            <Link
              key={p}
              href={`/ranking?period=${p}`}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                period === p
                  ? "bg-secondary/20 text-secondary"
                  : "bg-white/5 text-muted hover:bg-white/10 hover:text-white"
              }`}
            >
              {PERIOD_META[p].label}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="fade-up glass mx-auto mt-10 max-w-md p-10 text-center text-muted">
            <div className="text-4xl">🏆</div>
            <p className="mt-3 font-semibold">
              {period === "all"
                ? "Aún no hay apoyos registrados. ¡Sé el primero en apoyar!"
                : "Todavía no hay apoyos en este período. ¡Sé el primero en apoyar!"}
            </p>
          </div>
        ) : (
          <ul
            className="fade-up mt-10 space-y-3"
            style={{ animationDelay: "100ms" }}
          >
            {rows.map((row) => {
              const featured = row.rank <= 3;
              const ahead = row.rank > 1 ? rows[row.rank - 2] : undefined;
              const progress = ahead && ahead.earned > 0
                ? Math.min(100, (row.earned / ahead.earned) * 100)
                : 0;

              return (
                <li
                  key={row.author.id}
                  className={`glass flex items-center gap-3 rounded-2xl p-3 transition-all duration-300 hover:border-white/20 sm:gap-4 sm:p-4 ${
                    row.rank === 1 ? "ring-1 ring-yellow-brand/40" : ""
                  }`}
                  style={{ animationDelay: `${row.rank * 80}ms` }}
                >
                  <span className="w-8 shrink-0 text-center text-xl font-black tabular-nums sm:w-10 sm:text-2xl">
                    {MEDALS[row.rank - 1] ?? row.rank}
                  </span>

                  <span className="shrink-0 rounded-full bg-gradient-to-br from-primary via-accent to-secondary p-[2px]">
                    {row.author.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.author.image}
                        alt={row.author.name ?? "Creador"}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1A1A2E] font-bold text-secondary">
                        {row.author.name?.charAt(0) ?? "?"}
                      </span>
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/explore?authorId=${row.author.id}`}
                        className="truncate font-bold transition-colors hover:text-secondary"
                      >
                        {row.author.name ?? "Creador"}
                      </Link>
                      {featured && (
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-brand to-primary px-2.5 py-0.5 text-[11px] font-black text-background shadow">
                          ★ Creador Destacado
                        </span>
                      )}
                      {row.trend != null && row.trend > 0 && (
                        <span className="inline-flex items-center text-xs font-bold text-green-400">
                          ↑ +{row.trend}
                        </span>
                      )}
                      {row.trend != null && row.trend < 0 && (
                        <span className="inline-flex items-center text-xs font-bold text-red-400">
                          ↓ {row.trend}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted">
                      {row.promptCount} prompt{row.promptCount === 1 ? "" : "s"} publicados
                    </div>

                    {/* Barra de progreso hacia el siguiente puesto */}
                    {ahead && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-muted">
                          <span>⚡ {row.earned}</span>
                          <span>⚡ {ahead.earned}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-secondary to-accent transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xl font-black text-secondary tabular-nums">
                      ⚡ {row.earned}
                    </div>
                    <div className="text-[11px] uppercase text-muted">
                      apoyos
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
